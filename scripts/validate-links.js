#!/usr/bin/env node
/**
 * 🔗 Link Validator
 * Extracts all URLs from README.md and checks if they're alive
 *
 * Usage: node scripts/validate-links.js
 */

const fs = require("fs");
const path = require("path");

/**
 * The only statuses that actually prove a page is gone.
 *
 * Everything else non-2xx is reported as "blocked" instead: a 403 is usually a
 * bot shield, a 429 is a rate limit, and a 5xx is the server having a bad day.
 * Filing those as dead links produced false-positive issues that nobody could
 * act on.
 */
const DEAD_STATUSES = new Set([404, 410]);

/** Statuses that mean "ask again later", so they earn a retry. */
const TRANSIENT_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

const RETRY_DELAYS_MS = [0, 1500, 4000];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Turn one probe result into the verdict used by the report.
 *
 * @param {{status: number, ok: boolean, redirected?: boolean}} result
 * @returns {"valid"|"redirect"|"dead"|"blocked"}
 */
function classify(result) {
  if (result.ok) return result.redirected ? "redirect" : "valid";
  return DEAD_STATUSES.has(result.status) ? "dead" : "blocked";
}

/**
 * v2.0 fix: many API marketing sites reject HEAD requests with 405/403.
 * Try HEAD first, fall back to a GET before declaring a link dead.
 *
 * v2.1: retry transient failures (429/5xx/timeouts) with backoff, and keep the
 * final response details so a human can see what actually happened.
 */
async function fetchWithTimeout(url, timeout = 10000, fetchImpl = fetch) {
  const attempt = async (method) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetchImpl(url, {
        signal: controller.signal,
        method,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AI-APIs-Directory-Bot/2.0; +https://github.com/FluxeniteMC/Ai-hub)",
          Accept: "text/html,*/*",
        },
        redirect: "follow",
      });
      clearTimeout(id);
      return {
        status: res.status,
        ok: res.ok,
        redirected: Boolean(res.redirected),
        finalUrl: res.url || url,
      };
    } catch (e) {
      clearTimeout(id);
      return { status: 0, ok: false, redirected: false, error: e.message };
    }
  };

  let last = { status: 0, ok: false, error: "no attempt made" };

  for (let round = 0; round < RETRY_DELAYS_MS.length; round++) {
    if (RETRY_DELAYS_MS[round]) await sleep(RETRY_DELAYS_MS[round]);

    // HEAD first; only fall back to GET when HEAD is refused or unsupported.
    let result = await attempt("HEAD");
    if (!result.ok && (result.status === 405 || result.status === 403 || result.status === 0)) {
      const get = await attempt("GET");
      if (get.ok) result = get;
      // A GET that carries a real status is more informative than a HEAD that
      // only errored, so keep it unless it is worse for classification.
      else if (!get.error || get.status) result = get;
    }

    last = result;
    if (result.ok) break;

    // Only retry what is actually worth retrying.
    const transient = result.status === 0 || TRANSIENT_STATUSES.has(result.status);
    if (!transient) break;
  }

  return { ...last, verdict: classify(last), attempts: RETRY_DELAYS_MS.length };
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

  // The same URL is often linked from many rows. Probing it once is both
  // politer and the only way a dead link shows up once in the report instead
  // of as a dozen identical rows.
  const byUrl = new Map();
  for (const link of links) {
    const existing = byUrl.get(link.url);
    if (existing) {
      existing.references += 1;
      continue;
    }
    byUrl.set(link.url, { ...link, references: 1 });
  }
  const uniqueLinks = [...byUrl.values()];

  console.log(`🔍 Found ${links.length} links (${uniqueLinks.length} unique) to validate...\n`);

  const results = {
    total: links.length,
    unique: uniqueLinks.length,
    valid: 0,
    dead_links: [],
    blocked_links: [],
    redirects: 0,
  };

  for (const link of uniqueLinks) {
    process.stdout.write(`  Checking: ${link.url.substring(0, 60)}... `);
    const result = await fetchWithTimeout(link.url);

    if (result.verdict === "valid" || result.verdict === "redirect") {
      if (result.verdict === "redirect") {
        results.redirects++;
        console.log("↪️  Redirect");
      } else {
        results.valid++;
        console.log("✅ OK");
      }
    } else {
      const entry = {
        name: link.name,
        url: link.url,
        references: link.references,
        status: result.status,
        finalUrl: result.finalUrl || null,
        error: result.error || null,
      };
      if (result.verdict === "dead") {
        results.dead_links.push(entry);
        console.log(`❌ DEAD (${result.status || result.error})`);
      } else {
        // Rate limits, bot shields and server faults. A human decides these,
        // not the workflow.
        results.blocked_links.push(entry);
        console.log(`🚫 BLOCKED (${result.status || result.error}) — not counted as dead`);
      }
    }

    // Respectful delay
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n📊 Results:`);
  console.log(`  ✅ Valid: ${results.valid}`);
  console.log(`  ↪️  Redirects: ${results.redirects}`);
  console.log(`  ❌ Dead: ${results.dead_links.length}`);
  console.log(`  🚫 Blocked (needs a human): ${results.blocked_links.length}`);

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
    fs.appendFileSync(outputFile, `blocked_links_count=${results.blocked_links.length}\n`);
  }

  // v2.0 fix: DO NOT exit(1) here. The previous behaviour aborted the GitHub
  // Actions job, which meant the "Create Issue for Dead Links" step NEVER ran
  // (its non-zero status skipped the follow-up steps). The workflow decides
  // what to do with the report via `steps.validate.outputs.dead_links_count`.
  console.log(
    `ℹ️  ${results.dead_links.length} dead link(s) reported to the workflow (script exits 0).`
  );
}

module.exports = { classify, fetchWithTimeout, DEAD_STATUSES, TRANSIENT_STATUSES };

if (require.main === module) {
  main().catch((e) => {
    console.error("❌ Validation failed:", e.message);
    process.exit(1);
  });
}
