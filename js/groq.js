"use strict";

/**
 * Groq provider integration.
 *
 * Endpoint: GET https://api.groq.com/openai/v1/models
 *   Documented at https://console.groq.com/docs/api-reference
 *   Auth:     Authorization: Bearer $GROQ_API_KEY   (required — verified HTTP 401
 *             without a key on 2026-10-16)
 *   Response: OpenAI-compatible list shape:
 *             { "object": "list", "data": [ { "id", "object", "created", "owned_by" } ] }
 *
 * The list endpoint is deliberately minimal. Groq publishes context length,
 * rate limits and deprecation state on its /openai/v1/models/{id} endpoint and
 * in console docs, not here — so this module records exactly what the API
 * returned and leaves everything else null. It never fills a gap from memory.
 *
 * In particular: **no pricing**. Groq does not return price on this endpoint,
 * so every price field stays null. Zero would assert "this model is free",
 * which is a claim we cannot support. Callers must treat null as "not stated".
 *
 * Without GROQ_API_KEY the sync is reported as `skipped`, and any previously
 * fetched catalog is left completely untouched.
 */

const fs = require("node:fs");
const path = require("node:path");

const { fetchJson } = require("./lib/http");
const { writeEnvelopeIfChanged, readJson, slugify } = require("./lib/io");
const {
  SCHEMA_VERSION,
  createModel,
  unknownPrice,
  validateEnvelope,
} = require("./lib/schema");
const log = require("./lib/log");

const PROVIDER_ID = "groq";
const ENDPOINT = "https://api.groq.com/openai/v1/models";
const DEFAULT_OUTPUT = path.resolve(__dirname, "..", "data", "groq.json");

/**
 * Groq production model families. Used only to derive a display name from the
 * exact id — never to decide availability or capability.
 */
const DISPLAY_NAMES = new Map([
  ["llama", "Llama"],
  ["mixtral", "Mixtral"],
  ["gemma", "Gemma"],
  ["qwen", "Qwen"],
  ["deepseek", "DeepSeek"],
  ["kimi", "Kimi"],
  ["openai", "OpenAI"],
  ["moonshotai", "Moonshot"],
  ["meta-llama", "Meta Llama"],
]);

/**
 * Normalises one Groq record. Exported for unit tests; performs no IO.
 * Returns { error } instead of throwing so a single bad row cannot abort a run.
 */
function normalizeModel(raw, observedAt) {
  const exactId = String(raw?.id ?? "").trim();
  if (!exactId) return { error: "missing id" };

  // created is unix seconds; ignore 0 and impossible values.
  const created = Number(raw.created);
  const createdIso =
    Number.isFinite(created) && created > 0 ? new Date(created * 1000).toISOString() : null;

  const model = createModel({
    id: slugify(exactId),
    name: displayName(exactId),
    aliases: [exactId],
    provider: inferProvider(exactId, raw.owned_by),
    description: null,
    capabilities: [],
    modalities: { input: [], output: [] },
    // Explicitly unknown. Not free, not zero — simply not returned by this API.
    pricing: unknownPrice(),
    context_window: null,
  });

  model.availability[PROVIDER_ID] = {
    available: true,
    model_id: exactId,
    observed_at: observedAt,
  };

  model.provenance.push({
    source: PROVIDER_ID,
    observed_at: observedAt,
    ref: `https://api.groq.com/openai/v1/models/${exactId}`,
  });

  // Retained on the record rather than dropped: useful provenance, not a price.
  model.availability[PROVIDER_ID].created_at = createdIso;
  model.availability[PROVIDER_ID].owned_by = typeof raw.owned_by === "string" ? raw.owned_by : null;

  return { model };
}

/**
 * "llama-3.3-70b-versatile" -> "Llama 3.3 70b Versatile"
 *
 * Purely cosmetic: a readable label derived from the exact id. Splitting on
 * "-" and "_" only, so "3.3" survives intact, and leaving size markers like
 * "70b" alone rather than reformatting a number the provider published.
 */
