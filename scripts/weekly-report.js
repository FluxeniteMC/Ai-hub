#!/usr/bin/env node
/**
 * 📊 Weekly AI API Report Generator
 * Uses Gemini to generate a curated weekly digest of AI API news
 *
 * Usage: node scripts/weekly-report.js
 * Env: GEMINI_API_KEY
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is required");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function generateWeeklyReport() {
  const readme = fs.readFileSync(path.join(process.cwd(), "README.md"), "utf8");
  const weekStr = new Date().toISOString().split("T")[0];

  const prompt = `You are the editor of a weekly AI API newsletter. Generate a comprehensive weekly report in Markdown format.

Today's date: ${weekStr}

The report should include:
1. **🔥 Trending This Week** - 3-5 hot AI APIs developers are talking about
2. **💰 Pricing Changes** - Any notable pricing updates in the AI space
3. **🆕 New APIs Launched** - Recently launched APIs (based on your knowledge through early 2025)
4. **📉 Deprecated / Sunset** - Any APIs shut down recently
5. **💡 API of the Week** - Spotlight one underrated API
6. **📈 Category Trends** - What categories are growing (LLMs, Image, Audio, Video, etc.)
7. **🛠️ Developer Tips** - 2-3 practical tips for working with AI APIs

Current directory has these API categories: LLMs, Image Generation, Audio & Speech, Video Generation, Embeddings, Code Generation, Multimodal, Domain-Specific.

Format the report as clean Markdown with emojis. Make it informative and opinionated.
Keep it under 1000 words.
Start with: # 📊 Weekly AI API Report — ${weekStr}`;

  console.log("📊 Generating weekly report with Gemini...");
  const result = await model.generateContent(prompt);
  const report = result.response.text();

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
