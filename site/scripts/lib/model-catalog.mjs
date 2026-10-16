/**
 * Converts `data/models.json` (schema 1.0.0) into the lean shape the site
 * bundles, and validates it.
 *
 * Design notes:
 *   - This is a *separate dataset* from the README-derived `catalog.json`. The
 *     README catalog is prose about AI services; this one is machine-verified
 *     provider data. Keeping them apart means a provider outage or a schema
 *     change cannot break the existing catalog, and vice versa.
 *   - The output is inlined at build time like the main catalog, so the browser
 *     never fetches provider data and no key is ever needed in a bundle.
 *   - Records that failed verification are carried through with an explicit
 *     flag rather than dropped: hiding a doubtful match is worse than labelling
 *     it, because a dropped record looks like the model does not exist.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PROVIDERS = ['openrouter', 'groq'];

/** Absolute path to the unified catalog produced by js/build-models.js. */
export function modelsPath(siteRoot) {
  return resolve(siteRoot, '..', 'data', 'models.json');
}

/** Empty-but-valid dataset, used when no catalog has been generated yet. */
function emptyDataset() {
  return {
    generatedAt: new Date(0).toISOString(),
    available: false,
    reason: 'data/models.json has not been generated. Run `npm run catalog:refresh` at the repository root.',
    source: { type: 'unified', status: 'missing', observedAt: null, count: 0 },
    stats: {
      total: 0,
      readme: 0,
      openrouter: 0,
      groq: 0,
      merged: 0,
      readmeOnly: 0,
      needsReview: 0,
      withPricing: 0,
      directoryCount: 0,
      providerOnlyCount: 0,
    },
    models: [],
    reviewQueue: [],
  };
}

/** snake_case from the catalog schema -> camelCase for the frontend. */
function pricing(raw) {
  return {
    inputPerMTokens: raw?.input_per_1m_usd ?? null,
    outputPerMTokens: raw?.output_per_1m_usd ?? null,
    raw: raw?.raw ?? null,
  };
}

export function buildModelDataset(siteRoot) {
  const file = modelsPath(siteRoot);
  if (!existsSync(file)) return emptyDataset();

  let catalog;
  try {
    catalog = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    return {
      ...emptyDataset(),
      reason: `data/models.json could not be parsed (${error.message}). The README catalog is unaffected.`,
    };
  }

  if (catalog.schema_version !== '1.0.0' || !Array.isArray(catalog.models)) {
    return {
      ...emptyDataset(),
      reason: `data/models.json uses schema ${catalog.schema_version}, expected 1.0.0. Skipped rather than guessed at.`,
    };
  }

  const models = [];
  const reviewQueue = [];

  for (const raw of catalog.models) {
    const availability = raw.availability ?? {};
    const available = PROVIDERS.filter((provider) => availability[provider]?.available);

    const providerPricing = {};
    for (const provider of PROVIDERS) {
      const block = raw.provider_pricing?.[provider];
      providerPricing[provider] = block ? pricing(block) : null;
    }

    const modelIds = {};
    for (const provider of PROVIDERS) {
      modelIds[provider] = availability[provider]?.model_id ?? null;
    }

    const candidates = (raw.merge?.candidates ?? []).map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      score: candidate.score,
    }));

    const record = {
      id: raw.id,
      name: raw.name,
      aliases: Array.isArray(raw.aliases) ? raw.aliases : [],
      provider: raw.provider ?? null,
      description: raw.description ?? null,
      capabilities: Array.isArray(raw.capabilities) ? raw.capabilities : [],
      modalities: {
        input: raw.modalities?.input ?? [],
        output: raw.modalities?.output ?? [],
      },
      pricing: pricing(raw.pricing),
      providerPricing,
      contextWindow: raw.context_window ?? null,
      /** Which providers actually serve this model right now. */
      providers: available,
      /** A model with no provider is README-only and not confirmed available. */
      availability: available.length > 0 ? 'verified' : 'readme-only',
      /**
       * `directory`    — part of the curated AI directory (catalogued in the
       *                  README, optionally confirmed by a provider).
       * `provider-only` — appeared in a provider's own API but is not a
       *                  directory entry. A provider lists hundreds of these:
       *                  routed aliases, forks, community uploads and
       *                  date-pinned snapshots. They are useful for reference
       *                  but listing them alongside the directory makes the
       *                  catalog look like a raw API dump, so they are hidden
       *                  unless explicitly requested.
       */
      listing: raw.availability?.readme?.available ? 'directory' : 'provider-only',
      modelIds,
      observedAt: raw.provenance?.[0]?.observed_at ?? null,
      confidence: raw.merge?.confidence ?? 'verified',
      needsReview: raw.merge?.review_required === true,
      candidates,
    };

    models.push(record);

    if (record.needsReview) {
      reviewQueue.push({
        id: record.id,
        name: record.name,
        candidates,
        reason: raw.merge?.reasons?.find((r) => !r.startsWith('possible')) ?? 'Unverified match',
      });
    }
  }

  models.sort((a, b) => a.id.localeCompare(b.id));
  reviewQueue.sort((a, b) => a.name.localeCompare(b.name));

  const diagnostics = catalog.diagnostics ?? {};

  return {
    generatedAt: catalog.generated_at ?? new Date().toISOString(),
    available: true,
    reason: null,
    source: {
      type: catalog.source?.type ?? 'unified',
      status: catalog.source?.status ?? 'unknown',
      observedAt: catalog.source?.observed_at ?? null,
      count: catalog.count ?? models.length,
    },
    stats: {
      total: models.length,
      readme: diagnostics.readme ?? 0,
      openrouter: diagnostics.openrouter ?? 0,
      groq: diagnostics.groq ?? 0,
      merged: diagnostics.merged ?? 0,
      readmeOnly: models.filter((m) => m.availability === 'readme-only').length,
      needsReview: reviewQueue.length,
      withPricing: models.filter((m) => m.pricing.inputPerMTokens !== null).length,
      directoryCount: models.filter((m) => m.listing === 'directory').length,
      providerOnlyCount: models.filter((m) => m.listing === 'provider-only').length,
    },
    models,
    reviewQueue,
  };
}

/**
 * Returns build-blocking problems. Empty means safe to publish.
 *
 * The only hard failure is an internal inconsistency: a model that claims
 * provider availability without an exact model id would give the user something
 * they cannot call.
 */
export function validateModelDataset(dataset) {
  const problems = [];

  if (!dataset.available) return problems;

  const seen = new Set();
  for (const model of dataset.models) {
    if (seen.has(model.id)) problems.push(`duplicate model id "${model.id}"`);
    seen.add(model.id);

    for (const provider of model.providers) {
      if (!model.modelIds[provider]) {
        problems.push(`${model.id} claims ${provider} availability with no exact model id`);
      }
    }

    // A zero price must have come from a source, never from a missing value.
    if (model.pricing.inputPerMTokens === 0 && !model.pricing.raw) {
      problems.push(`${model.id} has a zero price with no source text`);
    }
  }

  return problems;
}