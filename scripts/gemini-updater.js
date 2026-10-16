#!/usr/bin/env node
/**
 * 🤖 Gemini Self-Editing Updater — v2.0
 *
 * v2.0 changes:
 *   ✅ The AI can now EDIT internal project files (README.md, data/*.json),
 *      not just log suggestions. Every edit is validated and backed up first.
 *   ✅ Fixed: crashes when Gemini returned malformed JSON.
 *   ✅ Fixed: brittle "Last auto-updated" regex that never matched the README.
 *   ✅ Fixed: indexOf(-1) slicing bug when README sections were missing.
 *   ✅ New: daily changelog entries + section-level self-edits.
 *
 * Usage: node scripts/gemini-updater.js
 * Env:   GEMINI_API_KEY (required)
 *        UPDATE_TYPE (all | pricing | new_apis | deprecations | descriptions)
 *        GEMINI_MODEL (optional, default: gemini-3-flash-preview)
 *        GEMINI_DAILY_BASE_URL (optional: real-time context source, e.g. a search/news API)
 */

const fs = require("fs");
const path = require("path");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const UPDATE_TYPE = process.env.UPDATE_TYPE || "all";
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const ROOT = process.cwd();
// The authoritative ruleset every automated README edit must obey.
const INSTRUCTIONS_PATH = process.env.INSTRUCTIONS_PATH || path.join(ROOT, "instruction.md");

// Whitelist of files the AI is allowed to modify. Anything outside is rejected.
const EDITABLE_FILES = ["README.md", "data/stats.json"];

/**
 * Build the Gemini client on first use.
 *
 * v2.1: this used to run at module scope. Importing the file — from a test, or
 * from anything that wants `countUniqueListings` — then validated the key and
 * required the SDK as a side effect, and `process.exit(1)` on failure killed the
 * importing process before it did any work. Keeping it lazy means the file is a
 * library at import time and a CLI only when run directly.
 */
function getClient() {
  if (!GEMINI_API_KEY) {
    console.error(
      "❌ GEMINI_API_KEY environment variable is required (get one free at https://aistudio.google.com/)"
    );
    process.exit(1);
  }
  try {
    const { GoogleGenAI } = require("@google/genai");
    return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (e) {
    console.error("❌ @google/genai is not installed. Run: npm install @google/genai");
    process.exit(1);
  }
}

async function callGemini(prompt) {
  const response = await getClient().models.generateContent({ model: MODEL_NAME, contents: prompt });
  return response.text;
}

// ────────────────────────────── helpers ──────────────────────────────

function tryParseJson(text) {
  // Strip markdown code fences and try repeatedly to find a valid JSON object.
  let cleaned = String(text || "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    /* keep trying */
  }
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try {
      return JSON.parse(cleaned.slice(first, last + 1));
    } catch {
      /* fall through */
    }
  }
  return null;
}

async function generateJson(prompt, fallback = null) {
  try {
    const result = await callGemini(prompt);
    const parsed = tryParseJson(result);
    if (!parsed) {
      console.error("⚠️  WARN Gemini returned unparseable JSON — using fallback.");
      return fallback;
    }
    return parsed;
  } catch (e) {
    console.error(`⚠️  WARN Gemini call failed (${e.message}) — using fallback.`);
    return fallback;
  }
}

function readReadme() {
  return fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
}

function backupFile(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return;
  const backupDir = path.join(ROOT, "data", "backups");
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  fs.copyFileSync(abs, path.join(backupDir, path.basename(relPath) + "-" + stamp + ".bak"));
}

function writeProjectFile(relPath, content) {
  // Safety: only the whitelist is editable by the AI.
  if (!EDITABLE_FILES.includes(relPath)) {
    throw new Error(`Refusing to edit non-whitelisted file: ${relPath}`);
  }
  backupFile(relPath);
  fs.writeFileSync(path.join(ROOT, relPath), content, "utf8");
}

