"use strict";

/**
 * Deduplication tests.
 *
 * These encode the project's core safety rule: merge only when identity is
 * verifiable. A false merge is far worse than a missed one — it hides a
 * distinct model behind the wrong name and price. Every "must NOT merge" case
 * below is a real failure mode of naive name matching.
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeIdentity,
  isSameIdentity,
  findCandidates,
  identityOf,
  namespacesCompatible,
} = require("../js/build-models");
const { createModel } = require("../js/lib/schema");

/** Builds a provider-backed record. */
function providerModel({ name, provider = "openrouter", modelId, source = provider }) {
  const model = createModel({ id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name });
  model.availability[source] = {
    available: true,
    model_id: modelId ?? name.toLowerCase().replace(/\s+/g, "-"),
    observed_at: "2026-01-01T00:00:00.000Z",
  };
  return model;
}

/** Builds a README-backed record (no provider model id). */
function readmeModel(name) {
  return createModel({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    provenance: [{ source: "readme", observed_at: "2026-01-01T00:00:00.000Z", ref: "README.md#L1" }],
  });
}

test("normalization strips the vendor namespace but keeps version markers", () => {
  assert.equal(normalizeIdentity("openai/gpt-4o"), "gpt 4o");
  assert.equal(normalizeIdentity("GPT-4"), "gpt 4");
  assert.equal(normalizeIdentity("Claude 3.5 Sonnet"), "claude 3.5 sonnet");
  assert.equal(normalizeIdentity("anthropic/claude-3.5-sonnet"), "claude 3.5 sonnet");
});

test("README 'GPT-4' matches OpenRouter 'openai/gpt-4' by identity", () => {
  assert.equal(
    isSameIdentity(readmeModel("GPT-4"), providerModel({ name: "GPT-4", modelId: "openai/gpt-4" })),
    true,
  );
});

test("README 'Claude 3.5 Sonnet' matches OpenRouter's hyphenated id", () => {
  assert.equal(
    isSameIdentity(
      readmeModel("Claude 3.5 Sonnet"),
      providerModel({ name: "Claude 3.5 Sonnet", modelId: "anthropic/claude-3.5-sonnet" }),
    ),
    true,
  );
});

test("punctuation and spacing differences do not block a match", () => {
  assert.equal(
    isSameIdentity(readmeModel("Mistral-Large"), providerModel({ name: "Mistral Large" })),
    true,
  );
});

// ── Cases that must NOT merge ──────────────────────────────────────────────

const SEPARATE_PAIRS = [
  ["GPT-4", "GPT-4 Turbo", "different versions"],
  ["GPT-4o", "GPT-4o mini", "size variants"],
  ["Llama 3 8B", "Llama 3 8B Q4_K_M", "quantisation"],
  ["Mistral Large", "Mistral Large FT 1234", "fine-tune"],
  ["Llama 3.3 70B Instruct", "Llama 3.3 70B Versatile", "served variants"],
  ["DALL-E 3", "DALL-E 2", "different versions"],
  ["Gemini 2.5 Pro", "Gemini 2.5 Flash", "different tiers"],
  ["Whisper Large V3", "Whisper Large V2", "revisions"],
];

for (const [a, b, why] of SEPARATE_PAIRS) {
  test(`does not merge "${a}" with "${b}" (${why})`, () => {
    assert.equal(
      isSameIdentity(readmeModel(a), providerModel({ name: b })),
      false,
      `must not merge: ${a} vs ${b}`,
    );
  });
}

test("two provider ids must agree exactly to merge", () => {
  const openrouter = providerModel({ name: "Claude 3.5 Sonnet", provider: "openrouter", modelId: "anthropic/claude-3.5-sonnet" });
  const groq = providerModel({ name: "Claude 3.5 Sonnet", provider: "groq", source: "groq", modelId: "anthropic/claude-3.5-sonnet" });
  assert.equal(isSameIdentity(openrouter, groq), true, "same exact id from two providers");

  const different = providerModel({ name: "Claude 3.5 Sonnet", provider: "groq", source: "groq", modelId: "anthropic/claude-3.7-sonnet-x" });
  assert.equal(isSameIdentity(openrouter, different), false, "different ids stay separate");
});

test("identical names from conflicting namespaces are not verified", () => {
  const a = providerModel({ name: "Shared Name", modelId: "openai/shared-name" });
  const b = providerModel({ name: "Shared Name", provider: "mistralai", source: "groq", modelId: "mistralai/shared-name" });
  assert.equal(isSameIdentity(a, b), false, "a namespace clash must not merge on name alone");
});

test("known namespace aliases are treated as compatible", () => {
  assert.equal(namespacesCompatible("meta-llama", "llama"), true);
  assert.equal(namespacesCompatible("moonshotai", "moonshot"), true);
  assert.equal(namespacesCompatible("openai", "google"), false);
});

test("identityOf prefers an exact provider id over the display name", () => {
  const model = providerModel({ name: "OpenAI: GPT-4o", modelId: "openai/gpt-4o" });
  const identity = identityOf(model);
  assert.equal(identity.kind, "id");
  assert.equal(identity.value, "openai/gpt-4o");
});

test("a README record with no provider id falls back to the name", () => {
  assert.equal(identityOf(readmeModel("GPT-4")).kind, "name");
});

// ── Candidate detection (review queue only, never a merge) ─────────────────

test("near-misses surface as candidates but are never merged", () => {
  const readme = readmeModel("Mistral Small 5");
  const pool = [
    providerModel({ name: "Mistral Small 3" }),
    providerModel({ name: "Mistral Small 4" }),
  ];

  const candidates = findCandidates(readme, pool);
  assert.ok(candidates.length > 0, "a version-adjacent model should be flagged");
  assert.ok(
    candidates.every((c) => c.score >= 0.82),
    "candidates only clear the high confidence bar",
  );
});

test("containment matches a name-qualified variant", () => {
  const readme = readmeModel("Gemini 2.5 Flash Image");
  const pool = [providerModel({ name: "Gemini 2.5 Flash Image Preview" })];
  const candidates = findCandidates(readme, pool);
  assert.equal(candidates.length, 1);
});

test("unrelated models produce no candidates", () => {
  const readme = readmeModel("Completely Unrelated Thing");
  const pool = [providerModel({ name: "Some Other Model" })];
  assert.deepEqual(findCandidates(readme, pool), []);
});

test("a model is never its own candidate", () => {
  const model = readmeModel("GPT-4");
  assert.deepEqual(findCandidates(model, [model]), []);
});

test("very short names are never fuzzed", () => {
  assert.deepEqual(findCandidates(readmeModel("GPT"), [providerModel({ name: "GPT 4" })]), []);
});