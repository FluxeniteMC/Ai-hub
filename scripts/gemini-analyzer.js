#!/usr/bin/env node
/**
 * 🧠 Gemini README Analyzer
 *
 * Analyzes the README for quality, completeness and accuracy.
 *
 * Usage: node scripts/gemini-analyzer.js
 * Env:   GEMINI_API_KEY (required)
 *        GEMINI_MODEL    (optional)
 *
 * Fix history
 * -----------
 * v2.1: Removed a leftover `new GoogleGenerativeAI(...)` / `getGenerativeModel()`
 *       pair. `GoogleGenerativeAI` was never imported (the SDK is `@google/genai`,
 *       which exports `GoogleGenAI`), so the script threw a ReferenceError at
 *       module load and could never reach its own generateContent call.
 *
 * v2.1: The API key is now validated *before* the client is constructed. Building
 *       the client first meant a missing key surfaced as
 *       "…is not installed", which sent people looking for a dependency problem
 *       that did not exist.
 */

const fs = require("fs");
const path = require("path");
const { withRetry } = require("./lib/gemini-retry");

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

// ── Client construction ──────────────────────────────────────────────────
/**
 * v2.1: this block used to run at module scope. That made merely importing the
 * file validate the key, require the SDK, and `process.exit(1)` on failure —
 * so any importer (a test runner, another script) died before doing its own
 * work. It now happens only when the analysis actually runs.
 */
function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is required (get one at https://aistudio.google.com/)");
    process.exit(1);
  }

  try {
    const { GoogleGenAI } = require("@google/genai");
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    // Distinguish "the package is missing" from "the package failed to load".
    let missing = false;
    try {
      require.resolve("@google/genai");
    } catch {
      missing = true;
    }
    console.error(
      missing
        ? "❌ @google/genai is not installed. Run: npm install"
        : `❌ @google/genai failed to load: ${error.message}`,
    );
    process.exit(1);
  }
}

async function analyzeReadme() {
  const readme = fs.readFileSync(path.join(process.cwd(), "README.md"), "utf8");
  const date = new Date().toISOString().split("T")[0];

  const prompt = `You are a senior AI API researcher reviewing a community-maintained directory of AI APIs.

Analyze this README.md and produce a quality analysis report in Markdown format covering:

1. **✅ Completeness Score** (out of 10) — Are major providers covered?
2. **🔍 Missing Notable APIs** — List up to 10 important APIs that are missing
3. **⚠️ Potentially Outdated Info** — Identify entries that likely have stale pricing or info
4. **📊 Category Balance** — Is there good coverage across LLM / Image / Audio / Video / Embedding?
5. **🏆 Quality Highlights** — What's well done in this directory?
6. **🔧 Improvement Suggestions** — Top 5 actionable improvements

README content (first 8000 chars):
${readme.substring(0, 8000)}

Return a structured Markdown report. Be specific and actionable.`;

  console.log(`🧠 Analyzing README with ${MODEL_NAME}...`);

  const result = await withRetry(
    () =>
      getClient().models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      }),
    { label: "analyze README" }
  );
  const analysis = result?.text;

  if (typeof analysis !== "string" || analysis.trim() === "") {
    throw new Error("Gemini returned no text");
  }

  const reportsDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const reportFile = path.join(reportsDir, `gemini-analysis-${date}.md`);
  fs.writeFileSync(reportFile, `# 🧠 Gemini Analysis Report — ${date}\n\n${analysis}\n`);

  console.log(`✅ Analysis saved to: ${reportFile}`);
  return reportFile;
}

if (require.main === module) {
  analyzeReadme().catch((e) => {
    console.error("❌ Analysis failed:", e.message);
    process.exit(1);
  });
}

module.exports = { analyzeReadme };