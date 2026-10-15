/**
 * Emits robots.txt and sitemap.xml into the production build.
 *
 * The site uses hash routing, so the addressable pages are the base URL plus
 * the primary routes. `lastmod` comes from the catalog's build date so the
 * sitemap reflects actual content generation rather than a hard-coded value.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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

/**
 * Structured data injected into the built index.html.
 *
 * Written at build time rather than by React so crawlers that do not execute
 * JavaScript still see it. Uses schema.org WebSite + ItemList so the catalog
 * can surface as a rich result.
 */
function buildJsonLd(lastmod) {
  const stats = readCatalog().stats ?? {};
  const entries = readCatalog().entries ?? [];

  const byKind = entries.reduce((acc, entry) => {
    acc[entry.kind] = (acc[entry.kind] ?? 0) + 1;
    return acc;
  }, {});

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        url: `${SITE_ORIGIN}/`,
        name: 'Fluxenite AI Hub',
        alternateName: 'Fluxenite AI Hub — AI API Directory',
        description:
          'A searchable, filterable directory of AI APIs, models, vector databases and developer tools, generated from the FluxeniteMC/Ai-hub repository README.',
        inLanguage: 'en',
        publisher: { '@id': `${SITE_ORIGIN}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_ORIGIN}/#/explore?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_ORIGIN}/#organization`,
        name: 'FluxeniteMC',
        url: 'https://github.com/FluxeniteMC',
      },
      {
        '@type': 'Dataset',
        '@id': `${SITE_ORIGIN}/#dataset`,
        name: 'AI API and model directory',
        description: `A community-maintained catalog of ${stats.entryCount ?? 0} AI listings parsed from the repository README at build time.`,
        url: `${SITE_ORIGIN}/`,
        creator: { '@id': `${SITE_ORIGIN}/#organization` },
        dateModified: lastmod,
        distribution: [
          {
            '@type': 'DataDownload',
            encodingFormat: 'text/html',
            contentUrl: `${SITE_ORIGIN}/`,
          },
        ],
        variableMeasured: [
          { '@type': 'PropertyValue', name: 'Total listings', value: stats.entryCount ?? 0 },
          { '@type': 'PropertyValue', name: 'Models', value: byKind.model ?? 0 },
          { '@type': 'PropertyValue', name: 'APIs', value: byKind.api ?? 0 },
          { '@type': 'PropertyValue', name: 'Developer tools', value: byKind.tool ?? 0 },
          { '@type': 'PropertyValue', name: 'Vector databases', value: byKind.database ?? 0 },
          { '@type': 'PropertyValue', name: 'Model runners', value: byKind.runner ?? 0 },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE_ORIGIN}/#catalog`,
        name: 'AI API and model catalog',
        numberOfItems: entries.length,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        itemListElement: entries.slice(0, 500).map((entry, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: entry.name,
          url: `${SITE_ORIGIN}/#/listing/${entry.id}`,
        })),
      },
    ],
  };
}

function readCatalog() {
  try {
    return JSON.parse(readFileSync(catalogPath, 'utf8'));
  } catch {
    return {};
  }
}

function injectJsonLd(lastmod) {
  const indexPath = resolve(distDir, 'index.html');
  if (!existsSync(indexPath)) return;

  const html = readFileSync(indexPath, 'utf8');
  // Guard against double injection if the step is re-run.
  if (html.includes('application/ld+json')) return;

  const payload = JSON.stringify(buildJsonLd(lastmod))
    // Keep the script block valid: escape sequences that terminate <script>.
    .replace(/</g, '\\u003c');

  const tag = `<script type="application/ld+json">${payload}</script>`;
  writeFileSync(indexPath, html.replace('</head>', `  ${tag}\n  </head>`), 'utf8');
}

const lastmod = readCatalogDate();
mkdirSync(distDir, { recursive: true });
writeFileSync(resolve(distDir, 'robots.txt'), buildRobots(), 'utf8');
writeFileSync(resolve(distDir, 'sitemap.xml'), buildSitemap(lastmod), 'utf8');

injectJsonLd(lastmod);

console.log('✓ Generated SEO files');
console.log('  robots.txt   dist/robots.txt');
console.log(`  sitemap.xml  dist/sitemap.xml (${ROUTES.length} routes, lastmod ${lastmod})`);
console.log('  json-ld      injected into dist/index.html');