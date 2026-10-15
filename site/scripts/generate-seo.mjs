/**
 * Emits robots.txt and sitemap.xml into the production build.
 *
 * The site uses hash routing, so the addressable pages are the base URL plus
 * the primary routes. `lastmod` comes from the catalog's build date so the
 * sitemap reflects actual content generation rather than a hard-coded value.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, '..');
const distDir = resolve(siteRoot, 'dist');
const catalogPath = resolve(siteRoot, 'src/data/catalog.json');

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? 'https://fluxenitemc.github.io/Ai-hub';

/** Hash-routed entry points worth surfacing to crawlers. */
const ROUTES = [
  { hash: '', priority: '1.0', freq: 'daily' },
  { hash: '/explore', priority: '0.9', freq: 'daily' },
  { hash: '/compare', priority: '0.5', freq: 'weekly' },
  { hash: '/docs', priority: '0.6', freq: 'weekly' },
  { hash: '/updates', priority: '0.5', freq: 'weekly' },
];

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function readCatalogDate() {
  try {
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
    const generated = String(catalog.generatedAt ?? '');
    const isoDate = generated.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? isoDate : new Date().toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function buildSitemap(lastmod) {
  const urls = ROUTES.map((route) => {
    const loc = `${SITE_ORIGIN}/#${route.hash}`;
    return [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${route.freq}</changefreq>`,
      `    <priority>${route.priority}</priority>`,
      '  </url>',
    ].join('\n');
  }).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}

function buildRobots() {
  return [
    '# Fluxenite AI Hub — static catalog generated from the repository README',
    'User-agent: *',
    'Allow: /',
    '',
    '# Hashed assets are immutable build output, not crawl targets.',
    'Disallow: /assets/',
    '',
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n');
}

const lastmod = readCatalogDate();
mkdirSync(distDir, { recursive: true });
writeFileSync(resolve(distDir, 'robots.txt'), buildRobots(), 'utf8');
writeFileSync(resolve(distDir, 'sitemap.xml'), buildSitemap(lastmod), 'utf8');

console.log('✓ Generated SEO files');
console.log('  robots.txt   dist/robots.txt');
console.log(`  sitemap.xml  dist/sitemap.xml (${ROUTES.length} routes, lastmod ${lastmod})`);