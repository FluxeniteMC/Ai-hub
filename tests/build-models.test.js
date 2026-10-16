"use strict";

/**
 * Catalog build tests: field precedence, last-known-good retention and
 * no-change behaviour.
 *
 * `build()` accepts an injected `sources` resolver, so these tests never read
 * the repository's real data files and never hit the network.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { build } = require("../js/build-models");
const { createModel, SCHEMA_VERSION } = require("../js/lib/schema");

function tempOutput() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aicatalog-build-"));
  return path.join(dir, "models.json");
}

function envelope(sourceType, models, status = "ok") {
  return {
    envelope: {
      schema_version: SCHEMA_VERSION,
      generated_at: "2026-01-01T00:00:00.000Z",
      source: { type: sourceType, observed_at: "2026-01-01T00:00:00.000Z", status },
      count: models.length,
      models,
    },
    status,
    count: models.length,
  };
}

const missing = { type: "missing", envelope: null, status: "missing", count: 0 };

function providerModel({ name, provider, modelId, pricing, contextWindow = null }) {
  const model = createModel({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    pricing: pricing ?? { currency: "USD", input_per_1m_usd: null, output_per_1m_usd: null, raw: null },
    context_window: contextWindow,
  });
  model.availability[provider] = {
    available: true,
    model_id: modelId ?? name,
    observed_at: "2026-01-01T00:00:00.000Z",
  };
  model.provenance.push({ source: provider, observed_at: "2026-01-01T00:00:00.000Z", ref: modelId ?? name });
  return model;
}

function readmeModel(name, overrides = {}) {
  return createModel({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    provenance: [{ source: "readme", observed_at: "2026-01-01T00:00:00.000Z", ref: "README.md#L1" }],
    ...overrides,
  });
}

// ── Missing / stale sources ────────────────────────────────────────────────

test("a missing provider source does not stop the build", () => {
  const result = build({
    output: tempOutput(),
    sources: (type) => (type === "groq" ? missing : envelope(type, [])),
  });

  assert.equal(result.envelope.count, 0);
  assert.equal(result.envelope.diagnostics.sources.groq.status, "missing");
});

test("a stale source is used and its staleness is recorded", () => {
  const stale = providerModel({ name: "Old Model", provider: "groq", modelId: "old-model" });
  const result = build({
    output: tempOutput(),
    sources: (type) => (type === "groq" ? envelope("groq", [stale], "stale") : missing),
  });

  assert.equal(result.envelope.diagnostics.sources.groq.status, "stale");
  assert.equal(result.envelope.count, 1, "last known good data is still used");
  assert.match(result.envelope.source.note, /groq stale/);
});

test("a source with an unsupported schema version is skipped", () => {
  const result = build({
    output: tempOutput(),
    sources: (type) =>
      type === "openrouter"
        ? {
            envelope: { schema_version: "99.0.0", models: [] },
            status: "schema-mismatch",
            count: 0,
          }
        : missing,
  });

  assert.equal(result.envelope.diagnostics.sources.openrouter.status, "schema-mismatch");
  assert.equal(result.envelope.count, 0);
});

// ── Field precedence ────────────────────────────────────────────────────────

test("provider pricing overrides README pricing for the same identity", () => {
  const fromProvider = providerModel({
    name: "GPT-4",
    provider: "openrouter",
    modelId: "openai/gpt-4",
    pricing: { currency: "USD", input_per_1m_usd: 30, output_per_1m_usd: 60, raw: "live" },
  });
  const fromReadme = readmeModel("GPT-4", {
    pricing: { currency: "USD", input_per_1m_usd: 29, output_per_1m_usd: 59, raw: "stale" },
  });

  const { envelope: built } = build({
    output: tempOutput(),
    sources: (type) =>
      type === "openrouter"
        ? envelope("openrouter", [fromProvider])
        : type === "readme"
          ? envelope("readme", [fromReadme])
          : missing,
  });

  assert.equal(built.count, 1, "one canonical record, not two");
  assert.equal(built.models[0].pricing.input_per_1m_usd, 30, "the API is newer than prose");
});

test("README fills a provider-controlled field the API left unstated", () => {
  const fromProvider = providerModel({ name: "GPT-4", provider: "openrouter", modelId: "openai/gpt-4" });
  const fromReadme = readmeModel("GPT-4", {
    description: "Fourth generation flagship",
    context_window: 8192,
    aliases: ["GPT-4"],
  });

  const { envelope: built } = build({
    output: tempOutput(),
    sources: (type) =>
      type === "openrouter"
        ? envelope("openrouter", [fromProvider])
        : type === "readme"
          ? envelope("readme", [fromReadme])
          : missing,
  });

  const model = built.models[0];
  assert.equal(model.description, "Fourth generation flagship", "README supplies description");
  assert.equal(model.context_window, 8192, "README supplies context the API omitted");
  assert.ok(model.availability.openrouter.available);
});

test("a model offered by both providers carries both exact ids", () => {
  const fromOpenRouter = providerModel({ name: "Llama 3.3 70B", provider: "openrouter", modelId: "meta-llama/llama-3.3-70b-instruct" });
  const fromGroq = providerModel({ name: "Llama 3.3 70B", provider: "groq", modelId: "meta-llama/llama-3.3-70b-versatile" });

  const { envelope: built } = build({
    output: tempOutput(),
    sources: (type) =>
      type === "openrouter"
        ? envelope("openrouter", [fromOpenRouter])
        : type === "groq"
          ? envelope("groq", [fromGroq])
          : missing,
  });

  // Different exact ids, so these are distinct models and must not merge.
  assert.equal(built.count, 2);
});

test("one model served by two providers under the SAME id merges into one", () => {
  const fromOpenRouter = providerModel({ name: "Llama 3.3 70B", provider: "openrouter", modelId: "llama-3.3-70b-versatile" });
  const fromGroq = providerModel({ name: "Llama 3.3 70B", provider: "groq", modelId: "llama-3.3-70b-versatile" });

  const { envelope: built } = build({
    output: tempOutput(),
    sources: (type) =>
      type === "openrouter"
        ? envelope("openrouter", [fromOpenRouter])
        : type === "groq"
          ? envelope("groq", [fromGroq])
          : missing,
  });

  assert.equal(built.count, 1, "the same underlying model is listed once");
  const model = built.models[0];
  assert.equal(model.availability.openrouter.model_id, "llama-3.3-70b-versatile");
  assert.equal(model.availability.groq.model_id, "llama-3.3-70b-versatile");
});

test("a model on two providers keeps BOTH prices", () => {
  const fromOpenRouter = providerModel({
    name: "Shared Model",
    provider: "openrouter",
    modelId: "shared-model",
    pricing: { currency: "USD", input_per_1m_usd: 1.5, output_per_1m_usd: 3, raw: "or:1.5/3" },
  });
  const fromGroq = providerModel({
    name: "Shared Model",
    provider: "groq",
    modelId: "shared-model",
    pricing: { currency: "USD", input_per_1m_usd: 2.5, output_per_1m_usd: 5, raw: "gq:2.5/5" },
  });

  const { envelope: built } = build({
    output: tempOutput(),
    sources: (type) =>
      type === "openrouter"
        ? envelope("openrouter", [fromOpenRouter])
        : type === "groq"
          ? envelope("groq", [fromGroq])
          : missing,
  });

  const model = built.models[0];
  assert.equal(model.provider_pricing.openrouter.input_per_1m_usd, 1.5);
  assert.equal(model.provider_pricing.groq.input_per_1m_usd, 2.5, "Groq's price is not discarded");
  assert.equal(model.pricing.input_per_1m_usd, 1.5, "primary follows source priority");
});

test("a provider that states no price does not clear another provider's", () => {
  const fromOpenRouter = providerModel({
    name: "Shared Model",
    provider: "openrouter",
    modelId: "shared-model",
    pricing: { currency: "USD", input_per_1m_usd: 7, output_per_1m_usd: 7, raw: "7/7" },
  });
  // Groq publishes no pricing on this endpoint.
  const fromGroq = providerModel({ name: "Shared Model", provider: "groq", modelId: "shared-model" });

  const { envelope: built } = build({
    output: tempOutput(),
    sources: (type) =>
      type === "openrouter"
        ? envelope("openrouter", [fromOpenRouter])
        : type === "groq"
          ? envelope("groq", [fromGroq])
          : missing,
  });

  const model = built.models[0];
  assert.equal(model.pricing.input_per_1m_usd, 7, "an unknown price never overwrites a known one");
  assert.equal(model.provider_pricing.groq.input_per_1m_usd, null, "Groq's slot stays explicitly unknown");
});

// ── README-only records ────────────────────────────────────────────────────

test("a README-only model stays discoverable without claiming availability", () => {
  const { envelope: built } = build({
    output: tempOutput(),
    sources: (type) => (type === "readme" ? envelope("readme", [readmeModel("Local Whisper")]) : missing),
  });

  const model = built.models[0];
  assert.equal(built.count, 1);
  assert.equal(model.availability.readme.available, true);
  assert.equal(model.availability.openrouter.available, false, "must not claim provider availability");
  assert.equal(model.availability.groq.available, false);
});

test("an unverified match is flagged for review and kept separate", () => {
  const readme = readmeModel("Mistral Small 5");
  const provider = providerModel({ name: "Mistral Small 4", provider: "groq", modelId: "mistral-small-4" });

  const { envelope: built, reviewQueue } = build({
    output: tempOutput(),
    sources: (type) =>
      type === "readme"
        ? envelope("readme", [readme])
        : type === "groq"
          ? envelope("groq", [provider])
          : missing,
  });

  assert.equal(built.count, 2, "kept separate, never merged on a guess");
  assert.equal(reviewQueue.length, 1);
  assert.equal(reviewQueue[0].name, "Mistral Small 5");

  const flagged = built.models.find((m) => m.name === "Mistral Small 5");
  assert.equal(flagged.merge.confidence, "uncertain");
  assert.equal(flagged.merge.review_required, true);
  assert.ok(flagged.merge.candidates.length > 0);
  assert.equal(built.diagnostics.uncertain, 1);
});

// ── Determinism and no-change behaviour ────────────────────────────────────

test("the build is deterministic for identical input", () => {
  const sources = (type) =>
    type === "openrouter"
      ? envelope("openrouter", [providerModel({ name: "A", provider: "openrouter", modelId: "a" })])
      : type === "readme"
        ? envelope("readme", [readmeModel("B")])
        : missing;

  const first = build({ output: tempOutput(), sources });
  const second = build({ output: tempOutput(), sources });

  assert.deepEqual(first.envelope.models, second.envelope.models);
});

test("an identical rebuild does not rewrite the file", () => {
  const output = tempOutput();
  const sources = (type) =>
    type === "openrouter"
      ? envelope("openrouter", [providerModel({ name: "A", provider: "openrouter", modelId: "a" })])
      : missing;

  const first = build({ output, sources });
  const before = fs.readFileSync(output, "utf8");
  const second = build({ output, sources });

  assert.equal(first.changed, true);
  assert.equal(second.changed, false, "no data change means no file write");
  assert.equal(fs.readFileSync(output, "utf8"), before, "timestamps are preserved too");
});

test("a real price change does rewrite the file", () => {
  const output = tempOutput();
  const before = { input_per_1m_usd: 1, output_per_1m_usd: 2 };

  build({
    output,
    sources: (type) =>
      type === "openrouter"
        ? envelope("openrouter", [
            providerModel({
              name: "A",
              provider: "openrouter",
              modelId: "a",
              pricing: { currency: "USD", ...before, raw: "r" },
            }),
          ])
        : missing,
  });

  const result = build({
    output,
    sources: (type) =>
      type === "openrouter"
        ? envelope("openrouter", [
            providerModel({
              name: "A",
              provider: "openrouter",
              modelId: "a",
              pricing: { currency: "USD", input_per_1m_usd: 9, output_per_1m_usd: 9, raw: "r" },
            }),
          ])
        : missing,
  });

  assert.equal(result.changed, true, "a genuine price change must be published");
});

test("an unknown price is never converted to zero by the merge", () => {
  const provider = providerModel({ name: "Free Thing", provider: "groq", modelId: "free-thing" });
  const readme = readmeModel("Free Thing", {
    pricing: { currency: "USD", input_per_1m_usd: null, output_per_1m_usd: null, raw: "Free" },
  });

  const { envelope: built } = build({
    output: tempOutput(),
    sources: (type) =>
      type === "groq"
        ? envelope("groq", [provider])
        : type === "readme"
          ? envelope("readme", [readme])
          : missing,
  });

  assert.equal(built.models[0].pricing.input_per_1m_usd, null, "still unknown, still null");
  assert.equal(built.models[0].pricing.output_per_1m_usd, null);
});

test("every emitted model keeps at least one provenance entry", () => {
  const { envelope: built } = build({
    output: tempOutput(),
    sources: (type) =>
      type === "openrouter"
        ? envelope("openrouter", [providerModel({ name: "Prov", provider: "openrouter", modelId: "p" })])
        : type === "readme"
          ? envelope("readme", [readmeModel("Doc")])
          : missing,
  });

  for (const model of built.models) {
    assert.ok(model.provenance.length > 0, `${model.id} has no provenance`);
    for (const entry of model.provenance) {
      assert.ok(entry.source, `${model.id} provenance has no source`);
      assert.ok(entry.observed_at, `${model.id} provenance has no timestamp`);
    }
  }
});

test("model ids are unique in the output", () => {
  const { envelope: built } = build({
    output: tempOutput(),
    sources: (type) =>
      type === "openrouter"
        ? envelope("openrouter", [
            providerModel({ name: "Same Name", provider: "openrouter", modelId: "vendor-a/same" }),
            providerModel({ name: "Same Name", provider: "openrouter", modelId: "vendor-b/same" }),
          ])
        : missing,
  });

  const ids = built.models.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate ids would break routing");
});