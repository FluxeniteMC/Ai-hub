"use strict";

/**
 * Builds data/models.json from the three source catalogs.
 *
 * Sources:
 *   data/readme-models.json  community-maintained prose, lowest authority
 *   data/openrouter.json     live API, provider-controlled fields
 *   data/groq.json           live API, provider-controlled fields
 *
 * ── Deduplication policy ───────────────────────────────────────────────────
 *
 * Two records are merged ONLY when their underlying identity can be verified:
 *
 *   1. identical provider model id (case-insensitive), or
 *   2. identical normalised name where normalisation strips only the vendor
 *      namespace and punctuation — never digits, version markers or suffixes.
 *
 * Everything else stays separate. Specifically, records are never merged merely
 * because their names look similar, so all of these remain distinct:
 *
 *   gpt-4  vs  gpt-4-turbo  vs  gpt-4o            (versions / revisions)
 *   llama-3-8b  vs  llama-3-8b-q4_k_m             (quantisations)
 *   mistral-large  vs  mistral-large-ft-1234      (fine-tunes)
 *   llama-3.3-70b-instruct  vs  llama-3.3-70b-versatile  (variants)
 *
 * A README record that *looks* like a provider model but cannot be verified is
 * kept as its own entry, flagged `merge.confidence = "uncertain"` and
 * `review_required = true`, with the candidate recorded. It is never merged on
 * a guess.
 *
 * ── Field precedence ───────────────────────────────────────────────────────
 *
 * Provider-controlled fields (pricing, context window, capabilities,
 * modalities, availability) come from the provider API whenever the provider
 * actually states them, because the API is newer than a prose README. README
 * still supplies descriptive fields (description, aliases, sections, notes) and
 * any provider-controlled field the API left null.
 *
 * A missing price is never filled from a different source' price for a
 * *different* deployment; null means "not stated", never zero.
 */

const path = require("node:path");

const { readJson, writeEnvelopeIfChanged, slugify } = require("./lib/io");
const {
  SCHEMA_VERSION,
  PROVIDERS,
  SOURCE_PRIORITY,
  createModel,
  unknownPrice,
  validateEnvelope,
} = require("./lib/schema");
const log = require("./lib/log");

const DATA_DIR = path.resolve(__dirname, "..", "data");
const SOURCES = {
  readme: path.join(DATA_DIR, "readme-models.json"),
  openrouter: path.join(DATA_DIR, "openrouter.json"),
  groq: path.join(DATA_DIR, "groq.json"),
};
const DEFAULT_OUTPUT = path.join(DATA_DIR, "models.json");

/**
 * Vendor namespaces that denote the same organisation. Used only to decide
 * whether two matching names are plausibly the same model.
 */
const NAMESPACE_EQUIVALENTS = [
  new Set(["meta-llama", "llama", "meta"]),
  new Set(["moonshotai", "moonshot", "moonshot-ai"]),
  new Set(["google", "google-deepmind", "gemini"]),
  new Set(["mistralai", "mistral"]),
  new Set(["cohereforai", "cohere"]),
  new Set(["deepseek-ai", "deepseek"]),
  new Set(["openai", "openai-chatgpt"]),
];

/** Splits "meta-llama/llama-3-8b" into { namespace, bare }. */
function splitNamespace(value) {
  const text = String(value ?? "").trim();
  const slash = text.indexOf("/");
  if (slash <= 0) return { namespace: null, bare: text };
  return { namespace: text.slice(0, slash).toLowerCase(), bare: text.slice(slash + 1) };
}

/**
 * Normalises a name for identity comparison.
 *
 * Strips the vendor namespace and normalises punctuation, but deliberately
 * KEEPS digits, dots and hyphen-separated tokens so version, quantisation,
 * fine-tune and variant markers all survive. That is what stops "gpt-4" from
 * merging with "gpt-4-turbo".
 */
