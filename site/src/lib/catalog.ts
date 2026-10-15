import rawCatalog from '../data/catalog.json';
import type {
  Catalog,
  CatalogEntry,
  ChangelogItem,
  ExploreFilters,
  SortKey,
  SortOption,
} from '../types/catalog';
import { buildFacets, buildSearchIndex, matchesQuery, sortEntries, tokenizeQuery } from './search';

/**
 * The catalog is inlined at build time by Vite, so every page renders instantly
 * and works offline. Nothing is fetched from GitHub at runtime.
 */
export const catalog = rawCatalog as unknown as Catalog;

export const entries: readonly CatalogEntry[] = catalog.entries;

export const facets = buildFacets(entries);

const searchIndex = new Map(
  buildSearchIndex(entries).map((indexed) => [indexed.entry.id, indexed]),
);

export const SORT_OPTIONS: readonly SortOption[] = [
  { value: 'name-asc', label: 'Name (A–Z)' },
  { value: 'name-desc', label: 'Name (Z–A)' },
  { value: 'provider-asc', label: 'Provider (A–Z)' },
  { value: 'listings-desc', label: 'Most listed' },
  { value: 'input-cost-asc', label: 'Input price (lowest first)', partial: true },
  { value: 'output-cost-asc', label: 'Output price (lowest first)', partial: true },
  { value: 'context-desc', label: 'Context window (largest first)', partial: true },
];

export const DEFAULT_FILTERS: ExploreFilters = {
  query: '',
  kind: 'all',
  provider: null,
  section: null,
  group: null,
  freeOnly: false,
  sort: 'name-asc',
};

export function getEntryById(id: string): CatalogEntry | undefined {
  return entries.find((entry) => entry.id === id);
}

export function getEntriesByIds(ids: readonly string[]): CatalogEntry[] {
  return ids
    .map((id) => getEntryById(id))
    .filter((entry): entry is CatalogEntry => entry !== undefined);
}

/** Applies every active facet, then sorts. Pure and order-stable. */
export function applyFilters(
  source: readonly CatalogEntry[],
  filters: ExploreFilters,
): CatalogEntry[] {
  const tokens = tokenizeQuery(filters.query);

  const filtered = source.filter((entry) => {
    if (filters.kind !== 'all' && entry.kind !== filters.kind) return false;
    if (filters.provider !== null) {
      const provider = entry.provider ?? 'Unspecified';
      if (provider !== filters.provider) return false;
    }
    if (filters.section !== null && !entry.sections.includes(filters.section)) return false;
    if (filters.group !== null && !entry.groups.includes(filters.group)) return false;
    if (filters.freeOnly && !entry.isFree) return false;
    return true;
  });

  // The query runs against a shared index so search stays fast while typing.
  const searched = tokens.length
    ? filtered.filter((entry) => {
        const indexed = searchIndex.get(entry.id);
        return indexed ? matchesQuery(indexed, tokens) : false;
      })
    : filtered;

  return sortEntries(searched, filters.sort as SortKey);
}

/** Number of entries matching everything except the query — powers result counts. */
export function countWithoutQuery(filters: ExploreFilters): number {
  return applyFilters(entries, { ...filters, query: '' }).length;
}

export function isDefaultFilters(filters: ExploreFilters): boolean {
  return (
    filters.query.trim() === '' &&
    filters.kind === 'all' &&
    filters.provider === null &&
    filters.section === null &&
    filters.group === null &&
    filters.freeOnly === false
  );
}

export function activeFilterCount(filters: ExploreFilters): number {
  let count = 0;
  if (filters.query.trim() !== '') count += 1;
  if (filters.kind !== 'all') count += 1;
  if (filters.provider !== null) count += 1;
  if (filters.section !== null) count += 1;
  if (filters.group !== null) count += 1;
  if (filters.freeOnly) count += 1;
  return count;
}

/**
 * Attribute labels that appear across the selected entries, used to decide
 * which comparison rows are worth rendering.
 */
export function sharedAttributeLabels(selected: readonly CatalogEntry[]): string[] {
  if (selected.length === 0) return [];
  const [first, ...rest] = selected;
  if (!first) return [];
  return first.attributes
    .map((attribute) => attribute.label)
    .filter((label) => rest.every((entry) => entry.attributes.some((a) => a.label === label)));
}

const CHANGELOG_HEADING = '#-changelog';

/** Deep link into the README Changelog table. */
export const changelogReference: { url: string } = {
  url: `${catalog.source.repository}/blob/main/README.md${CHANGELOG_HEADING}`,
};

/**
 * Latest commit + deployment, captured at build time.
 * Defaults keep the UI working if a build somehow produced an older catalog
 * shape — a missing field must never blank the page.
 */
const EMPTY_STATUS = {
  commit: null,
  deployment: null,
  fetchedAt: new Date(0).toISOString(),
} as const;

export const repoStatus = catalog.repoStatus ?? EMPTY_STATUS;

/**
 * reports/weekly-report.md parsed at build time. `available: false` means the
 * Updates page renders its "no report" state rather than crashing.
 */
export const report =
  catalog.report ??
  ({ available: false, title: null, date: null, sourceUrl: null, blocks: [] } as const);

export const changelog: readonly ChangelogItem[] = catalog.changelog ?? [];

/** Sections that read as "catalog" groupings, used for home page navigation. */
export const catalogSections = facets.sections.filter(
  (section) => section.value !== 'By Category' && section.value !== 'Developer Tools & Frameworks',
);