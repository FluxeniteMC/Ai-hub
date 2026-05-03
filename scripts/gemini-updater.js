#!/usr/bin/env node
/**
 * 🤖 Gemini API Updater
 * Automatically updates the AI APIs directory using Google's Gemini API
 * 
 * Usage: node scripts/gemini-updater.js
 * Env: GEMINI_API_KEY, UPDATE_TYPE (all|pricing|new_apis|descriptions)
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const UPDATE_TYPE = process.env.UPDATE_TYPE || "all";

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY environment variable is required");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function loadReadme() {
  const readmePath = path.join(process.cwd(), "README.md");
  return fs.readFileSync(readmePath, "utf8");
}

async function saveReadme(content) {
  const readmePath = path.join(process.cwd(), "README.md");
  fs.writeFileSync(readmePath, content, "utf8");
}

async function updatePricing() {
  console.log("💰 Updating pricing information with Gemini...");

  const readme = await loadReadme();

  const prompt = `You are an AI API pricing expert. Review the following README.md content which lists AI APIs and their pricing.

Your task:
1. Identify any obviously outdated pricing (focus on major providers like OpenAI, Anthropic, Google)
2. The pricing shown uses format: $X.XX per 1M tokens
3. Return ONLY valid updates in this exact JSON format (no markdown, no explanation):

{
  "updates": [
    {
      "provider": "Provider Name",
      "model": "Model Name", 
      "old_input_price": "$X.XX",
      "new_input_price": "$X.XX",
      "old_output_price": "$X.XX", 
      "new_output_price": "$X.XX",
      "confidence": "high|medium|low",
      "note": "brief reason"
    }
  ],
  "summary": "Brief summary of what was updated"
}

README Content (pricing section only):
${readme.substring(readme.indexOf("## 📊"), readme.indexOf("## 🔧"))}

Return only valid JSON, no other text.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse the JSON response
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    const updates = JSON.parse(cleanJson);

    console.log(`✅ Found ${updates.updates.length} pricing updates`);
    console.log(`📝 Summary: ${updates.summary}`);

    // Save update log
    const logDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    const logFile = path.join(
      logDir,
      `pricing-updates-${new Date().toISOString().split("T")[0]}.json`
    );
    fs.writeFileSync(logFile, JSON.stringify(updates, null, 2));

    return updates;
  } catch (e) {
    console.log("⚠️ Pricing update parsing failed:", e.message);
    return { updates: [], summary: "No changes detected" };
  }
}

async function findNewAPIs() {
  console.log("🔍 Searching for new AI APIs with Gemini...");

  const readme = await loadReadme();

  const prompt = `You are an AI researcher tracking new AI APIs. Based on your knowledge up to early 2025, identify any significant AI APIs that might be missing from this directory.

Current README content (to understand what's already listed):
${readme.substring(0, 5000)}...

Return ONLY a JSON object in this exact format:
{
  "new_apis": [
    {
      "name": "API Name",
      "provider": "Company",
      "url": "https://...",
      "category": "LLM|Image|Audio|Video|Embedding|Code|Multimodal|Specialized",
      "tier": "free|freemium|paid|enterprise|open-source",
      "description": "One line description",
      "pricing": "Free | $X/month | Per token",
      "table_row": "| [API Name](url) | Provider | Category | Details | Notes |"
    }
  ],
  "count": 0
}

Focus on APIs released in 2024-2025 that are genuinely useful. Return only JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    const newAPIs = JSON.parse(cleanJson);

    console.log(`✅ Found ${newAPIs.count} potential new APIs`);

    const logDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    const logFile = path.join(
      logDir,
      `new-apis-${new Date().toISOString().split("T")[0]}.json`
    );
    fs.writeFileSync(logFile, JSON.stringify(newAPIs, null, 2));

    return newAPIs;
  } catch (e) {
    console.log("⚠️ New API search failed:", e.message);
    return { new_apis: [], count: 0 };
  }
}

async function checkDeprecations() {
  console.log("🔍 Checking for deprecated APIs...");

  const prompt = `You are an AI API expert. List any AI APIs that were officially shut down or deprecated in 2024 or early 2025.

Return ONLY JSON in this format:
{
  "deprecated": [
    {
      "name": "API Name",
      "provider": "Provider",
      "shutdown_date": "YYYY-MM or approximate",
      "reason": "Brief reason",
      "replacement": "Alternative API or null"
    }
  ]
}

Return only JSON, no other text.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.log("⚠️ Deprecation check failed:", e.message);
    return { deprecated: [] };
  }
}

async function updateLastUpdated(readme) {
  const dateStr = new Date().toISOString().split("T")[0];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = dayNames[new Date().getDay()];
  
  return readme.replace(
    /\*Last auto-updated by Gemini AI on every \w+\*/,
    `*Last auto-updated by Gemini AI on ${dateStr} (${dayName})*`
  );
}

async function main() {
  console.log(`\n🚀 Starting Gemini AI API Directory Updater`);
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🔄 Update Type: ${UPDATE_TYPE}\n`);

  const results = {
    pricing: null,
    new_apis: null,
    deprecated: null,
    timestamp: new Date().toISOString(),
    update_type: UPDATE_TYPE,
  };

  try {
    if (UPDATE_TYPE === "all" || UPDATE_TYPE === "pricing") {
      results.pricing = await updatePricing();
    }

    if (UPDATE_TYPE === "all" || UPDATE_TYPE === "new_apis") {
      results.new_apis = await findNewAPIs();
    }

    if (UPDATE_TYPE === "all") {
      results.deprecated = await checkDeprecations();

      if (results.deprecated.deprecated.length > 0) {
        console.log(
          `⚠️ Found ${results.deprecated.deprecated.length} deprecated APIs:`
        );
        results.deprecated.deprecated.forEach((d) => {
          console.log(`  - ${d.name} (${d.provider}): ${d.reason}`);
        });
      }
    }

    // Update the last-updated date in README
    let readme = await loadReadme();
    readme = await updateLastUpdated(readme);
    await saveReadme(readme);

    // Save full results
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const resultsFile = path.join(
      dataDir,
      `update-${new Date().toISOString().split("T")[0]}.json`
    );
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

    console.log("\n✅ Update complete!");
    console.log(`📁 Results saved to: ${resultsFile}`);

  } catch (error) {
    console.error("\n❌ Update failed:", error.message);
    process.exit(1);
  }
}

main();
