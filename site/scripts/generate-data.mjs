/**
 * Build-time catalog generator.
 *
 * Reads the repository README (the authoritative source of truth) and writes a
 * validated `src/data/catalog.json` consumed by the static site. Nothing is
 * fetched at runtime, so the deployed bundle is fully self-contained.
 *
 * Usage: node scripts/generate-data.mjs
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseReadme } from './lib/readme-parser.mjs';
import { validateCatalog } from './lib/validate-catalog.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, '..');
const repoRoot = resolve(siteRoot, '..');

const OUTPUT_PATH = resolve(siteRoot, 'src/data/catalog.json');
const README_PATH = resolve(repoRoot, 'README.md');
const STATS_PATH = resolve(repoRoot, 'data/stats.json');
const CHANGELOG_PATH = resolve(repoRoot, 'data/changelog.json');

function readJsonIfPresent(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/** Pulls the Changelog table out of the README for the Updates page. */
function extractChangelog(markdown) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => /^##\s+.*Changelog/i.test(line.trim()));
  if (start === -1) return [];

  const rows = [];
  let headers = null;
  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (i > start && /^##\s+/.test(line)) break;
    if (!line.startsWith('|')) continue;

    const cells = line
      .slice(1, -1)
      .split('|')
      .map((cell) => cell.trim());
    if (/^[-:\s]+$/.test(line.replace(/\|/g, ''))) continue;
    if (!headers) {
      headers = cells;
      continue;
    }
    if (cells.length < headers.length) continue;
    const record = {};
    headers.forEach((header, index) => {
      record[header] = cells[index];
    });
    rows.push({
      date: cells[0],
      change: cells[1] ?? '',
      type: cells[2] ?? '',
    });
  }
  return rows;
}

function buildSourceMeta(markdown) {
  const repoStats = readJsonIfPresent(STATS_PATH);
  const lastUpdatedMatch = markdown.match(/Last run:\s*(\d{4}-\d{2}-\d{2})/);
  const versionMatch = markdown.match(/\(v(\d+\.\d+)\)/);

  return {
    repository: 'https://github.com/FluxeniteMC/Ai-hub',
    readmePath: 'README.md',
    readmeCommit: process.env.SOURCE_COMMIT ?? null,
    readmeUpdated: lastUpdatedMatch ? lastUpdatedMatch[1] : null,
    directoryVersion: versionMatch ? versionMatch[1] : null,
    reportedListingCount: repoStats?.total_api_listings ?? null,
    selfUpdated: /daily/i.test(markdown.slice(0, 4000)),
  };
}

function main() {
  const markdown = readFileSync(README_PATH, 'utf8');
  const result = parseReadme(markdown);

  const catalog = {
    generatedAt: new Date().toISOString(),
    source: buildSourceMeta(markdown),
    stats: result.stats,
    entries: result.entries,
  };

  // Strip nondeterministic ordering before hashing so repeated builds of an
  // unchanged README produce a stable content digest.
  const fingerprint = createHash('sha256')
    .update(JSON.stringify({ entries: result.entries }))
    .digest('hex')
    .slice(0, 16);
  catalog.source.fingerprint = fingerprint;

  const changelog = readJsonIfPresent(CHANGELOG_PATH) ?? extractChangelog(markdown);

  catalog.changelog = changelog;

  const problems = validateCatalog(catalog);
  if (problems.length > 0) {
    console.error('\n✖ Catalog validation failed:\n');
    for (const problem of problems) console.error(`  • ${problem}`);
    process.exit(1);
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');

  const warningCounts = result.warnings.reduce((acc, warning) => {
    acc[warning.type] = (acc[warning.type] ?? 0) + 1;
    return acc;
  }, {});
  const warnLine = Object.entries(warningCounts)
    .map(([type, count]) => `${type}=${count}`)
    .join(', ');

  console.log('✓ Generated catalog');
  console.log(`  source      ${README_PATH}`);
  console.log(`  tables      ${result.stats.tableCount}`);
  console.log(`  rows        ${result.stats.occurrenceCount}`);
  console.log(`  unique      ${result.stats.entryCount} (${result.stats.duplicateCount} merged duplicates)`);
  console.log(`  changelog   ${changelog.length} entries`);
  console.log(`  fingerprint ${fingerprint}`);
  if (warnLine) console.log(`  warnings    ${warnLine}`);
  console.log(`  output      ${OUTPUT_PATH}`);
}

main();