"use strict";

/**
 * OpenRouter provider integration.
 *
 * Endpoint: GET https://openrouter.ai/api/v1/models
 *   Documented at https://openrouter.ai/docs/api-reference/list-available-models
 *   Public — no API key required. Verified live 2026-10-16: HTTP 200,
 *   `{ data: Model[] }` with 465 entries.
 *
 * Observed response fields (kept verbatim where they carry meaning):
 *   id                     exact model id, e.g. "moondream/moondream3-preview"
 *   canonical_slug         version-pinned id when the publisher supplies one
 *   name                   display name
 *   created                unix seconds
 *   description            free text
 *   context_length         max prompt tokens, or null
 *   architecture.modality  e.g. "text+image->text"
 *   architecture.input_modalities / output_modalities
 *   pricing.prompt         USD per token, STRING (not number)
 *   pricing.completion     USD per token, STRING (not number)
 *   supported_parameters[] request features the endpoint supports
 *   top_provider.max_completion_tokens
 *
 * Design rules honoured here:
 *   - a price the API does not state is null, never 0
 *   - the exact provider model id is preserved and never rewritten
 *   - a failed run leaves the previous catalog untouched
 */

const fs = require("node:fs");
const path = require("node:path");

const { fetchJson } = require("./lib/http");
const { writeEnvelopeIfChanged, readJson, slugify } = require("./lib/io");
const {
  SCHEMA_VERSION,
  createModel,
  unknownPrice,
  perTokenToPerMillion,
  validateEnvelope,
} = require("./lib/schema");
const log = require("./lib/log");

const PROVIDER_ID = "openrouter";
const ENDPOINT = "https://openrouter.ai/api/v1/models";
const DEFAULT_OUTPUT = path.resolve(__dirname, "..", "data", "openrouter.json");

/**
 * Maps OpenRouter `supported_parameters` onto stable capability slugs.
 * Unknown values are preserved verbatim in `raw` rather than dropped.
 */
const CAPABILITY_MAP = new Map([
  ["tools", "tools"],
  ["response_format", "structured_output"],
  ["structured_outputs", "structured_output"],
  ["reasoning", "reasoning"],
  ["include_reasoning", "reasoning"],
  ["seed", "deterministic"],
  ["logprobs", "logprobs"],
  ["top_logprobs", "logprobs"],
  ["temperature", "sampling"],
  ["top_p", "sampling"],
  ["top_k", "sampling"],
]);

/**
 * Normalises one OpenRouter model record.
 * Exported for unit tests; performs no IO.
 */
function normalizeModel(raw, observedAt) {
  const exactId = String(raw?.id ?? "").trim();
  if (!exactId) {
    return { error: "missing id" };
  }

  const architecture = raw.architecture ?? {};
  const inputModalities = toStringArray(architecture.input_modalities);
  const outputModalities = toStringArray(architecture.output_modalities);

  const pricing = toPricing(raw.pricing);
  const contextWindow = toPositiveInt(raw.context_length ?? raw.top_provider?.context_length);

  const model = createModel({
    id: slugify(exactId) || slugify(exactId.replace("/", "-")),
    name: String(raw.name ?? exactId).trim(),
    aliases: [exactId, raw.canonical_slug].filter((v) => typeof v === "string" && v.trim()),
    provider: inferProvider(exactId),
    description: typeof raw.description === "string" && raw.description.trim() ? raw.description.trim() : null,
    capabilities: normalizeCapabilities(raw.supported_parameters),
    modalities: { input: inputModalities, output: outputModalities },
    pricing,
    context_window: contextWindow,
  });

  model.availability[PROVIDER_ID] = {
    available: true,
    model_id: exactId,
    observed_at: observedAt,
  };

  model.provenance.push({
    source: PROVIDER_ID,
    observed_at: observedAt,
    ref: `https://openrouter.ai/${exactId}`,
  });

  return { model };
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((v) => typeof v === "string").map((v) => v.trim().toLowerCase()))]
    .filter(Boolean)
    .sort();
}

/** Positive integer or null. 0, negatives and non-numbers are all "unknown". */
function toPositiveInt(value) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

/**
 * OpenRouter returns prices as decimal strings per token.
 * A missing or unparseable value stays null — never 0.
 */
function toPricing(rawPricing) {
  const base = unknownPrice();
  if (!rawPricing || typeof rawPricing !== "object") return base;

  const input = perTokenToPerMillion(rawPricing.prompt);
  const output = perTokenToPerMillion(rawPricing.completion);

  if (input === null && output === null) return base;

  return {
    currency: "USD",
    input_per_1m_usd: input,
    output_per_1m_usd: output,
    // Verbatim source string, so a consumer can always see what was published.
    raw: `${rawPricing.prompt ?? "?"}/${rawPricing.completion ?? "?"} per token`,
  };
}

