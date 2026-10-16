/**
 * Machine-verified model catalog types.
 *
 * Produced by `site/scripts/lib/model-catalog.mjs` from `data/models.json`
 * (schema 1.0.0). Nullable means "the source did not state it" — never a
 * substitute value.
 */

import type { ProviderId } from '../lib/providerClients';

export interface ModelPricing {
  /** USD per 1M input tokens. null = not stated. */
  inputPerMTokens: number | null;
  /** USD per 1M output tokens. null = not stated. */
  outputPerMTokens: number | null;
  /** The pricing text exactly as the source published it. */
  raw: string | null;
}

/**
 * How a model got into the catalog.
 *
 * `directory`    — a curated AI directory entry, optionally confirmed by a
 *                  provider API. This is what the site shows by default.
 * `provider-only` — present in a provider's own API but not a directory entry.
 *                  Routed aliases, forks, community uploads and date-pinned
 *                  snapshots. Reference data, hidden unless asked for.
 */
export type ModelListing = 'directory' | 'provider-only';

export interface ModelCandidate {
  id: string;
  name: string;
  score: number;
}

export interface ModelRecord {
  id: string;
  name: string;
  aliases: string[];
  /** Display-level vendor attribution. */
  provider: string | null;
  description: string | null;
  capabilities: string[];
  modalities: { input: string[]; output: string[] };
  /** Primary price, used when a model has exactly one provider. */
  pricing: ModelPricing;
  /** Each provider's own price, preserved separately. */
  providerPricing: Partial<Record<ProviderId, ModelPricing>>;
  contextWindow: number | null;
  /** Providers that actually serve this model, in canonical order. */
  providers: ProviderId[];
  /** Whether this is a curated directory entry or a raw provider listing. */
  listing: ModelListing;
  /**
   * `verified`   — at least one provider confirmed it at the observed time.
   * `readme-only`— catalogued from the README with no provider confirmation.
   */
  availability: 'verified' | 'readme-only';
  /** The exact id to send to each provider. */
  modelIds: Partial<Record<ProviderId, string>>;
  observedAt: string | null;
  confidence: 'verified' | 'uncertain';
  needsReview: boolean;
  candidates: ModelCandidate[];
}

export interface ModelReviewItem {
  id: string;
  name: string;
  candidates: ModelCandidate[];
  reason: string;
}

export interface ModelDataset {
  generatedAt: string;
  /** False when no provider catalog has been generated yet. */
  available: boolean;
  reason: string | null;
  source: { type: string; status: string; observedAt: string | null; count: number };
  stats: {
    total: number;
    readme: number;
    openrouter: number;
    groq: number;
    merged: number;
    readmeOnly: number;
    needsReview: number;
    withPricing: number;
    /** Curated directory entries, shown by default. */
    directoryCount: number;
    /** Raw provider listings, hidden unless explicitly requested. */
    providerOnlyCount: number;
  };
  models: ModelRecord[];
  reviewQueue: ModelReviewItem[];
}