"use strict";

/**
 * Schema contract tests.
 *
 * The central invariant: an unknown price is null. Zero asserts a real,
 * stated price of zero. If these drift, the catalog starts lying about cost,
 * which is the exact failure this project exists to prevent.
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  SCHEMA_VERSION,
  createModel,
  unknownPrice,
  perTokenToPerMillion,
  validateModel,
  validateEnvelope,
  SchemaError,
} = require("../js/lib/schema");
const { stableStringify, slugify } = require("../js/lib/io");

function validModel(overrides = {}) {
  return createModel({
    id: "example-model",
    name: "Example Model",
    provenance: [{ source: "readme", observed_at: "2026-01-01T00:00:00Z", ref: "README.md#L1" }],
    ...overrides,
  });
}

test("an absent price is null on every rate", () => {
  const model = validModel();
  assert.equal(model.pricing.input_per_1m_usd, null);
  assert.equal(model.pricing.output_per_1m_usd, null);
  assert.equal(model.pricing.raw, null);
});

test("unknownPrice never returns zero", () => {
  const pricing = unknownPrice();
  assert.notEqual(pricing.input_per_1m_usd, 0);
  assert.notEqual(pricing.output_per_1m_usd, 0);
  assert.equal(pricing.input_per_1m_usd, null);
});

test("a stated zero price survives validation", () => {
  const model = validModel({
    pricing: { currency: "USD", input_per_1m_usd: 0, output_per_1m_usd: 0, raw: "Free" },
  });
  assert.doesNotThrow(() => validateModel(model));
  assert.equal(model.pricing.input_per_1m_usd, 0);
});

test("per-token prices convert to per-1M without float noise", () => {
  assert.equal(perTokenToPerMillion("0.0000008"), 0.8);
  assert.equal(perTokenToPerMillion("0.0000016"), 1.6);
  assert.equal(perTokenToPerMillion("0.000003"), 3);
  assert.equal(perTokenToPerMillion(0), 0, "an explicit zero price stays zero");
});

test("an unusable price becomes null, never zero", () => {
  for (const value of ["", null, undefined, "abc", -1, NaN, {}]) {
    assert.equal(perTokenToPerMillion(value), null, `expected null for ${JSON.stringify(value)}`);
  }
});

test("validateModel rejects a negative price", () => {
  const model = validModel({
    pricing: { currency: "USD", input_per_1m_usd: -5, output_per_1m_usd: 1, raw: "-5/1" },
  });
  assert.throws(() => validateModel(model), SchemaError);
});

test("validateModel rejects a non-integer context window", () => {
  assert.throws(() => validateModel(validModel({ context_window: 12.5 })), SchemaError);
  assert.throws(() => validateModel(validModel({ context_window: -1 })), SchemaError);
  assert.doesNotThrow(() => validateModel(validModel({ context_window: 128000 })));
});

test("validateModel requires provenance", () => {
  const model = validModel({ provenance: [] });
  assert.throws(() => validateModel(model), SchemaError);
});

test("an uncertain match must set review_required", () => {
  const model = validModel({ merge: { confidence: "uncertain", reasons: [], review_required: false } });
  assert.throws(() => validateModel(model), SchemaError);

  const flagged = validModel({
    merge: { confidence: "uncertain", reasons: ["possible"], review_required: true },
  });
  assert.doesNotThrow(() => validateModel(flagged));
});

test("validateModel rejects an unknown confidence value", () => {
  const model = validModel({ merge: { confidence: "probably", reasons: [], review_required: true } });
  assert.throws(() => validateModel(model), SchemaError);
});

test("validateEnvelope rejects a schema version mismatch", () => {
  assert.throws(
    () => validateEnvelope({ schema_version: "0.0.1", models: [] }),
    /not supported/,
  );
});

test("validateEnvelope rejects duplicate model ids", () => {
  const envelope = {
    schema_version: SCHEMA_VERSION,
    models: [validModel(), validModel()],
  };
  assert.throws(() => validateEnvelope(envelope), /duplicate model id/);
});

test("stableStringify sorts keys so output is byte-stable", () => {
  const a = stableStringify({ b: 1, a: { d: 2, c: 3 } });
  const b = stableStringify({ a: { c: 3, d: 2 }, b: 1 });
  assert.equal(a, b, "key order must not affect serialisation");
  assert.ok(a.includes('\n  "a"'), "nested objects are indented");
});

test("stableStringify preserves array order", () => {
  assert.equal(stableStringify([3, 1, 2]), stableStringify([3, 1, 2]));
  assert.notEqual(stableStringify([3, 1, 2]), stableStringify([1, 2, 3]));
});

test("stableStringify drops undefined values rather than emitting invalid JSON", () => {
  const text = stableStringify({ a: 1, b: undefined });
  assert.doesNotThrow(() => JSON.parse(text));
});

test("slugify folds accents and punctuation", () => {
  assert.equal(slugify("Mistral Large 3"), "mistral-large-3");
  assert.equal(slugify("Café Whisper É"), "cafe-whisper-e");
  assert.equal(slugify("gpt-4o-mini!"), "gpt-4o-mini");
});