/** Presentation helpers. Pure functions, no React. */

const compactFormatter = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

/** Renders a token count the way the README writes context windows (200K, 1M). */
export function formatTokens(tokens: number | null): string | null {
  if (tokens === null || !Number.isFinite(tokens)) return null;
  if (tokens >= 1_000_000) {
    const millions = tokens / 1_000_000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    const thousands = tokens / 1_000;
    return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}K`;
  }
  return String(tokens);
}

/** USD amount, e.g. 6 -> "$6.00", 0.125 -> "$0.125". Cents are always kept. */
export function formatUsd(amount: number | null): string | null {
  if (amount === null || !Number.isFinite(amount)) return null;
  if (amount === 0) return '$0.00';
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  return `$${amount.toFixed(2)}`;
}

/** "200K+" / "1M" style context label, falling back to the README's raw text. */
export function formatContext(entry: {
  context: string | null;
  contextTokens: number | null;
}): string | null {
  if (entry.context) return entry.context;
  return formatTokens(entry.contextTokens);
}

export function formatCount(value: number): string {
  return compactFormatter.format(value);
}

const isoDateFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  timeZone: 'UTC',
});

export function formatIsoDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return isoDateFormatter.format(date);
}

/** Human-friendly elapsed time used for the "data freshness" indicator. */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return 'unknown';

  const seconds = Math.round((then.getTime() - now.getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return formatter.format(Math.round(seconds / size), unit);
    }
  }
  return formatter.format(seconds, 'second');
}

export const KIND_LABELS = {
  model: 'Models',
  api: 'APIs',
  tool: 'Tools',
  database: 'Databases',
  runner: 'Runners',
} as const;

/** Joins truthy class names without producing "undefined" entries. */
export function cx(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ');
}

/** Builds a GitHub deep link to a specific README line. */
export function readmeLineUrl(repo: string, branch: string, line: number): string {
  return `${repo}/blob/${branch}/README.md#L${line}`;
}