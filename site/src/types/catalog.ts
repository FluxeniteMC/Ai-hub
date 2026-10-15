/**
 * Catalog data contracts.
 *
 * These mirror the output of `scripts/generate-data.mjs`, which derives every
 * value from the repository README. Fields are intentionally nullable: where the
 * README does not state something, the site omits it rather than guessing.
 */

export type EntryKind = 'model' | 'api' | 'tool' | 'database' | 'runner';

export interface CatalogAttribute {
  /** Column header exactly as written in the README table. */
  label: string;
  /** Cell contents with inline markdown stripped. */
  value: string;
}

export interface CatalogOccurrence {
  section: string;
  subsection: string | null;
  group: string | null;
  /** 1-based line number of the source table in README.md. */
  line: number;
}

export interface CatalogEntry {
  /** Stable, URL-safe identifier derived from the listing name. */
  id: string;
  name: string;
  url: string | null;
  provider: string | null;
  kind: EntryKind;
  /** Primary README section. */
  section: string;
  subsection: string | null;
  /** Every section the listing appears in. */
  sections: string[];
  group: string | null;
  /** Every within-section group the listing appears under. */
  groups: string[];
  tier: string | null;
  attributes: CatalogAttribute[];
  notes: string | null;
  context: string | null;
  contextTokens: number | null;
  costText: string | null;
  /** USD per 1M input tokens, only when the README states both rates. */
  inputPerMTokens: number | null;
  /** USD per 1M output tokens, only when the README states both rates. */
  outputPerMTokens: number | null;
  isFree: boolean;
  /** How many README tables list this entry. */
  listingCount: number;
  occurrences: CatalogOccurrence[];
}

export interface CatalogSource {
  repository: string;
  readmePath: string;
  readmeCommit: string | null;
  readmeUpdated: string | null;
  directoryVersion: string | null;
  reportedListingCount: number | null;
  selfUpdated: boolean;
  /** Digest of the parsed entries, used to detect content drift. */
  fingerprint: string;
}

export interface CatalogStats {
  tableCount: number;
  occurrenceCount: number;
  entryCount: number;
  duplicateCount: number;
}

export interface Catalog {
  generatedAt: string;
  source: CatalogSource;
  stats: CatalogStats;
  entries: CatalogEntry[];
  /** Rows of the README Changelog table, verbatim. */
  changelog: ChangelogItem[];
}

export interface ChangelogItem {
  date: string;
  change: string;
  type: string;
}

/** Sort options exposed in the explorer. None of them imply a quality ranking. */
export type SortKey =
  | 'name-asc'
  | 'name-desc'
  | 'provider-asc'
  | 'context-desc'
  | 'input-cost-asc'
  | 'output-cost-asc'
  | 'listings-desc';

export interface SortOption {
  value: SortKey;
  label: string;
  /** True when the sort can only be applied to a subset of entries. */
  partial?: boolean;
}

/** Counted facet values used by the explorer filter panel. */
export interface Facets {
  providers: { value: string; count: number }[];
  sections: { value: string; count: number }[];
  groups: { value: string; count: number }[];
  kinds: { value: EntryKind; count: number }[];
  freeCount: number;
}

export interface ExploreFilters {
  query: string;
  kind: EntryKind | 'all';
  provider: string | null;
  section: string | null;
  group: string | null;
  freeOnly: boolean;
  sort: SortKey;
}

export const UNSPECIFIED = 'Unspecified';