function displayName(exactId) {
  const withoutPrefix = exactId.includes("/") ? exactId.slice(exactId.indexOf("/") + 1) : exactId;
  const parts = withoutPrefix.split(/[-_]/).filter(Boolean);
  if (parts.length === 0) return exactId;

  return parts
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index === 0 && DISPLAY_NAMES.has(lower)) return DISPLAY_NAMES.get(lower);
      // Numeric or size markers ("3.3", "70b", "405b") are left exactly as published.
      if (/^[\d.]+[a-z]?$/.test(lower)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

/**
 * Groq ids are prefixed (`llama`, `openai/...`, `moonshotai/...`). The prefix
 * is a family, not necessarily the publisher, so this is a display hint only.
 */
function inferProvider(exactId, ownedBy) {
  if (typeof ownedBy === "string" && ownedBy.trim()) {
    const cleaned = ownedBy.trim();
    if (cleaned.toLowerCase() !== "groq") {
      return cleaned
        .split(/[-_\s]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }
  }

  const prefix = exactId.includes("/") ? exactId.slice(0, exactId.indexOf("/")) : null;
  if (!prefix) return "Groq";
  if (DISPLAY_NAMES.has(prefix.toLowerCase())) return DISPLAY_NAMES.get(prefix.toLowerCase());
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

/**
 * Fetches the catalog and writes data/groq.json.
 *
 * @returns {{ok: boolean, status: 'ok'|'stale'|'skipped'|'failed', ...}}
 */
async function sync({
  output = DEFAULT_OUTPUT,
  apiKey = process.env.GROQ_API_KEY,
  fetchImpl,
  timeoutMs,
  retries,
  force = false,
} = {}) {
  if (!apiKey) {
    const previous = readJson(output, null);
    log.skip("Groq: GROQ_API_KEY not set — skipping fetch.");
    if (previous) {
      log.warn(`Groq: keeping existing catalog (${previous.count} models) from ${previous.source?.observed_at}.`);
      return {
        ok: false,
        changed: false,
        status: "skipped",
        retained: previous.count,
        output,
        error: "GROQ_API_KEY not set",
      };
    }
    return { ok: false, changed: false, status: "skipped", retained: 0, output, error: "GROQ_API_KEY not set" };
  }

  let fetched;
  try {
    log.info(`Groq: GET ${ENDPOINT}`);
    fetched = await fetchJson(ENDPOINT, {
      headers: { authorization: `Bearer ${apiKey}` },
      fetchImpl,
      timeoutMs,
      retries,
    });
  } catch (error) {
    log.error(`Groq fetch failed: ${error.message}`);
    return handleFailure(output, error, force);
  }

  const payload = fetched.data;
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.data)) {
    log.error("Groq returned a payload without a `data` array — refusing to overwrite.");
    return handleFailure(output, new Error("malformed response: missing data[]"), force);
  }

  const observedAt = fetched.fetchedAt;
  const models = [];
  const rejected = [];

  for (const raw of payload.data) {
    // One malformed row must not discard the whole catalog. Reject, record, continue.
    let result;
    try {
      result = normalizeModel(raw, observedAt);
    } catch (error) {
      rejected.push({ id: raw?.id ?? null, reason: `unexpected: ${error.message}` });
      continue;
    }
    if (result.error) {
      rejected.push({ id: raw?.id ?? null, reason: result.error });
      continue;
    }
    models.push(result.model);
  }

  const unique = new Map();
  const duplicates = [];
  for (const model of models) {
    if (unique.has(model.id)) {
      duplicates.push(model.id);
      continue;
    }
    unique.set(model.id, model);
  }

  const envelope = {
    schema_version: SCHEMA_VERSION,
    generated_at: new Date().toISOString(),
    source: {
      type: PROVIDER_ID,
      ref: ENDPOINT,
      observed_at: observedAt,
      commit: null,
      status: "ok",
      note:
        "This endpoint returns ids only; pricing and context length are not published here and remain null.",
    },
    count: unique.size,
    models: [...unique.values()].sort((a, b) => a.id.localeCompare(b.id)),
    diagnostics: {
      raw_count: payload.data.length,
      accepted: models.length,
      rejected,
      duplicate_ids: duplicates,
      with_pricing: 0,
      pricing_note: "Groq /models publishes no pricing; all price fields are null by design.",
    },
  };

  try {
    validateEnvelope(envelope, "groq");
  } catch (error) {
    log.error(`Groq catalog failed validation: ${error.message}`);
    return handleFailure(output, error, force);
  }

  const { changed } = writeEnvelopeIfChanged(output, envelope);

  return { ok: true, changed, status: "ok", observedAt, count: unique.size, rejected, output };
}

/** Failure path: preserve the last valid catalog, never publish an empty one. */
function handleFailure(output, error, force) {
  const previous = readJson(output, null);

  if (previous && previous.source) {
    const status = {
      ...previous.source,
      status: "stale",
      note: `last successful fetch: ${previous.source.observed_at}; last error: ${error.message}`,
    };
    log.warn(`Groq: keeping last valid catalog (${previous.count} models) — ${error.message}`);
    return {
      ok: false,
      changed: false,
      status: "stale",
      retained: previous.count,
      output,
      error: error.message,
      source: status,
    };
  }

  if (!force) {
    log.warn("Groq: no previous catalog to retain and no --force; writing nothing.");
    return { ok: false, changed: false, status: "failed", retained: 0, output, error: error.message };
  }

  const envelope = {
    schema_version: SCHEMA_VERSION,
    generated_at: new Date().toISOString(),
    source: {
      type: PROVIDER_ID,
      ref: ENDPOINT,
      observed_at: null,
      commit: null,
      status: "failed",
      note: `forced empty catalog after failure: ${error.message}`,
    },
    count: 0,
    models: [],
    diagnostics: { error: error.message },
  };
  const { changed } = writeEnvelopeIfChanged(output, envelope);
  return { ok: false, changed, status: "failed", retained: 0, output, error: error.message };
}

module.exports = { PROVIDER_ID, ENDPOINT, DEFAULT_OUTPUT, normalizeModel, sync, displayName };

if (require.main === module) {
  sync().then((result) => {
    if (result.ok) {
      log.ok(`Groq: ${result.count} models (${result.changed ? "updated" : "unchanged"})`);
      process.exit(0);
    }
    log.warn(`Groq: ${result.status}${result.error ? ` — ${result.error}` : ""}`);
    process.exit(0);
  });
}