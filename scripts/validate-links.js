#!/usr/bin/env node
/**
 * 🔗 Link Validator
 * Extracts all URLs from README.md and checks if they're alive
 *
 * Usage: node scripts/validate-links.js
 */

const fs = require("fs");
const path = require("path");

async function fetchWithTimeout(url, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      method: "HEAD",
      headers: { "User-Agent": "Mozilla/5.0 AI-APIs-Directory-Bot/1.0" },
      redirect: "follow",
    });
    clearTimeout(id);
    return { status: res.status, ok: res.ok, redirected: res.redirected };
  } catch (e) {
    clearTimeout(id);
    return { status: 0, ok: false, error: e.message };
  }
}

async function main() {
  const readmePath = path.join(process.cwd(), "README.md");
  const readme = fs.readFileSync(readmePath, "utf8");

  // Extract all markdown links
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(readme)) !== null) {
    links.push({ name: match[1], url: match[2] });
  }

  console.log(`🔍 Found ${links.length} links to validate...\n`);

  const results = { total: links.length, valid: 0, dead_links: [], redirects: 0 };

  for (const link of links) {
    process.stdout.write(`  Checking: ${link.url.substring(0, 60)}... `);
    const result = await fetchWithTimeout(link.url);

    if (result.ok) {
      if (result.redirected) {
        results.redirects++;
        console.log("↪️  Redirect");
      } else {
        results.valid++;
        console.log("✅ OK");
      }
    } else {
      results.dead_links.push({
        name: link.name,
        url: link.url,
        status: result.status,
        error: result.error || null,
      });
      console.log(`❌ DEAD (${result.status || result.error})`);
    }

    // Respectful delay
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n📊 Results:`);
  console.log(`  ✅ Valid: ${results.valid}`);
  console.log(`  ↪️  Redirects: ${results.redirects}`);
  console.log(`  ❌ Dead: ${results.dead_links.length}`);

  // Save report
  const reportsDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const date = new Date().toISOString().split("T")[0];
  const reportFile = path.join(reportsDir, `link-validation-${date}.json`);
  const latestFile = path.join(reportsDir, "latest-validation.json");

  fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
  fs.writeFileSync(latestFile, JSON.stringify(results, null, 2));

  console.log(`\n📁 Report saved to: ${reportFile}`);

  // Set outputs for GitHub Actions
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    fs.appendFileSync(outputFile, `dead_links_count=${results.dead_links.length}\n`);
  }

  if (results.dead_links.length > 0) {
    process.exit(1); // Signal failure for GH Actions
  }
}

main().catch((e) => {
  console.error("❌ Validation failed:", e.message);
  process.exit(1);
});
