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
  { hash: '/faq', priority: '0.5', freq: 'monthly' },
  { hash: '/terms', priority: '0.3', freq: 'yearly' },
  { hash: '/privacy', priority: '0.3', freq: 'yearly' },
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
      // FAQPage and WebPage nodes for the static legal/support routes, so search
      // engines can surface an answer or a policy directly rather than treating
      // these as undifferentiated text.
      {
        '@type': 'FAQPage',
        '@id': `${SITE_ORIGIN}/#faq`,
        url: `${SITE_ORIGIN}/#/faq`,
        name: 'Frequently Asked Questions',
        description:
          'Answers about how the AI Hub catalog is generated, how to search and compare listings, how to add or correct an entry, and what the site does with your data.',
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
        mainEntity: FAQ_ENTITIES.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_ORIGIN}/#terms`,
        url: `${SITE_ORIGIN}/#/terms`,
        name: 'Terms of Service',
        description:
          'The terms that apply to using Fluxenite AI Hub — a free, community-maintained AI directory with no accounts, no payments and no tracking.',
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_ORIGIN}/#privacy`,
        url: `${SITE_ORIGIN}/#/privacy`,
        name: 'Privacy Policy',
        description:
          'Fluxenite AI Hub collects no personal data. No accounts, no analytics, no advertising, no tracking cookies.',
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
      },
    ],
  };
}

/**
 * The canonical FAQ question/answer pairs.
 *
 * Duplicated here deliberately: this file is plain Node and must not import
 * TypeScript. `scripts/lib/faq-schema.test.mjs` parses both sources and fails
 * the build if the two ever drift apart, so the duplication cannot go stale.
 */
