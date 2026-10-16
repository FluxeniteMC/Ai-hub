/**
 * Post-build verification.
 *
 * Asserts the production bundle actually contains what GitHub Pages needs:
 * an entry document, hashed assets, no dev-server URLs and a base path that
 * matches the repository deployment URL. Run as part of `npm run build`.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, '../dist');
const indexPath = join(distDir, 'index.html');

const EXPECTED_BASE = '/Ai-hub/';
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

if (!existsSync(distDir)) {
  console.error('✖ dist/ not found — run `npm run build` first.');
  process.exit(1);
}

check(existsSync(indexPath), 'dist/index.html is missing');

const html = existsSync(indexPath) ? readFileSync(indexPath, 'utf8') : '';

// 1. The entry document must reference the repository base path.
check(
  html.includes(`<base`) ? false : true,
  'index.html should not rely on a <base> tag (hash routing is used)',
);
check(
  html.includes(`href="${EXPECTED_BASE}favicon.svg"`) ||
    html.includes('href="./favicon.svg"'),
  'favicon is not linked from index.html',
);

// 2. Every local asset reference must be prefixed with the base path.
const assetRefs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((ref) => !/^(https?:|data:|#|\/)/.test(ref));

check(assetRefs.length > 0, 'index.html references no local assets');
for (const ref of assetRefs) {
  check(
    ref.startsWith(EXPECTED_BASE) || ref.startsWith('./') || ref.startsWith('../'),
    `asset "${ref}" is not resolved against ${EXPECTED_BASE}`,
  );
}

// 3. No development-server URLs or absolute root paths in the output.
check(!html.includes('localhost:'), 'index.html references a localhost dev server');
check(
  !/["'`]src="\/assets/.test(html),
  'index.html uses a root-absolute /assets path, which breaks GitHub Pages',
);

const assetsDir = join(distDir, 'assets');
check(existsSync(assetsDir), 'dist/assets/ is missing');

if (existsSync(assetsDir)) {
  const files = readdirSync(assetsDir);
  const js = files.filter((file) => file.endsWith('.js'));
  const css = files.filter((file) => file.endsWith('.css'));

  check(js.length > 0, 'no JavaScript bundle was emitted');
  check(css.length > 0, 'no CSS bundle was emitted');

  for (const file of files) {
    const full = join(assetsDir, file);
    // Skip nested directories (e.g. assets/brand) — only verify emitted files.
    if (!statSync(full).isFile()) continue;
    check(statSync(full).size > 0, `asset ${file} is empty`);
  }
}

// 4. The bundled catalog must actually be inlined (no runtime README fetch).
const jsFiles = existsSync(assetsDir)
  ? readdirSync(assetsDir)
      .filter((file) => file.endsWith('.js'))
      .map((file) => join(assetsDir, file))
  : [];

const combinedJs = jsFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
check(
  combinedJs.includes('"fingerprint"') || combinedJs.includes('fingerprint'),
  'the generated catalog does not appear to be bundled into the JavaScript',
);
check(
  !/raw\.githubusercontent\.com|api\.github\.com/.test(combinedJs),
  'the bundle fetches from the GitHub API at runtime, which the architecture forbids',
);

// 5. .nojekyll keeps Pages from ignoring asset directories.
check(existsSync(join(distDir, '.nojekyll')), 'dist/.nojekyll is missing (GitHub Pages may strip assets)');

// 6. Brand SVGs must ship and stay self-contained.
const brandDir = join(distDir, 'assets/brand');
for (const file of ['logo-symbol.svg', 'logo-horizontal.svg']) {
  const full = join(brandDir, file);
  if (!existsSync(full)) {
    check(false, `brand asset ${file} was not emitted`);
    continue;
  }
  const svg = readFileSync(full, 'utf8');
  check(svg.startsWith('<svg') || svg.startsWith('<?xml'), `${file} is not valid SVG markup`);
  check(svg.includes('viewBox'), `${file} has no viewBox`);
  check(!/<image\b/.test(svg), `${file} embeds a raster image`);
  check(!/<script\b|onload=|onclick=/.test(svg), `${file} contains script or event handlers`);
  check(!/xlink:href|https?:\/\/(?!www\.w3\.org)/.test(svg), `${file} has external references`);
  check(!/<filter\b|<feGaussianBlur/.test(svg), `${file} uses filters, which hurt small-size rendering`);
}
check(existsSync(join(distDir, 'favicon.svg')), 'dist/favicon.svg is missing');

// 7. SEO files must exist, be well-formed and agree with the deployed origin.
const ORIGIN = 'https://fluxenitemc.github.io/Ai-hub';
const robotsPath = join(distDir, 'robots.txt');
const sitemapPath = join(distDir, 'sitemap.xml');

if (!existsSync(robotsPath)) {
  check(false, 'dist/robots.txt is missing');
} else {
  const robots = readFileSync(robotsPath, 'utf8');
  check(/^User-agent:\s*\*/m.test(robots), 'robots.txt has no User-agent group');
  check(/^Sitemap:\s*https?:\/\//m.test(robots), 'robots.txt does not declare an absolute Sitemap');
  check(!/Disallow:\s*\/\s*$/m.test(robots), 'robots.txt blocks the whole site');
}

