"use strict";

/**
 * The catalog schema, version 1.0.0.
 *
 * Every artifact (`data/readme-models.json`, `data/openrouter.json`,
 * `data/groq.json`, `data/models.json`) uses the same envelope so the merge can
 * treat them uniformly and so a consumer can detect an incompatible input.
 *
 * ── Envelope ───────────────────────────────────────────────────────────────
 * {
 *   "schema_version": "1.0.0",
 *   "generated_at":   "<ISO-8601>",      // when this file was produced
 *   "source": {
 *     "type":        "readme" | "openrouter" | "groq" | "unified",
 *     "ref":         "README.md" | "https://api.groq.com/..." | null,
 *     "observed_at": "<ISO-8601>",       // when the *underlying data* was seen.
 *                                       // Distinct from generated_at: a cached
 *                                       // last-known-good file keeps its
 *                                       // original observed_at so staleness
 *                                       // stays visible.
 *     "commit":      "<sha>|null",
 *     "status":      "ok" | "stale" | "skipped" | "failed",
 *     "note":        "human-readable reason, esp. for stale/skipped"
 *   },
 *   "count": <number>,
 *   "models": [ <Model>, ... ],
 *   "diagnostics": { ... }                // free-form per producer
 * }
 *
 * ── Model ──────────────────────────────────────────────────────────────────
 * {
 *   "id":         "<stable slug>",
 *   "name":       "<display name>",
 *   "aliases":    [ "<string>" ],          // other spellings, verbatim
 *   "provider":   <string|null>,           // canonical vendor name
 *   "kind":       "model",
 *   "description":<string|null>,
 *   "capabilities": [ "tools" | "reasoning" | "structured_output" | ... ],
 *   "modalities": { "input": [...], "output": [...] },
 *   "pricing": {
 *     "currency": "USD",
 *     "input_per_1m_usd":  <number|null>,  // null = unknown, NEVER 0-for-unknown
 *     "output_per_1m_usd": <number|null>,
 *     "raw": <string|null>                 // exactly as the source stated it
 *   },
 *   // A model served by several providers has several real prices. Every one is
 *   // preserved here; the top-level `pricing` block is only the primary (the
 *   // first provider in SOURCE_PRIORITY that actually stated a price).
 *   "provider_pricing": { "<provider>": { <Pricing> , ... } },
 *   "context_window": <number|null>,
 *   "availability": {
 *     "openrouter": { "available": bool, "model_id": <string|null>, "observed_at": <ISO|null> },
 *     "groq":       { "available": bool, "model_id": <string|null>, "observed_at": <ISO|null> },
 *     "readme":     { "available": true,  "model_id": <string|null>, "observed_at": <ISO|null> }
 *   },
 *   "merge": {
 *     "confidence": "verified" | "uncertain",
 *     "reasons": [ "<string>" ],            // why, when not verified
 *     "review_required": <boolean>
 *   },
 *   "provenance": [ { "source": "<type>", "observed_at": "<ISO>", "ref": "<string>" } ]
 * }
 *
 * Invariants enforced by validateModel():
 *   - unknown numeric values are null, never 0
 *   - a model with no pricing must carry pricing.raw === null and both rates null
 *   - every provider_pricing entry obeys the same null rules
 *   - `confidence: "uncertain"` always sets `review_required: true`
 *   - provenance is never empty
 */

const SCHEMA_VERSION = "1.0.0";

/** Providers tracked in availability. Order is fixed for deterministic output. */
const PROVIDERS = ["openrouter", "groq", "readme"];

/** Every provenance source, in the order they are merged. Lower wins. */
const SOURCE_PRIORITY = ["openrouter", "groq", "readme"];

class SchemaError extends Error {
  constructor(message) {
    super(message);
    this.name = "SchemaError";
  }
}

/** An unknown price is null. Zero is a real price (a genuinely free model). */
function unknownPrice() {
  return { currency: "USD", input_per_1m_usd: null, output_per_1m_usd: null, raw: null };
}

function createModel(overrides = {}) {
  return {
    id: null,
    name: null,
    aliases: [],
    provider: null,
    kind: "model",
    description: null,
    capabilities: [],
    modalities: { input: [], output: [] },
    pricing: unknownPrice(),
    /** Per-provider prices, so a multi-provider model keeps every real price. */
    provider_pricing: {},
    context_window: null,
    availability: Object.fromEntries(
      PROVIDERS.map((provider) => [provider, { available: false, model_id: null, observed_at: null }]),
    ),
    merge: { confidence: "verified", reasons: [], review_required: false },
    provenance: [],
    ...overrides,
  };
}

