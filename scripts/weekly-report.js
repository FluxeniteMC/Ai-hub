#!/usr/bin/env node
/**
 * 📊 AI API Report Generator — v2.0
 * Uses Gemini to generate a curated digest of AI API news.
 * v2.0: supports DAILY cadence (REPORT_PERIOD=daily, default) as well as
 * weekly. The GitHub Actions cron now runs this every day.
 *
 * Usage: node scripts/weekly-report.js
 * Env: GEMINI_API_KEY, REPORT_PERIOD (daily|weekly)
 */

let ai;
try {
  const { GoogleGenAI } = require("@google/genai");
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
} catch (e) {
  console.error("❌ @google/genai is not installed. Run: npm install @google/genai");
  process.exit(1);
}

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const fs = require("fs");
const path = require("path");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const REPORT_PERIOD = (process.env.REPORT_PERIOD || "daily").toLowerCase();
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is required");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

async function generateWeeklyReport() {
  const readme = fs.readFileSync(path.join(process.cwd(), "README.md"), "utf8");
  const weekStr = new Date().toISOString().split("T")[0];

  const cadence = REPORT_PERIOD === "weekly" ? "weekly AI API newsletter" : "daily AI API digest";
  const prompt = `You are the editor of a ${cadence}. Generate a comprehensive ${REPORT_PERIOD} report in Markdown format.

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
  const result = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
  const report = result.text;

  const reportsDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  fs.writeFileSync(path.join(reportsDir, "weekly-report.md"), report);
  console.log("✅ Report saved to reports/weekly-report.md");
  return report;
}

generateWeeklyReport().catch((e) => {
  console.error("❌ Failed:", e.message);
  process.exit(1);
});
