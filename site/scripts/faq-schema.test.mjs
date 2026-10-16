/**
 * Keeps the generated FAQPage structured data in sync with the FAQ page itself.
 *
 * `generate-seo.mjs` must stay plain Node (it runs before Vite), so it cannot
 * import the TypeScript page. This test closes that gap: it extracts the
 * questions rendered by `FaqPage.tsx` and asserts the schema contains each one,
 * so the duplication cannot silently drift.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, '..');

const faqSource = readFileSync(resolve(siteRoot, 'src/pages/FaqPage.tsx'), 'utf8');
const seoSource = readFileSync(resolve(siteRoot, 'scripts/generate-seo.mjs'), 'utf8');

/** Files scanned for entity-in-string-literal mistakes. */
const SOURCES = {
  'src/pages/FaqPage.tsx': faqSource,
  'src/pages/TermsPage.tsx': readFileSync(resolve(siteRoot, 'src/pages/TermsPage.tsx'), 'utf8'),
  'src/pages/PrivacyPage.tsx': readFileSync(resolve(siteRoot, 'src/pages/PrivacyPage.tsx'), 'utf8'),
  'scripts/generate-seo.mjs': seoSource,
};

/**
 * Normalises a JS string literal for comparison against the schema file.
 *
 * Three things differ harmlessly between the two sources and must not be
 * treated as drift: HTML entities (which JSX decodes but JS literals do not),
 * escaped quotes, and typographic punctuation. Only wording should fail.
 */
function decodeLiteral(raw) {
  return raw
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"');
}

/** Questions as written in the page's GROUPS array. */
function pageQuestions() {
  return [...faqSource.matchAll(/^\s{8}question:\s*'((?:[^'\\]|\\')*)',$/gm)].map((m) =>
    decodeLiteral(m[1]),
  );
}

/** Questions as written in generate-seo.mjs's FAQ_ENTITIES array. */
function schemaQuestions() {
  const block = seoSource.slice(seoSource.indexOf('const FAQ_ENTITIES'));
  return [...block.matchAll(/^\s+question:\s*\n?\s*'((?:[^'\\]|\\')*)',$/gm)].map((m) =>
    decodeLiteral(m[1]),
  );
}

/**
 * Entities are only decoded inside JSX text, never inside a JS string literal,
 * so `description: '... &ldquo;x&rdquo; ...'` renders the entity verbatim.
 * Catches that mistake at build time rather than on the rendered page.
 */
test('no HTML entities are used inside JS string literals', () => {
  const offenders = [];

  for (const [name, source] of Object.entries(SOURCES)) {
    // Matches `prop: 'value',` / `prop: "value",` — a value assignment, not
    // JSX text (where an attribute is preceded by whitespace, never a colon).
    for (const match of source.matchAll(/:\s*\n?\s*(['"])(?:(?!\1)[^\\\n]|\\.)*\1[,;]/g)) {
      const value = match[0];
      if (!/&[a-z]+;|&#\d+;/.test(value)) continue;
      offenders.push(`${name}: ${value.replace(/\s+/g, ' ').slice(0, 90)}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `HTML entities inside a JS string literal (JSX decodes them, JS does not):\n  ${offenders.join('\n  ')}`,
  );
});

test('the FAQ page defines questions', () => {
  const questions = pageQuestions();
  assert.ok(questions.length >= 20, `expected a substantial FAQ, found ${questions.length}`);
  assert.equal(
    new Set(questions).size,
    questions.length,
    'the FAQ contains duplicate questions',
  );
});

test('structured data covers every question rendered on the FAQ page', () => {
  const page = pageQuestions();
  const schema = new Set(schemaQuestions());

  const missing = page.filter((question) => !schema.has(question));
  assert.deepEqual(
    missing,
    [],
    `these questions are on the page but missing from FAQ_ENTITIES in generate-seo.mjs:\n  ${missing.join('\n  ')}`,
  );
});

test('structured data introduces no questions that are not on the page', () => {
  const page = new Set(pageQuestions());
  const extra = schemaQuestions().filter((question) => !page.has(question));

  assert.deepEqual(
    extra,
    [],
    `FAQ_ENTITIES lists questions that no longer exist on the page:\n  ${extra.join('\n  ')}`,
  );
});

test('every structured-data answer is non-empty prose', () => {
  const block = seoSource.slice(seoSource.indexOf('const FAQ_ENTITIES'));
  const answers = [...block.matchAll(/answer:\s*\n?\s*'((?:[^'\\]|\\')*)'/g)].map((m) =>
    decodeLiteral(m[1]),
  );

  assert.equal(answers.length, schemaQuestions().length, 'an FAQ entry has no answer');

  for (const answer of answers) {
    // Answers must be plain sentences, not markup or placeholder text.
    assert.ok(!/[<>{}]/.test(answer), `answer contains markup: ${answer.slice(0, 60)}`);
    assert.ok(!/https?:\/\//.test(answer), `answer contains a raw URL: ${answer.slice(0, 60)}`);
    assert.ok(answer.trim().length >= 40, `answer is too short: ${answer.slice(0, 60)}`);
    assert.ok(!/\bTODO\b|\bTBD\b/i.test(answer), 'answer is a placeholder');
  }
});

test('the sitemap advertises the three new routes', () => {
  for (const hash of ['/faq', '/terms', '/privacy']) {
    assert.ok(seoSource.includes(`hash: '${hash}'`), `sitemap is missing ${hash}`);
  }
});