if (!existsSync(sitemapPath)) {
  check(false, 'dist/sitemap.xml is missing');
} else {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  check(
    sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'),
    'sitemap.xml is missing its XML declaration',
  );
  check(
    sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'),
    'sitemap.xml has no urlset namespace',
  );
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check(locs.length > 0, 'sitemap.xml lists no URLs');
  check(
    locs.every((loc) => loc.startsWith(`${ORIGIN}/`)),
    'sitemap.xml contains URLs outside the deployed origin',
  );
  check(
    [...sitemap.matchAll(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)].every((m) => m[1] <= new Date().toISOString().slice(0, 10)),
    'sitemap.xml has a future lastmod',
  );
  check(!/<lastmod>undefined/.test(sitemap), 'sitemap.xml has an undefined lastmod');
}

// 8. Crawlable SEO essentials in the built index.html.
if (html) {
  check(/<title>[^<]{10,}<\/title>/.test(html), 'index.html has no meaningful <title>');
  check(
    /<meta\s+name="description"\s+content="[^"]{80,}"/.test(html),
    'index.html has no substantive meta description',
  );
  check(/<link\s+rel="canonical"/.test(html), 'index.html has no canonical link');
  check(/property="og:title"/.test(html) && /property="og:description"/.test(html),
    'index.html is missing Open Graph tags');
  check(/name="twitter:card"/.test(html), 'index.html has no Twitter card tag');
  check(/<noscript>/.test(html), 'index.html has no <noscript> fallback');
  check(/id="boot"/.test(html), 'index.html has no pre-hydration shell');
  check(/aihub:boot-retry/.test(html), 'index.html has no boot self-heal retry guard');

  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!ld) {
    check(false, 'index.html has no JSON-LD structured data');
  } else {
    let parsed = null;
    try {
      parsed = JSON.parse(ld[1]);
    } catch {
      check(false, 'JSON-LD is not valid JSON');
    }
    if (parsed) {
      const types = (parsed['@graph'] ?? []).map((n) => n['@type']);
      check(types.includes('WebSite'), 'JSON-LD is missing a WebSite node');
      check(types.includes('Dataset'), 'JSON-LD is missing a Dataset node');
      check(types.includes('ItemList'), 'JSON-LD is missing an ItemList node');
    }
  }
}

if (failures.length > 0) {
  console.error(`✖ Build verification failed (${failures.length}):\n`);
  for (const failure of failures) console.error(`  • ${failure}`);
  process.exit(1);
}

const totalKb = jsFiles.reduce((sum, file) => sum + statSync(file).size, 0);
console.log('✓ Build verification passed');
console.log(`  dist        ${distDir}`);
console.log(`  base path   ${EXPECTED_BASE}`);
console.log(`  js chunks   ${jsFiles.length} (${(totalKb / 1024).toFixed(0)} KB uncompressed)`);
console.log('  catalog     inlined at build time (no runtime GitHub fetch)');