function normalizeIdentity(value) {
  const { bare } = splitNamespace(value);
  return bare
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function namespacesCompatible(a, b) {
  if (!a || !b) return true; // README records carry no namespace
  if (a === b) return true;
  return NAMESPACE_EQUIVALENTS.some((group) => group.has(a) && group.has(b));
}

/**
 * Builds the full set of match keys for a record.
 *
 * Keys come from every identifier the record actually states, so an exact id
 * match always wins over a name match.
 */
function matchKeys(model) {
  const keys = new Set();
  const push = (kind, value) => {
    const normalized = normalizeIdentity(value);
    if (normalized) keys.add(`${kind}:${normalized}`);
  };

  push("name", model.name);
  for (const alias of model.aliases ?? []) push("name", alias);

  // Exact provider ids, matched as whole strings.
  for (const provider of PROVIDERS) {
    const modelId = model.availability?.[provider]?.model_id;
    if (typeof modelId === "string" && modelId.trim()) {
      keys.add(`id:${modelId.trim().toLowerCase()}`);
      keys.add(`id:${normalizeIdentity(modelId)}`);
    }
  }

  return keys;
}

/**
 * The identity used to decide whether two records are the same model.
 * Prefers an explicit provider id (verified) over a name match.
 */
function identityOf(model) {
  for (const provider of SOURCE_PRIORITY) {
    const modelId = model.availability?.[provider]?.model_id;
    if (typeof modelId === "string" && modelId.trim()) {
      return { kind: "id", value: modelId.trim().toLowerCase(), namespace: splitNamespace(modelId).namespace };
    }
  }
  return { kind: "name", value: normalizeIdentity(model.name), namespace: null };
}

/** True when `a` and `b` are confidently the same underlying model. */
function isSameIdentity(a, b) {
  const idA = identityOf(a);
  const idB = identityOf(b);

  // Both carry a provider id: those must agree exactly.
  if (idA.kind === "id" && idB.kind === "id") {
    return idA.value === idB.value && namespacesCompatible(idA.namespace, idB.namespace);
  }

  // One side has no provider id (typically README): fall back to the name.
  const nameA = normalizeIdentity(a.name);
  const nameB = normalizeIdentity(b.name);
  if (!nameA || !nameB || nameA !== nameB) return false;

  if (idA.kind === "id" || idB.kind === "id") {
    const withNamespace = idA.kind === "id" ? idA.namespace : idB.namespace;
    const other = idA.kind === "id" ? idB.namespace : idA.namespace;
    return namespacesCompatible(withNamespace, other);
  }
  return true;
}

/**
 * Fuzzy candidates for the review queue.
 *
 * Used only to *flag* a README record as needing review — never to merge.
 * The threshold is deliberately high.
 */
function findCandidates(model, pool, limit = 3) {
  const target = normalizeIdentity(model.name);
  if (target.length < 4) return [];

  const targetTokens = new Set(target.split(" ").filter((t) => t.length > 2));
  const scored = [];

  for (const other of pool) {
    if (other.id === model.id) continue;
    const candidate = normalizeIdentity(other.name);
    if (!candidate) continue;

    let score = 0;
    if (candidate.includes(target) || target.includes(candidate)) {
      // Containment: "claude 3.5 sonnet" vs "claude 3.5 sonnet 20241022".
      score = 0.8 + Math.min(candidate.length, target.length) / 1000;
    } else {
      const otherTokens = new Set(candidate.split(" ").filter((t) => t.length > 2));
      let shared = 0;
      for (const token of targetTokens) if (otherTokens.has(token)) shared += 1;
      const union = targetTokens.size + otherTokens.size - shared;
      score = union === 0 ? 0 : shared / union;
    }

    // High bar: a near-miss is still a miss.
    if (score >= 0.82) scored.push({ id: other.id, name: other.name, score: Number(score.toFixed(3)) });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** True when a pricing block actually states a price. */
function statesPrice(pricing) {
  return Boolean(pricing) && (pricing.input_per_1m_usd !== null || pricing.output_per_1m_usd !== null);
}

/**
 * Records every provider's own price on `target.provider_pricing`, then
 * recomputes the primary `pricing` block from source priority.
 *
 * A model reachable through two providers has two genuinely different prices.
 * Collapsing them to one would misrepresent one of them, so both are kept and
 * the top-level block is explicitly the primary one.
 */
function absorbProviderPricing(target, provider, pricing) {
  if (!pricing) return;
  target.provider_pricing = target.provider_pricing ?? {};
  // The provider's own block is authoritative for its own slot, even when it
  // states no price — that "unknown" is real information.
  target.provider_pricing[provider] = pricing;
  recomputePrimaryPricing(target);
}

function recomputePrimaryPricing(target) {
  for (const provider of SOURCE_PRIORITY) {
    const candidate = target.provider_pricing?.[provider];
    if (statesPrice(candidate)) {
      target.pricing = candidate;
      return;
    }
  }
  // No provider stated a price. Fall back to the README value if it had one,
  // otherwise an explicit unknown. Never zero.
  if (statesPrice(target.pricing)) return;
  if (target.pricing?.raw) return;
  target.pricing = unknownPrice();
}

/** Copies availability and any provider field the API actually stated. */
function mergeProviderFields(target, incoming) {
  for (const provider of PROVIDERS) {
    const source = incoming.availability?.[provider];
    if (source?.available) {
      target.availability[provider] = { ...source };
      absorbProviderPricing(target, provider, incoming.provider_pricing?.[provider] ?? incoming.pricing);
    }
  }

  if (incoming.context_window !== null && incoming.context_window !== undefined) {
    target.context_window = incoming.context_window;
  }
}

/**
 * Fills gaps from a README record. Strictly one-directional: the README may
 * supply a value the provider left unstated, and may never overwrite one the
 * provider stated.
 */
function fillGapsFromReadme(target, readme) {
  if (target.context_window === null && readme.context_window !== null && readme.context_window !== undefined) {
    target.context_window = readme.context_window;
  }

  const targetPricing = target.pricing ?? unknownPrice();
  const readmePricing = readme.pricing ?? unknownPrice();
  if (!statesPrice(targetPricing)) {
    if (statesPrice(readmePricing)) {
      target.pricing = readmePricing;
    } else if (!targetPricing.raw && readmePricing.raw) {
      // Keep the verbatim README text even though no numbers were parseable.
      target.pricing = { ...readmePricing };
    }
  }

  if (readme.availability?.readme?.available) {
    target.availability.readme = { ...readme.availability.readme };
  }

  mergeDescriptiveFields(target, readme);
}

/** Copies descriptive fields only when the target has none. */
function mergeDescriptiveFields(target, incoming) {
  for (const field of ["description", "provider", "url", "tier", "notes"]) {
    if (!target[field] && incoming[field]) target[field] = incoming[field];
  }

  target.aliases = [...new Set([...(target.aliases ?? []), ...(incoming.aliases ?? [])])]
    .filter((alias) => alias && alias !== target.name)
    .sort();

  target.capabilities = [...new Set([...(target.capabilities ?? []), ...(incoming.capabilities ?? [])])].sort();

  target.modalities = {
    input: [...new Set([...(target.modalities?.input ?? []), ...(incoming.modalities?.input ?? [])])].sort(),
    output: [...new Set([...(target.modalities?.output ?? []), ...(incoming.modalities?.output ?? [])])].sort(),
  };

  if (Array.isArray(incoming.sections)) {
    target.sections = [...new Set([...(target.sections ?? []), ...incoming.sections])].sort();
  }
  if (Array.isArray(incoming.occurrences)) {
    target.occurrences = [...(target.occurrences ?? []), ...incoming.occurrences];
  }
  if (incoming.conflicts && Object.keys(incoming.conflicts).length) {
    target.conflicts = { ...(target.conflicts ?? {}), ...incoming.conflicts };
  }
}

function loadSource(type) {
  const file = SOURCES[type];
  const envelope = readJson(file, null);

  if (!envelope) {
    log.warn(`source "${type}" is missing (${path.basename(file)}) — skipping`);
    return { type, envelope: null, status: "missing", count: 0 };
  }
  if (envelope.schema_version !== SCHEMA_VERSION) {
    log.warn(
      `source "${type}" has schema_version ${envelope.schema_version}, expected ${SCHEMA_VERSION} — skipping`,
    );
    return { type, envelope: null, status: "schema-mismatch", count: 0 };
  }
  try {
    validateEnvelope(envelope, type);
  } catch (error) {
    log.error(`source "${type}" failed validation: ${error.message} — skipping`);
    return { type, envelope: null, status: "invalid", count: 0 };
  }

  const status = envelope.source?.status ?? "unknown";
  if (status === "stale" || status === "failed") {
    log.warn(`source "${type}" is ${status}; using its last known good data`);
  }
  return { type, envelope, status, count: envelope.models.length };
}

/**
 * Builds the unified catalog.
 * @returns {{envelope: object, changed: boolean, reviewQueue: Array}}
 */
function build({ output = DEFAULT_OUTPUT, sources = loadSource } = {}) {
  const loaded = Object.fromEntries(
    Object.entries(SOURCES).map(([type]) => [type, sources(type)]),
  );

  const stats = {
    readme: loaded.readme.count,
    openrouter: loaded.openrouter.count,
    groq: loaded.groq.count,
    merged: 0,
    uncertain: 0,
    review_required: 0,
    provider_only: 0,
    readme_only: 0,
  };

  const provenanceStatuses = Object.fromEntries(
    Object.entries(loaded).map(([type, value]) => [type, { status: value.status, count: value.count }]),
  );

  // ── Stage 1: provider records, merged across providers ─────────────────
  const providerModels = (loaded.openrouter.envelope?.models ?? []).map((model) => {
    const copy = { ...model, provider_pricing: {} };
    // Seed each record with its own provider's price before any merging.
    for (const provider of PROVIDERS) {
      if (model.availability?.[provider]?.available) {
        copy.provider_pricing[provider] = model.pricing ?? unknownPrice();
      }
    }
    return copy;
  });
  for (const model of loaded.groq.envelope?.models ?? []) {
    const match = providerModels.find((candidate) => isSameIdentity(candidate, model));
    if (match) {
      mergeProviderFields(match, model);
      mergeDescriptiveFields(match, model);
      match.provenance = [...match.provenance, ...(model.provenance ?? [])];
      match.merge.reasons = [
        ...new Set([...(match.merge.reasons ?? []), `same model offered by groq (${model.availability.groq.model_id})`]),
      ];
      stats.merged += 1;
    } else {
      const copy = { ...model, provider_pricing: {} };
      for (const provider of PROVIDERS) {
        if (model.availability?.[provider]?.available) {
          copy.provider_pricing[provider] = model.pricing ?? unknownPrice();
        }
      }
      providerModels.push(copy);
    }
  }

  // ── Stage 2: README records ────────────────────────────────────────────
  const readmeModels = loaded.readme.envelope?.models ?? [];
  const reviewQueue = [];
  const readmeOnly = [];

  for (const readmeModel of readmeModels) {
    const match = providerModels.find((candidate) => isSameIdentity(candidate, readmeModel));
    if (match) {
      // Provider fields win where stated; README fills only the gaps.
      fillGapsFromReadme(match, readmeModel);
      match.provenance = [...match.provenance, ...(readmeModel.provenance ?? [])];
      match.merge.reasons = [
        ...new Set([...(match.merge.reasons ?? []), `readme entry "${readmeModel.name}" matched by identity`]),
      ];
      stats.merged += 1;
    } else {
      // Not a confident match: keep the README record on its own so it stays
      // discoverable, and never claim it is served by a provider.
      const standalone = { ...readmeModel, availability: structuredClone(readmeModel.availability ?? {}) };
      for (const provider of PROVIDERS) {
        standalone.availability[provider] = { available: false, model_id: null, observed_at: null };
      }
      standalone.availability.readme = {
        available: true,
        model_id: readmeModel.availability?.readme?.model_id ?? null,
        observed_at: readmeModel.availability?.readme?.observed_at ?? null,
      };

      const candidates = findCandidates(readmeModel, providerModels);
      if (candidates.length > 0) {
        standalone.merge = {
          confidence: "uncertain",
          reasons: [
            "no verified identity match in provider catalogs",
            `possible but unverified: ${candidates.map((c) => `${c.name} (${c.score})`).join(", ")}`,
          ],
          review_required: true,
          candidates,
        };
        stats.uncertain += 1;
        stats.review_required += 1;
        reviewQueue.push({
          id: standalone.id,
          name: standalone.name,
          candidates,
          reason: "readme entry could not be matched to a provider model by identity",
        });
      } else {
        standalone.merge = {
          confidence: "verified",
          reasons: ["readme-only listing; no provider catalog entry found"],
          review_required: false,
        };
        stats.readme_only += 1;
      }

      providerModels.push(standalone);
      readmeOnly.push(standalone.id);
    }
  }

  stats.provider_only = providerModels.length - readmeOnly.length;

  // Stable ids: provider-backed records keep the provider slug; README-only
  // records keep their own. Both are already unique, but re-derive defensively.
  const seenIds = new Set();
  const models = providerModels.map((model) => {
    let id = model.id || slugify(model.name);
    if (seenIds.has(id)) id = `${id}-${seenIds.size}`;
    seenIds.add(id);
    return { ...model, id };
  });

  models.sort((a, b) => a.id.localeCompare(b.id));

  const envelope = {
    schema_version: SCHEMA_VERSION,
    generated_at: new Date().toISOString(),
    source: {
      type: "unified",
      ref: "data/models.json",
      observed_at: new Date().toISOString(),
      commit: null,
      status: "ok",
      note: `readme ${provenanceStatuses.readme.status}, openrouter ${provenanceStatuses.openrouter.status}, groq ${provenanceStatuses.groq.status}`,
    },
    count: models.length,
    models,
    diagnostics: {
      ...stats,
      sources: provenanceStatuses,
      review_queue_size: reviewQueue.length,
    },
    review_queue: reviewQueue,
  };

  const { changed } = writeEnvelopeIfChanged(output, envelope);
  return { envelope, changed, reviewQueue, stats };
}

module.exports = {
  build,
  normalizeIdentity,
  isSameIdentity,
  findCandidates,
  matchKeys,
  identityOf,
  splitNamespace,
  namespacesCompatible,
  absorbProviderPricing,
  recomputePrimaryPricing,
  statesPrice,
  SOURCES,
  DEFAULT_OUTPUT,
};

if (require.main === module) {
  const { envelope, stats } = build();
  log.ok(`Unified catalog: ${envelope.count} models`);
  log.info(`  readme        : ${stats.readme}`);
  log.info(`  openrouter    : ${stats.openrouter}`);
  log.info(`  groq          : ${stats.groq}`);
  log.info(`  merged        : ${stats.merged}`);
  log.info(`  readme-only   : ${stats.readme_only}`);
  log.info(`  uncertain     : ${stats.uncertain} (review queue: ${envelope.review_queue.length})`);
}