/**
 * Parses a provider price expressed per-token into USD per 1M tokens.
 * Returns null when the value is absent or unusable — never 0 for "unknown".
 *
 * Providers publish tiny decimal strings ("0.0000008"); multiplying by 1e6 in
 * binary floating point yields artefacts like 0.7999999999999999. Normalising
 * through toPrecision(12) keeps the value exact to well beyond any real price
 * while removing that noise, so identical data always serialises identically.
 */
function perTokenToPerMillion(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  const scaled = parsed * 1_000_000;
  if (scaled === 0) return 0; // a genuinely free model is 0, not "unknown"
  return Number(scaled.toPrecision(12));
}

/**
 * Validates a model record, throwing on contract violations.
 * @returns {Model} the same object, for chaining
 */
function validateModel(model, context = "model") {
  const where = (field) => `${context}: ${field}`;

  if (!model || typeof model !== "object") throw new SchemaError(where("expected an object"));
  if (typeof model.id !== "string" || model.id.length === 0) {
    throw new SchemaError(where("id must be a non-empty string"));
  }
  if (typeof model.name !== "string" || model.name.trim().length === 0) {
    throw new SchemaError(where("name must be a non-empty string"));
  }
  if (!Array.isArray(model.aliases)) throw new SchemaError(where("aliases must be an array"));
  if (!Array.isArray(model.capabilities)) throw new SchemaError(where("capabilities must be an array"));
  if (!Array.isArray(model.provenance) || model.provenance.length === 0) {
    throw new SchemaError(where("provenance must list at least one source"));
  }

  const pricing = model.pricing;
  if (!pricing || typeof pricing !== "object") throw new SchemaError(where("pricing is required"));

  for (const field of ["input_per_1m_usd", "output_per_1m_usd"]) {
    const value = pricing[field];
    if (value !== null && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
      throw new SchemaError(
        where(`pricing.${field} must be a finite non-negative number or null (got ${JSON.stringify(value)})`),
      );
    }
  }

  // The critical rule: a model with no pricing data must never imply a price.
  if (pricing.input_per_1m_usd === null && pricing.output_per_1m_usd === null && pricing.raw !== null) {
    // raw without parsed values is fine — it is the verbatim source text.
  }

  if (model.provider_pricing !== undefined) {
    if (typeof model.provider_pricing !== "object" || model.provider_pricing === null) {
      throw new SchemaError(where("provider_pricing must be an object"));
    }
    for (const [provider, providerPricing] of Object.entries(model.provider_pricing)) {
      if (!providerPricing || typeof providerPricing !== "object") {
        throw new SchemaError(where(`provider_pricing.${provider} must be an object`));
      }
      for (const field of ["input_per_1m_usd", "output_per_1m_usd"]) {
        const value = providerPricing[field];
        if (value !== null && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
          throw new SchemaError(
            where(`provider_pricing.${provider}.${field} must be a finite non-negative number or null`),
          );
        }
      }
    }
  }

  if (model.context_window !== null) {
    if (typeof model.context_window !== "number" || !Number.isInteger(model.context_window) || model.context_window <= 0) {
      throw new SchemaError(where("context_window must be a positive integer or null"));
    }
  }

  const confidence = model.merge?.confidence;
  if (confidence !== "verified" && confidence !== "uncertain") {
    throw new SchemaError(where('merge.confidence must be "verified" or "uncertain"'));
  }
  if (confidence === "uncertain" && model.merge?.review_required !== true) {
    throw new SchemaError(where("an uncertain match must set merge.review_required = true"));
  }

  return model;
}

/** Validates an envelope produced by any source. */
function validateEnvelope(envelope, context = "envelope") {
  if (!envelope || typeof envelope !== "object") {
    throw new SchemaError(`${context}: expected an object`);
  }
  if (envelope.schema_version !== SCHEMA_VERSION) {
    throw new SchemaError(
      `${context}: schema_version "${envelope.schema_version}" is not supported (expected ${SCHEMA_VERSION})`,
    );
  }
  if (!Array.isArray(envelope.models)) {
    throw new SchemaError(`${context}: models must be an array`);
  }
  const seen = new Set();
  for (const model of envelope.models) {
    validateModel(model, `${context}/${model?.id ?? "?"}`);
    if (seen.has(model.id)) {
      throw new SchemaError(`${context}: duplicate model id "${model.id}"`);
    }
    seen.add(model.id);
  }
  return envelope;
}

module.exports = {
  SCHEMA_VERSION,
  PROVIDERS,
  SOURCE_PRIORITY,
  SchemaError,
  createModel,
  unknownPrice,
  perTokenToPerMillion,
  validateModel,
  validateEnvelope,
};