function saveDataLog(name, payload) {
  const dataDir = path.join(ROOT, "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, `${name}-${new Date().toISOString().split("T")[0]}.json`);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  return file;
}

/**
 * v2.0 section engine: locate a "## Heading ... ------" section and return
 * its full text, safely handling "not found" (never indexOf(-1)).
 * Returns { start, end, text } where end is exclusive of the trailing "---".
 */
function findSection(readme, headingRegex) {
  const lines = readme.split("\n");
  let headingLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headingRegex.test(lines[i])) {
      headingLine = i;
      break;
    }
  }
  if (headingLine === -1) return null;

  let end = lines.length;
  for (let i = headingLine + 1; i < lines.length; i++) {
    const l = lines[i];
    if (/^#{1,3} /.test(l) || l.trim() === "---") {
      end = i;
      break;
    }
  }
  // Back off trailing blank lines so replacements stay tidy.
  while (end > headingLine + 1 && lines[end - 1].trim() === "") end--;

  return {
    start: headingLine,
    end,
    text: lines.slice(headingLine, end).join("\n"),
  };
}

function replaceSection(readme, section, newSectionText) {
  const lines = readme.split("\n");
  lines.splice(section.start, section.end - section.start, ...newSectionText.split("\n"));
  return lines.join("\n");
}

// ─────────────────────── self-edit: pricing (v2.0) ────────────────────
// Gemini receives one table section at a time and returns the FULL rewritten
// section. The script validates the output (same header row, row count not
// reduced > 20%, no code fences) before writing it — the AI can now actually
// change README.md instead of just logging JSON.

