#!/usr/bin/env node
/**
 * 🧠 Gemini README Analyzer
 * Analyzes the README for quality, completeness, and accuracy
 *
 * Usage: node scripts/gemini-analyzer.js
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

  console.log("🧠 Analyzing README with Gemini...");
  const result = await model.generateContent(prompt);
  const analysis = result.response.text();

  const reportsDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const reportFile = path.join(reportsDir, `gemini-analysis-${date}.md`);
  fs.writeFileSync(reportFile, `# 🧠 Gemini Analysis Report — ${date}\n\n${analysis}`);

  console.log(`✅ Analysis saved to: ${reportFile}`);
}

analyzeReadme().catch((e) => {
  console.error("❌ Analysis failed:", e.message);
  process.exit(1);
});