function normalizeCapabilities(supportedParameters) {
  if (!Array.isArray(supportedParameters)) return [];
  const capabilities = new Set();
  for (const parameter of supportedParameters) {
    const mapped = CAPABILITY_MAP.get(parameter);
    if (mapped) capabilities.add(mapped);
  }
  return [...capabilities].sort();
}

/**
 * "meta-llama/llama-3.1-8b-instruct" -> "Meta".
 *
 * A display-level attribution only. OpenRouter routes to many underlying
 * vendors, so this must never be treated as authoritative provider identity —
 * the exact id in `availability.openrouter.model_id` is the real key.
 */
function inferProvider(exactId) {
  const [namespace] = exactId.split("/");
  if (!namespace || namespace === exactId) return null;
  return namespace
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Fetches the catalog and writes data/openrouter.json.
 *
 * On any failure the previous file is left exactly as it was and the function
 * returns { ok: false }. Callers decide whether that is fatal.
 */
async function sync({ output = DEFAULT_OUTPUT, fetchImpl, timeoutMs, retries, force = false } = {}) {
  let fetched;
  try {
    log.info(`OpenRouter: GET ${ENDPOINT}`);
    fetched = await fetchJson(ENDPOINT, { fetchImpl, timeoutMs, retries });
  } catch (error) {
    log.error(`OpenRouter fetch failed: ${error.message}`);
    return handleFailure(output, error, force);
  }

  const payload = fetched.data;
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.data)) {
    log.error("OpenRouter returned a payload without a `data` array — refusing to overwrite.");
    return handleFailure(output, new Error("malformed response: missing data[]"), force);
  }

  const observedAt = fetched.fetchedAt;
  const models = [];
  const rejected = [];

  for (const raw of payload.data) {
    // One malformed row must not discard the other 464. Reject, record, continue.
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

  // OpenRouter can legitimately list the same id twice during a rollout; keep
  // the first and report the rest rather than silently dropping data.
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
        rejected.length || duplicates.length
          ? `${rejected.length} rejected, ${duplicates.length} duplicate ids collapsed`
          : null,
    },
    count: unique.size,
    models: [...unique.values()].sort((a, b) => a.id.localeCompare(b.id)),
    diagnostics: {
      raw_count: payload.data.length,
      accepted: models.length,
      rejected,
      duplicate_ids: duplicates,
      with_pricing: [...unique.values()].filter((m) => m.pricing.input_per_1m_usd !== null).length,
    },
  };

  try {
    validateEnvelope(envelope, "openrouter");
  } catch (error) {
    log.error(`OpenRouter catalog failed validation: ${error.message}`);
    return handleFailure(output, error, force);
  }

  const { changed } = writeEnvelopeIfChanged(output, envelope);

  return {
    ok: true,
    changed,
    status: "ok",
    observedAt,
    count: unique.size,
    rejected,
    output,
  };
}

/**
 * Failure path. Preserves the last valid catalog and reports honestly.
 * Only an explicit `force` may replace it with an empty file, and even then
 * the status records that the data is missing rather than "empty".
 */
function handleFailure(output, error, force) {
  const previous = readJson(output, null);

  if (previous && previous.source) {
    // Mark the file stale in memory only — the on-disk copy stays byte-identical
    // so an unchanged last-known-good catalog never creates a spurious diff.
    const status = { ...previous.source, status: "stale", note: `last successful fetch: ${previous.source.observed_at}; last error: ${error.message}` };
    log.warn(`OpenRouter: keeping last valid catalog (${previous.count} models) — ${error.message}`);
    return { ok: false, changed: false, status: "stale", retained: previous.count, output, error: error.message, source: status };
  }

  if (!force) {
    log.warn(`OpenRouter: no previous catalog to retain and no --force; writing nothing.`);
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

module.exports = {
  PROVIDER_ID,
  ENDPOINT,
  DEFAULT_OUTPUT,
  normalizeModel,
  sync,
  inferProvider,
  toPricing,
  normalizeCapabilities,
};

if (require.main === module) {
  sync().then((result) => {
    if (result.ok) {
      log.ok(`OpenRouter: ${result.count} models (${result.changed ? "updated" : "unchanged"})`);
      process.exit(0);
    }
    log.warn(`OpenRouter: ${result.status} — ${result.error}`);
    // A provider outage must not fail the whole pipeline; the unified builder
    // still runs on whatever last-known-good data exists.
    process.exit(0);
  });
}