const FAQ_ENTITIES = [
  {
    question: 'What is Fluxenite AI Hub?',
    answer:
      'A free, searchable directory of AI APIs, models, vector databases and developer tools. It is a static, read-only view of the community-maintained repository — the website is generated from README.md rather than edited by hand.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'No. There are no accounts, no logins and no email addresses on this site. It is a set of pre-built static pages with no server handling your requests.',
  },
  {
    question: 'Does it cost anything? Is there advertising?',
    answer:
      'No to both. The site is free, with no advertising, no sponsors and no affiliate links. Listing links point to each vendor’s own official page.',
  },
  {
    question: 'Where does the data come from?',
    answer:
      'The repository README.md is the single source of truth. During the build the parser walks its markdown tables and converts each row into a listing, storing a content fingerprint so you can tell whether what you are reading is current.',
  },
  {
    question: 'Does it verify the claims?',
    answer:
      'No, and this matters. The site reproduces what the repository says. It does not independently confirm that a model exists, that a price is right, or that a provider is still operating. What the build does guarantee is that it will not invent anything: a field the README does not state is left blank and shown as Not stated.',
  },
  {
    question: 'Why does a field say "Not stated"?',
    answer:
      'Because the README does not state it. Rather than guess, the parser leaves it empty and the site shows "Not stated". This applies to pricing, context windows, modalities and anything else genuinely absent.',
  },
  {
    question: 'A price looks wrong. Why isn’t it corrected automatically?',
    answer:
      'Deliberately. Automatically “fixing” prices would mean the site generating figures that no source states. A wrong price means the README is wrong, so the fix belongs there — send a pull request correcting the row with a link to the vendor’s current pricing page.',
  },
  {
    question: 'Why are some prices shown as text rather than numbers?',
    answer:
      'Token pricing is only parsed as a number when the README states a clear input/output pair, such as $6.00/$30.00 per 1M. Anything ambiguous — a monthly subscription, a flat rate, a single figure with no counterpart — is kept exactly as written.',
  },
  {
    question: 'How does search work?',
    answer:
      'Search matches listing names, providers, categories and descriptions as you type, filtering the grid instantly. It runs entirely in your browser — no query is sent anywhere.',
  },
  {
    question: 'How do I compare two things?',
    answer:
      'Use the select control on any listing card to add it to a comparison. A tray appears at the bottom showing your selection. Up to four can be compared at once, and the selection persists across refreshes via local storage.',
  },
  {
    question: 'What does the comparison table do with missing data?',
    answer:
      'It shows “Not stated” rather than an empty cell, so it is always obvious that a value is unavailable rather than simply blank.',
  },
  {
    question: 'How often does the site update?',
    answer:
      'Whenever the repository README changes. A scheduled automation runs daily, and the site is also rebuilt automatically when relevant files are pushed.',
  },
  {
    question: 'Will it add AI models automatically?',
    answer:
      'No. Automation may refresh the existing catalog, but it is not permitted to introduce a model, API or provider that is not already in the repository with a verifiable source. Any automated change introducing a new listing is rejected before it can ship.',
  },
  {
    question: 'What technology does it use?',
    answer:
      'React with TypeScript, built with Vite, deployed to GitHub Pages as static files. There is no backend and no server-side application — everything you see was generated before you arrived.',
  },
  {
    question: 'Does it call any API while I browse?',
    answer:
      'No. The catalog is parsed at build time and bundled into the page, so the browser never contacts GitHub or any other data source while you use the site. It works offline once loaded.',
  },
  {
    question: 'Why do the URLs use #?',
    answer:
      'GitHub Pages serves plain static files with no server-side routing, so the site uses hash routing. This is what lets a deep link to a specific listing work on refresh without a 404 or any server configuration.',
  },
  {
    question: 'Can I use the AI models listed here?',
    answer:
      'The site lists models and providers; it does not provide access to them. To use one you need to go directly to that provider, create an account with them, and accept their terms and pricing. Listing something here is not an offer to supply it.',
  },
  {
    question: 'How many listings are there?',
    answer:
      'The exact count is shown in the catalog statistics on the home page and changes as the repository is updated. It is derived from the number of unique rows parsed from the README tables, after merging rows that describe the same service across several categories.',
  },
  {
    question: 'I saw a duplicate listing. Is that a bug?',
    answer:
      'No. Duplicates usually mean a service appears in more than one category table, which is intentional. The site merges them into one entry with multiple sources, so search results stay honest and identifiers stay stable.',
  },
  {
    question: 'How recent is the data?',
    answer:
      'The build date and the README commit the catalog came from are shown on the site. The catalog is rebuilt automatically whenever the README changes, and the Updates page tracks recent repository activity.',
  },
  {
    question: 'How do filters combine?',
    answer:
      'Multiple filters are combined with AND — a result must satisfy every active filter. Active filters are shown as removable chips, and there is a clear-all control.',
  },
  {
    question: 'What happens when a search returns nothing?',
    answer:
      'You get an empty state explaining that nothing matched, with a control to clear your filters. Usually the cause is a filter that is too narrow, for example a specific provider combined with an unrelated category.',
  },
  {
    question: 'Is the search keyboard accessible?',
    answer:
      'Yes. Tab moves through the controls, Enter opens a listing, and every filter is a real button. There is a skip link at the top of every page for jumping straight to the content.',
  },
  {
    question: 'Does my comparison selection persist?',
    answer:
      'Yes. The selection is stored in your browser’s local storage, so a page refresh or a return visit keeps it. It never leaves your device and can be cleared from the privacy policy page.',
  },
  {
    question: 'Can I sort the results?',
    answer:
      'Yes. Use the sort control on the Explore page to order results by relevance, name, or most recently added.',
  },
  {
    question: 'What is the weekly report?',
    answer:
      'A generated summary of what changed in the repository over the past week — new listings, corrections and anything else notable. It is published on the Updates page and regenerated on a schedule.',
  },
  {
    question: 'Why does a field sometimes stay empty?',
    answer:
      'If automation cannot find a verifiable source for a value, it leaves the field empty instead of filling in something plausible. An empty field is a correct outcome, not a bug.',
  },
  {
    question: 'Does it track me?',
    answer:
      'No. No analytics, no cookies, no third-party scripts and no tracking of any kind. The full details are in the privacy policy.',
  },
  {
    question: 'Does it work on mobile and with a keyboard?',
    answer:
      'Yes. The layout adapts from narrow phones to wide desktops, and the whole site is operable by keyboard with visible focus indicators and accessible labels on every control.',
  },
  {
    question: 'Can I run my own copy?',
    answer:
      'Yes — the site is open source. Clone the repository, then in the site directory run npm install and npm run dev to start a local development server.',
  },
  {
    question: 'Will my addition be reviewed?',
    answer:
      'It goes through a validation check during the build. A listing without a working source link, or with a malformed identifier, fails the build rather than shipping a broken catalog. Pull requests are also reviewed by maintainers before merge.',
  },
  {
    question: 'What if I made a mistake?',
    answer:
      'Open a pull request correcting it. Since the repository is the source of truth, a fix applied only in a discussion would have no effect on the site.',
  },
  {
    question: 'Can I suggest a feature?',
    answer:
      'Yes — open an issue describing the problem it would solve rather than the solution you have in mind. That usually leads to a better outcome.',
  },
  {
    question: 'Who runs this project?',
    answer:
      'It is an independent, open-source community project. It is not affiliated with, sponsored by or endorsed by any of the AI vendors listed here — inclusion in the catalog is not an endorsement.',
  },
  {
    question: 'I want to use the data commercially.',
    answer:
      'The catalog content comes from the public repository under its own licence — check the repository for the current terms. The site’s own code is separately licensed, and third-party trademarks remain the property of their owners.',
  },
  {
    question: 'What data does the site collect about me?',
    answer:
      'None. There are no accounts, no analytics, no cookies and no tracking. The only two values stored are your theme preference and your comparison selection, both in your own browser’s local storage, and neither ever leaves your device.',
  },
  {
    question: 'Does the site sell my data?',
    answer:
      'There is no data to sell. The project has never collected personal information, so there is nothing to share, trade or disclose.',
  },
  {
    question: 'Are the prices and details guaranteed accurate?',
    answer:
      'No. The catalog is informational and provided “as is”, without warranty of accuracy. Prices and availability change constantly and are owned by each vendor. Always confirm on the provider’s own official documentation.',
  },
  {
    question: 'Are the listed companies affiliated with this site?',
    answer:
      'No. This is an independent, open-source project. A listing means a service was catalogued — it is not an endorsement, recommendation or certification, and no provider has approved or reviewed this site.',
  },
  {
    question: 'How do I add a listing?',
    answer:
      'Edit README.md in the repository and open a pull request. Each listing needs a name, the category table it belongs in, and a link to the provider’s official documentation. Once merged, the site rebuilds automatically.',
  },
  {
    question: 'Something on the site looks broken. Where do I report it?',
    answer:
      'Open an issue on the GitHub repository. Include the page URL and what you expected to see — it makes the problem much faster to fix.',
  },
];

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