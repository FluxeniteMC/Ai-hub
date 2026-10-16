/**
 * Machine-verified model catalog: search, filters and derived facts.
 *
 * Inlined at build time by `scripts/generate-data.mjs`, so the browser never
 * calls a provider and no credential is ever needed in a bundle.
 */

import rawDataset from '../data/models.json';
import type { ModelDataset, ModelRecord } from '../types/models';
import type { ProviderId } from './providerClients';
import { PROVIDER_LABELS, PROVIDER_ORDER } from './providerClients';

export const modelDataset = rawDataset as unknown as ModelDataset;

export const models: readonly ModelRecord[] = modelDataset.models;

// ── Facets ─────────────────────────────────────────────────────────────────

function countBy<T>(items: readonly T[], key: (item: T) => string | null) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const value = key(item);
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, count }));
}

export const modelFacets = {
  /** Providers that actually serve at least one model. */
  providers: PROVIDER_ORDER.map((provider) => ({
    id: provider,
    label: PROVIDER_LABELS[provider],
    count: models.filter((model) => model.providers.includes(provider)).length,
  })),
  capabilities: countBy(models, (model) => model.capabilities[0] ?? null),
  /** Vendor names present in the data, for a narrower filter. */
  vendors: countBy(models, (model) => model.provider),
};

export const CAPABILITY_LABELS: Record<string, string> = {
  tools: 'Tool calling',
  reasoning: 'Reasoning',
  structured_output: 'Structured output',
  deterministic: 'Deterministic seeds',
  logprobs: 'Log probabilities',
  sampling: 'Sampling controls',
};

/** Providers available on a model, in the canonical order. */
export function providersFor(model: ModelRecord): ProviderId[] {
  return PROVIDER_ORDER.filter((provider) => model.providers.includes(provider));
}

/**
 * The price to show. Uses the selected provider's own price when there is more
 * than one, so the number always belongs to the provider the user will call.
 *
 * `null` means "not stated". It is never rendered as $0.00 — a model whose price
 * is unknown is not the same as a model that is free.
 */
export function priceFor(model: ModelRecord, provider: ProviderId | null): ModelRecord['pricing'] {
  if (provider) {
    const specific = model.providerPricing?.[provider];
    if (specific) return specific;
  }
  return model.pricing;
}

export function hasStatedPrice(pricing: ModelRecord['pricing']): boolean {
  return pricing.inputPerMTokens !== null || pricing.outputPerMTokens !== null;
}

// ── Search ─────────────────────────────────────────────────────────────────

/** Everything searchable for one model, lower-cased once per query batch. */
function haystack(model: ModelRecord): string {
  return [
    model.name,
    ...model.aliases,
    model.provider ?? '',
    model.id,
    ...Object.values(model.modelIds).filter(Boolean),
    model.description ?? '',
  ]
    .join(' ')
    .toLowerCase();
}

const haystacks = new Map(models.map((model) => [model.id, haystack(model)]));

export interface ModelFilters {
  query: string;
  provider: ProviderId | null;
  capability: string | null;
  /** 'all' | 'verified' | 'readme-only' */
  availability: 'all' | 'verified' | 'readme-only';
  needsReviewOnly: boolean;
  sort: 'name-asc' | 'name-desc' | 'price-asc' | 'context-desc';
}

export const DEFAULT_MODEL_FILTERS: ModelFilters = {
  query: '',
  provider: null,
  capability: null,
  availability: 'all',
  needsReviewOnly: false,
  sort: 'name-asc',
};

export const MODEL_SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A–Z)' },
  { value: 'name-desc', label: 'Name (Z–A)' },
  { value: 'price-asc', label: 'Price (lowest stated first)', partial: true },
  { value: 'context-desc', label: 'Context window (largest first)', partial: true },
] as const;

export function tokenize(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Applies every active filter, then sorts.
 *
 * All search terms must match (AND), so adding a word narrows rather than
 * widens the result set — the behaviour people expect from a search box.
 */
export function applyModelFilters(
  source: readonly ModelRecord[],
  filters: ModelFilters,
): ModelRecord[] {
  const tokens = tokenize(filters.query);

  const filtered = source.filter((model) => {
    if (filters.provider && !model.providers.includes(filters.provider)) return false;
    if (filters.capability && !model.capabilities.includes(filters.capability)) return false;
    if (filters.availability === 'verified' && model.availability !== 'verified') return false;
    if (filters.availability === 'readme-only' && model.availability !== 'readme-only') return false;
    if (filters.needsReviewOnly && !model.needsReview) return false;

    if (tokens.length > 0) {
      const text = haystacks.get(model.id) ?? '';
      if (!tokens.every((token) => text.includes(token))) return false;
    }
    return true;
  });

  return sortModels(filtered, filters.sort);
}

function sortModels(list: readonly ModelRecord[], sort: ModelFilters['sort']): ModelRecord[] {
  const sorted = [...list];

  switch (sort) {
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price-asc':
      // Models with no stated price sort last rather than being treated as $0.
      sorted.sort((a, b) => {
        const left = a.pricing.inputPerMTokens;
        const right = b.pricing.inputPerMTokens;
        if (left === null && right === null) return a.name.localeCompare(b.name);
        if (left === null) return 1;
        if (right === null) return -1;
        return left - right || a.name.localeCompare(b.name);
      });
      break;
    case 'context-desc':
      sorted.sort((a, b) => {
        const left = a.contextWindow;
        const right = b.contextWindow;
        if (left === null && right === null) return a.name.localeCompare(b.name);
        if (left === null) return 1;
        if (right === null) return -1;
        return right - left || a.name.localeCompare(b.name);
      });
      break;
    default:
      sorted.sort((a, b) => a.name.localeCompare(b.name));
  }

  return sorted;
}

export function countWithoutQuery(source: readonly ModelRecord[], filters: ModelFilters): number {
  return applyModelFilters(source, { ...filters, query: '' }).length;
}

export function isDefaultModelFilters(filters: ModelFilters): boolean {
  return (
    filters.query.trim() === '' &&
    filters.provider === null &&
    filters.capability === null &&
    filters.availability === 'all' &&
    filters.needsReviewOnly === false
  );
}

export function activeModelFilterCount(filters: ModelFilters): number {
  let count = 0;
  if (filters.query.trim() !== '') count += 1;
  if (filters.provider !== null) count += 1;
  if (filters.capability !== null) count += 1;
  if (filters.availability !== 'all') count += 1;
  if (filters.needsReviewOnly) count += 1;
  return count;
}

export function getModelById(id: string): ModelRecord | undefined {
  return models.find((model) => model.id === id);
}

/** Formats a per-1M price. Returns null when the source stated none. */
export function formatPrice(perMillion: number | null): string | null {
  if (perMillion === null) return null;
  if (perMillion === 0) return '$0';
  if (perMillion < 0.01) return `$${perMillion.toFixed(5)}`;
  if (perMillion < 1) return `$${perMillion.toFixed(4)}`;
  return `$${perMillion.toFixed(2)}`;
}