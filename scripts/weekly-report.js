#!/usr/bin/env node
/**
 * 📊 AI API Report Generator — v2.0
 * Uses Gemini to generate a curated digest of AI API news.
 * v2.0: supports DAILY cadence (REPORT_PERIOD=daily, default) as well as
 * weekly. The GitHub Actions cron now runs this every day.
 *
 * Usage: node scripts/weekly-report.js
 * Env: GEMINI_API_KEY, REPORT_PERIOD (daily|weekly)
 *
 * Fix history
 * -----------
 * v2.1: `GEMINI_API_KEY` was referenced by the client constructor several lines
 *       *before* its `const` declaration. That is a temporal dead zone access,
 *       so the script threw a ReferenceError on every run. The surrounding
 *       try/catch then printed "…is not installed", which pointed at a
 *       dependency problem that did not exist.
 *
 * v2.1: Removed a leftover `new GoogleGenerativeAI(...)` /
 *       `getGenerativeModel()` pair. `GoogleGenerativeAI` is not exported by
 *       `@google/genai` (which exports `GoogleGenAI`), so it would have been a
 *       second ReferenceError. Neither was ever used.
 */

const fs = require("fs");
const path = require("path");
const { withRetry } = require("./lib/gemini-retry");

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

const REPORT_PERIOD = (process.env.REPORT_PERIOD || "daily").toLowerCase();

// ── Client construction ──────────────────────────────────────────────────
/**
 * v2.1: previously at module scope, which meant importing this file validated
 * the key and required the SDK as a side effect and could `process.exit(1)`.
 * Deferred so the module is safe to import.
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

async function generateWeeklyReport() {
  const readme = fs.readFileSync(path.join(process.cwd(), "README.md"), "utf8");
  const weekStr = new Date().toISOString().split("T")[0];

  const cadence = REPORT_PERIOD === "weekly" ? "weekly AI API newsletter" : "daily AI API digest";
  // instruction.md is the repository's accuracy ruleset. Loading it here keeps
  // the report from inventing products or presenting guesses as fact.
  let instructions = "";
  try {
    instructions =
      "===== BEGIN instruction.md (authoritative) =====\n" +
      fs.readFileSync(path.join(process.cwd(), "instruction.md"), "utf8").trim() +
      "\n===== END instruction.md =====\n\n";
  } catch {
    instructions = "";
  }

  const prompt = `${instructions}You are the editor of a ${cadence}. Generate a comprehensive ${REPORT_PERIOD} report in Markdown format.

Today's date: ${weekStr}

The report should include:
1. **🔥 Trending Today** - 3-5 hot AI APIs developers are talking about
2. **💰 Pricing Changes** - Any notable pricing updates in the AI space
3. **🆕 New APIs Launched** - Recently launched APIs (use your latest knowledge)
4. **📉 Deprecated / Sunset** - Any APIs shut down recently
5. **💡 API of the Day** - Spotlight one underrated API
6. **📈 Category Trends** - What categories are growing (LLMs, Image, Audio, Video, etc.)
7. **🛠️ Developer Tips** - 2-3 practical tips for working with AI APIs

Current directory has these API categories: LLMs, Image Generation, Audio & Speech, Video Generation, Embeddings, Code Generation, Multimodal, Domain-Specific.

Format the report as clean Markdown with emojis. Make it informative and opinionated.
Keep it under 1000 words.
Start with: # 📊 ${REPORT_PERIOD === "weekly" ? "Weekly" : "Daily"} AI API Report — ${weekStr}`;

  console.log(`📊 Generating ${REPORT_PERIOD} report with Gemini...`);
  const result = await withRetry(
    () =>
      getClient().models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      }),
    { label: `generate ${REPORT_PERIOD} report` }
  );
  const report = result.text;

  const reportsDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  fs.writeFileSync(path.join(reportsDir, "weekly-report.md"), report);
  console.log("✅ Report saved to reports/weekly-report.md");
  return report;
}

if (require.main === module) {
  generateWeeklyReport().catch((e) => {
    console.error("❌ Failed:", e.message);
    process.exit(1);
  });
}

module.exports = { generateWeeklyReport };