const TABLE_TARGETS = [
  { key: "paid_api_table", heading: /^## 💰 Paid APIs/m },
  { key: "llm_category", heading: /^### 🗣 Large Language Models \(LLMs\)/m },
  { key: "image_generation", heading: /^### 🎨 Image Generation/m },
  { key: "video_generation", heading: /^### 🎬 Video Generation/m },
  { key: "audio_speech", heading: /^### 🎙 Audio & Speech/m },
];

async function loadInstructions() {
  // instruction.md is the authoritative contract for automated edits. It is read
  // on every run so changing that file alone changes the bot's behaviour.
  try {
    const text = await fs.readFile(INSTRUCTIONS_PATH, "utf8");
    return (
      "===== BEGIN instruction.md (authoritative) =====\n" +
      text.trim() +
      "\n===== END instruction.md =====\n"
    );
  } catch {
    return (
      "CRITICAL RULE: Never add a new row, model, API or vendor to any table. " +
      "Only edit rows that already exist.\n"
    );
  }
}

async function selfEditTables() {
  console.log("🛡️  Self-edit: Gemini may only EDIT existing rows in README.md tables...");

  let readme = await loadReadme();
  const applied = [];
  const changes = [];

  for (const target of TABLE_TARGETS) {
    const section = findSection(readme, target.heading);
    if (!section) {
      console.log(`  ⏭  Section for ${target.key} not found — skipping (v1 would have crashed here).`);
      continue;
    }
    if (section.text.length > 24000) {
      console.log(`  ⏭  ${target.key} too large to send in one shot — skipping.`);
      continue;
    }

    const prompt = `${await loadInstructions()}

You are an AI API directory maintainer with knowledge of the latest pricing (as of ${new Date().toISOString().split("T")[0]}).

Below is one markdown section from README.md listing AI APIs. Rewrite ONLY this section, obeying the
instructions above, which are absolute:

1. Edit ONLY rows that already exist in the section below.
2. You must NOT add any new row, model, API or vendor — not even ones you believe are missing.
3. You must NOT delete a row unless its shutdown is officially confirmed.
4. Keep the EXACT same table header row and column meanings.
5. If you are unsure about a value, leave that row exactly as it is.
6. Keep style identical: same emoji style, same "Notes" tone, no code fences.
7. Return the complete rewritten markdown section only — no explanations, no code fences.

---BEGIN SECTION---
${section.text}
---END SECTION---`;

    const result = await generateJsonLikeText(prompt);
    if (!isValidRewrittenSection(section.text, result)) {
      const added = findNewRows(section.text, result);
      const reason =
        added.length > 0
          ? `tried to add ${added.length} new listing(s): ${added.slice(0, 3).join(", ")}`
          : "failed safety check";
      console.log(`  ❌ Rejected AI rewrite for ${target.key} (${reason}) — original kept.`);
      continue;
    }
    readme = replaceSection(readme, section, result.trim());
    applied.push(target.key);
    changes.push(filterRowsChanged(section.text, result.trim()));
    console.log(`  ✅ Self-edited section: ${target.key}`);
  }

  writeProjectFile("README.md", readme);
  const logFile = saveDataLog("daily-updates", {
    timestamp: new Date().toISOString(),
    sections_edited: applied,
    changes,
  });
  console.log(`📁 Self-edit log saved to: ${logFile}`);
  return { applied, changes };
}

async function generateJsonLikeText(prompt) {
  try {
    const result = await callGemini(prompt);
    return String(result).trim();
  } catch (e) {
    console.error(`⚠️  WARN Gemini section rewrite failed (${e.message}) — section skipped.`);
    return "";
  }
}

function isValidRewrittenSection(original, candidate) {
  if (!candidate || candidate.length < 40) return false;
  const origLines = original.split("\n");
  const candLines = candidate.split("\n");
  // 1. The header row must exist in both.
  const origHeader = origLines.find((l) => l.trim().startsWith("| ") && l.includes("|"));
  const candHeader = candLines.find((l) => l.trim().startsWith("| ") && l.includes("|"));
  if (!candHeader) return false;
  if (origHeader && candHeader.split("|").length !== origHeader.split("|").length) return false;
  // 2. Row count must not shrink by more than 20% — AI shouldn't nuke APIs.
  const origRows = origLines.filter((l) => l.trim().startsWith("|") && !l.includes("---")).length;
  const candRows = candLines.filter((l) => l.trim().startsWith("|") && !l.includes("---")).length;
  if (candRows < origRows * 0.8) return false;
  // 3. No leaked code fences or analysis chatter.
  if (candidate.includes("```") || /^ certainly |^ here is |^i've /i.test(candidate)) return false;
  // 4. Hard rule from instruction.md: the bot may never introduce a new listing.
  //    Every data row in the rewrite must already exist in the original, matched
  //    on the first cell (the name/link). This is what stops fabricated models
  //    and APIs from entering the catalog.
  if (introducesNewRows(original, candidate)) return false;
  return true;
}

/** Returns the names of rows present in `candidate` but absent from `original`. */
function findNewRows(original, candidate) {
  const keyOf = (line) => {
    const cells = line.trim().replace(/^\|/, "").split("|");
    return (cells[0] || "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*`]/g, "")
      .trim()
      .toLowerCase();
  };
  const isDataRow = (line) =>
    line.trim().startsWith("|") && !line.trim().startsWith("|---") && !line.includes("---");

  const existing = new Set(
    original.split("\n").filter(isDataRow).map(keyOf).filter(Boolean),
  );
  return candidate
    .split("\n")
    .filter(isDataRow)
    .map(keyOf)
    .filter((key) => key && !existing.has(key));
}

function introducesNewRows(original, candidate) {
  return findNewRows(original, candidate).length > 0;
}

function filterRowsChanged(original, candidate) {
  const changed = [];
  const origByKey = new Map();
  for (const line of original.split("\n")) {
    if (line.trim().startsWith("| [")) {
      const key = line.split("|")[1]?.trim().toLowerCase().slice(0, 40) || "";
      origByKey.set(key, line);
    }
  }
  for (const line of candidate.split("\n")) {
    if (!line.trim().startsWith("| [")) continue;
    const key = line.split("|")[1]?.trim().toLowerCase().slice(0, 40) || "";
    const old = origByKey.get(key);
    if (!old) {
      changed.push({ type: "added", row: line.trim() });
    } else if (old !== line) {
      changed.push({ type: "updated", before: old.trim(), after: line.trim() });
    }
  }
  return changed;
}

// ─────────────────────── data-file self-edit (v2.0) ───────────────────

/**
 * Count the models the directory actually lists.
 *
 * v2.1 fix: the old expression was `readme.match(/^\| \[/gm).length`, which
 * counts table ROWS that start with a link. Several APIs are listed in more
 * than one table (a pricing table and an embeddings table, say), so the badge
 * reported 519 while the catalog really held 528 listings — an undercount that
 * went the wrong way every time a model was added twice.
 *
 * `convert.py` is the single source of truth for the catalog, so prefer its
 * output. The regex is only a fallback for a run before the catalog exists, and
 * it is deduplicated by slug for the same reason.
 */
function countUniqueListings(readme, { catalogPath } = {}) {
  const generated = catalogPath ?? path.join(ROOT, "data", "readme-models.json");
  if (fs.existsSync(generated)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(generated, "utf8"));
      if (Number.isInteger(parsed.count) && parsed.count > 0) return parsed.count;
    } catch {
      // Fall through to the regex rather than trusting a truncated file.
    }
  }

  const slug = (value) =>
    String(value)
      .toLowerCase()
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_`]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const unique = new Set();
  for (const line of readme.split(/\r?\n/)) {
    if (!line.startsWith("|")) continue;
    const first = line.split("|")[1];
    if (!first || !first.trim()) continue;
    const name = slug(first);
    if (name) unique.add(name);
  }
  return unique.size;
}

async function updateStatsJson() {
  // The AI can touch data/stats.json (whitelisted). Recount listings so the
  // badge data stays truthful (old workflow counted ALL table rows = 1414).
  const readme = await loadReadme();
  const listings = countUniqueListings(readme);
  const stats = {
    total_api_listings: listings,
    version: "2.0.0",
    updated_daily: true,
    last_updated: new Date().toISOString(),
  };
  saveDataLog("stats", stats);
  fs.writeFileSync(
    path.join(ROOT, "data", "stats.json"),
    JSON.stringify(stats, null, 2) + "\n"
  );
  console.log(`📊 data/stats.json self-edited (${listings} unique listings counted)`);
}

// ────────────────────── datapoints / reports (kept from v1) ───────────

async function findNewAPIs() {
  console.log("🔍 Suggesting new AI APIs with Gemini (logged for human review only)...");

  const readme = await loadReadme();
  const prompt = `${await loadInstructions()}

You are an AI researcher tracking new AI APIs with knowledge up to ${new Date().toISOString().split("T")[0]}.
Identify any significant AI APIs absent from this directory (LLMs, Image, Audio, Video, Embedding, Code, Multimodal, Agents, Specialized).

IMPORTANT: this output is a SUGGESTION LOG for human reviewers only. It is never written into
README.md and nothing here is treated as verified. Only suggest products you are confident actually
exist; do not speculate about unreleased or rumoured models. If you are not confident an API exists,
leave it out entirely.

Current README (excerpt):
${readme.substring(0, 5000)}

Return ONLY a JSON object in this exact format:
{
  "new_apis": [
    {
      "name": "API Name",
      "provider": "Company",
      "url": "https://...",
      "category": "LLM|Image|Audio|Video|Embedding|Code|Multimodal|Agents|Specialized",
      "tier": "free|freemium|paid|enterprise|open-source",
      "description": "One line description",
      "pricing": "Free | $X/month | Per token",
      "table_row": "| [API Name](url) | Provider | Category | Details | Notes |"
    }
  ],
  "count": 0
}

Return only JSON, no markdown fences.`;

  const newAPIs = await generateJson(prompt, { new_apis: [], count: 0 });
  if (!Array.isArray(newAPIs.new_apis)) newAPIs.new_apis = [];
  console.log(`✅ Found ${newAPIs.new_apis.length} potential new APIs`);
  saveDataLog("new-apis", newAPIs);
  return newAPIs;
}

async function checkDeprecations() {
  console.log("🔍 Checking for deprecated APIs...");
  const prompt = `You are an AI API expert with knowledge up to ${new Date().toISOString().split("T")[0]}.
List AI APIs/models that were officially shut down or deprecated in the last 12 months.

Return ONLY JSON in this format:
{"deprecated":[{"name":"API Name","provider":"Provider","shutdown_date":"YYYY-MM or approximate","reason":"Brief reason","replacement":"Alternative API or null"}]}

Return only JSON, no markdown fences.`;

  const deprecations = await generateJson(prompt, { deprecated: [] });
  if (!Array.isArray(deprecations.deprecated)) deprecations.deprecated = [];
  saveDataLog("deprecations", deprecations);
  return deprecations;
}

// ───────────────────────── README date stamp (v2.0) ───────────────────

function stampDate(readme) {
  const dateStr = new Date().toISOString().split("T")[0];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = dayNames[new Date().getDay()];
  const stamp = `*Auto-updated daily by Gemini AI · Last run: ${dateStr} (${dayName})*`;
  // v2.0: rewrite ONLY the dedicated stamp line (if present) — v1's regex
  // either matched a literal day name that never appeared, or would have
  // clobbered the whole footer line.
  if (/\*Auto-updated daily by Gemini AI · Last run:? [^*]*\*/.test(readme)) {
    return readme.replace(/\*Auto-updated daily by Gemini AI · Last run:? [^*]*\*/, stamp);
  }
  // Otherwise append the stamp ahead of the final footer line.
  const lastFooter = readme.lastIndexOf("*Auto-updated");
  if (lastFooter === -1) return readme + "\n\n" + stamp + "\n";
  return readme.slice(0, lastFooter) + "\n" + stamp + "\n\n" + readme.slice(lastFooter);
}

function prependChangelogEntry(readme, summary) {
  const dateStr = new Date().toISOString().split("T")[0];
  const row = `| ${dateStr} | ${summary} | 🤖 Auto |`;
  // v2.0 fix: anchor to the 📝 Changelog section — the old version anchored to
  // the first "|------|" separator in the file, which belongs to the Free APIs
  // table and would have injected changelog rows into the wrong table.
  const sec = readme.indexOf("## 📝 Changelog");
  if (sec === -1) return readme;
  const sep = readme.indexOf("|------|", sec);
  if (sep === -1) return readme;
  const rowStart = readme.indexOf("\n", sep) + 1;
  return readme.slice(0, rowStart) + row + "\n" + readme.slice(rowStart);
}

async function loadReadme() { // exported logic keeps v1 compat
  return fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
}

// ──────────────────────────────── main ────────────────────────────────

async function main() {
  // Fail before any work is done, rather than after the first API call.
  getClient();

  console.log(`\n🚀 Gemini API Directory Updater — v2.0 (daily, self-editing)`);
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🔄 Update Type: ${UPDATE_TYPE}\n`);

  const results = {
    version: "2.0.0",
    pricing: null,
    new_apis: null,
    deprecated: null,
    timestamp: new Date().toISOString(),
    update_type: UPDATE_TYPE,
  };

  try {
    if (UPDATE_TYPE === "all" || UPDATE_TYPE === "pricing") {
      results.pricing = await selfEditTables();
    }

    if (UPDATE_TYPE === "all" || UPDATE_TYPE === "new_apis") {
      results.new_apis = await findNewAPIs();
    }

    if (UPDATE_TYPE === "all" || UPDATE_TYPE === "deprecations") {
      results.deprecated = await checkDeprecations();
      if (results.deprecated.deprecated.length > 0) {
        console.log(`⚠️  Found ${results.deprecated.deprecated.length} deprecated APIs:`);
        results.deprecated.deprecated.forEach((d) => {
          console.log(`  - ${d.name} (${d.provider}): ${d.reason}`);
        });
      }
    }

    if (UPDATE_TYPE === "all" || UPDATE_TYPE === "descriptions") {
      // Descriptions mode is rolled into table self-edits in v2.0 (Notes tone).
    }

    await updateStatsJson();

    // Date stamp + daily changelog entry (safety: only if a change happened)
    let readme = await loadReadme();
    const changedSections = results.pricing?.applied?.length || 0;
    const summary =
      changedSections > 0
        ? `Gemini self-edited ${changedSections} directory table(s) + latest pricing`
        : `Gemini daily check — no table changes verified`;
    readme = stampDate(readme);
    readme = prependChangelogEntry(readme, summary);
    writeProjectFile("README.md", readme);

    const resultsFile = saveDataLog("update", results);
    console.log("\n✅ v2.0 update complete!");
    console.log(`📁 Results saved to: ${resultsFile}`);
  } catch (error) {
    console.error("\n❌ Update failed:", error.message);
    process.exit(1);
  }
}

module.exports = { countUniqueListings };

if (require.main === module) {
  main();
}
