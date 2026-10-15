import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  dedupeKey,
  extractLink,
  isPlaceholder,
  parseContext,
  parseCost,
  parseReadme,
  slugify,
  splitCells,
  stripEmoji,
  toPlainText,
} from './lib/readme-parser.mjs';
import { validateCatalog } from './lib/validate-catalog.mjs';
import { inlineToText, parseInline, parseMarkdown } from './lib/markdown.mjs';

test('stripEmoji removes pictographs but keeps words', () => {
  // Heading markers are removed by the caller before this runs.
  assert.equal(stripEmoji('🧠 By Category'), 'By Category');
  assert.equal(stripEmoji('🚀 Free Tier APIs'), 'Free Tier APIs');
  assert.equal(stripEmoji('Large Language Models (LLMs)'), 'Large Language Models (LLMs)');
  assert.equal(stripEmoji('Plain Title'), 'Plain Title');
});

test('splitCells handles padding, escapes and edges', () => {
  assert.deepEqual(splitCells('| a | b |'), ['a', 'b']);
  assert.deepEqual(splitCells('| a | b |'), ['a', 'b']);
  assert.deepEqual(splitCells('| a \\| b | c |'), ['a | b', 'c']);
});

test('toPlainText strips inline markdown', () => {
  assert.equal(toPlainText('[Ollama](https://ollama.ai/)'), 'Ollama');
  assert.equal(toPlainText('`ollama run llama3`'), 'ollama run llama3');
  assert.equal(toPlainText('**600+ models**'), '600+ models');
  assert.equal(toPlainText('line<br>break'), 'line break');
  assert.equal(toPlainText('<img src="x" /> text'), 'text');
});

test('extractLink reads the first markdown link', () => {
  assert.deepEqual(extractLink('[Ollama](https://ollama.ai/)'), {
    label: 'Ollama',
    url: 'https://ollama.ai/',
  });
  assert.equal(extractLink('GPT-6 Astra'), null);
});

test('isPlaceholder recognises blank-ish cells', () => {
  for (const value of ['', '-', '—', 'N/A', 'none']) {
    assert.equal(isPlaceholder(value), true, `${value} should be a placeholder`);
  }
  assert.equal(isPlaceholder('OpenAI'), false);
});

test('slugify produces stable URL-safe ids', () => {
  assert.equal(slugify('GPT-6.1 Sol'), 'gpt-6-1-sol');
  assert.equal(slugify('Claude Opus 5.5'), 'claude-opus-5-5');
  assert.equal(slugify('o3 / o4-mini (legacy)'), 'o3-o4-mini-legacy');
  assert.equal(slugify('***'), 'entry');
});

test('dedupeKey folds variants of the same listing', () => {
  assert.equal(dedupeKey('Mistral Small 4'), dedupeKey('mistral small 4'));
  assert.equal(dedupeKey('o3 / o4-mini (legacy)'), dedupeKey('o3 / o4-mini (legacy)'));
});

test('parseContext converts shorthand windows', () => {
  assert.deepEqual(parseContext('200K'), { context: '200K', contextTokens: 200_000 });
  assert.deepEqual(parseContext('200K+'), { context: '200K+', contextTokens: 200_000 });
  assert.deepEqual(parseContext('1M'), { context: '1M', contextTokens: 1_000_000 });
  assert.deepEqual(parseContext('—'), { context: null, contextTokens: null });
  assert.deepEqual(parseContext(''), { context: null, contextTokens: null });
});

test('parseCost only splits genuine input/output pairs', () => {
  const pair = parseCost('💰 $6.00/$30.00 per 1M');
  assert.equal(pair.inputPerMTokens, 6);
  assert.equal(pair.outputPerMTokens, 30);
  assert.equal(pair.isFree, false);

  // "$15/1M" is a single rate, never an input/output pair.
  const single = parseCost('$30/1M image tokens');
  assert.equal(single.inputPerMTokens, null);
  assert.equal(single.outputPerMTokens, null);

  const free = parseCost('🆓 Free / $0.80/$4.00 per 1M');
  assert.equal(free.isFree, true);
  assert.equal(free.inputPerMTokens, 0.8);
  assert.equal(free.outputPerMTokens, 4);

  assert.equal(parseCost('—').costText, null);
  assert.equal(parseCost('🆓 Free').isFree, true);
});

test('parseReadme ignores tables inside code fences', () => {
  const markdown = [
    '## By Category',
    '',
    '```',
    '| Model | Provider |',
    '|-------|----------|',
    '| Fenced Row | Nobody |',
    '```',
    '',
    '| Model | Provider |',
    '|-------|----------|',
    '| Real Row | Someone |',
  ].join('\n');

  const result = parseReadme(markdown);
  assert.equal(result.entries.length, 1);
  assert.equal(result.entries[0].name, 'Real Row');
});

test('parseReadme excludes non-catalog sections', () => {
  const markdown = [
    '## Changelog',
    '',
    '| Date | Change |',
    '|------|--------|',
    '| 2026-01-01 | Something |',
    '',
    '## By Category',
    '',
    '| Model | Provider |',
    '|-------|----------|',
    '| Real Row | Someone |',
  ].join('\n');

  const result = parseReadme(markdown);
  assert.equal(result.entries.length, 1);
  assert.equal(result.entries[0].name, 'Real Row');
});

test('parseReadme merges duplicate listings into one entry', () => {
  const markdown = [
    '## By Category',
    '',
    '### Models',
    '',
    '| Model | Provider |',
    '|-------|----------|',
    '| Shared Model | OpenAI |',
    '',
    '| Model | Provider |',
    '|-------|----------|',
    '| Shared Model | OpenAI |',
  ].join('\n');

  const result = parseReadme(markdown);
  assert.equal(result.entries.length, 1);
  assert.equal(result.entries[0].listingCount, 2);
  assert.equal(result.stats.duplicateCount, 1);
});

test('parseReadme tolerates ragged rows', () => {
  const markdown = [
    '## By Category',
    '',
    '| API | Provider | Cost |',
    '|-----|----------|------|',
    '| Ragged Row | Someone | $1 | extra cell |',
  ].join('\n');

  const result = parseReadme(markdown);
  assert.equal(result.entries.length, 1);
  assert.ok(result.warnings.some((warning) => warning.type === 'ragged-row'));
  // The overflow cell is preserved rather than dropped.
  assert.ok(result.entries[0].attributes.some((a) => a.value.includes('extra cell')));
});

test('parseReadme assigns unique slug ids', () => {
  const markdown = [
    '## By Category',
    '',
    '| Model | Provider |',
    '|-------|----------|',
    '| GPT-4o | OpenAI |',
    '| GPT-4O | Someone |',
  ].join('\n');

  const result = parseReadme(markdown);
  const ids = result.entries.map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('parseReadme reports an empty catalog instead of throwing', () => {
  const result = parseReadme('# Nothing here\n');
  assert.deepEqual(result.entries, []);
  assert.ok(validateCatalog({ entries: [] }).length > 0);
});

test('validateCatalog accepts a well-formed catalog', () => {
  const markdown = [
    '## By Category',
    '',
    '| Model | Provider | Context | Cost |',
    '|-------|----------|---------|------|',
    '| Good Model | OpenAI | 200K | $1.00/$2.00 per 1M |',
  ].join('\n');

  const parsed = parseReadme(markdown);
  const problems = validateCatalog({
    entries: parsed.entries,
    source: { repository: 'x', fingerprint: 'y' },
  });
  assert.deepEqual(problems, []);
});

test('validateCatalog rejects duplicate ids and bad urls', () => {
  const problems = validateCatalog({
    entries: [
      { id: 'dup', name: 'A', kind: 'model', url: null, attributes: [], contextTokens: null },
      { id: 'dup', name: 'B', kind: 'model', url: 'not-a-url', attributes: [], contextTokens: null },
      { id: 'Bad_ID', name: 'C', kind: 'nope', url: null, attributes: [], contextTokens: NaN },
    ],
    source: {},
  });

  const joined = problems.join('\n');
  assert.match(joined, /duplicate id/);
  assert.match(joined, /not a URL-safe slug/);
  assert.match(joined, /not an absolute/);
  assert.match(joined, /unknown kind/);
  assert.match(joined, /contextTokens/);
});

test('parseInline understands bold, italic, code and links', () => {
  assert.deepEqual(parseInline('plain'), [{ t: 'text', v: 'plain' }]);
  assert.deepEqual(parseInline('**bold**'), [{ t: 'b', v: 'bold' }]);
  assert.deepEqual(parseInline('*em*'), [{ t: 'i', v: 'em' }]);
  assert.deepEqual(parseInline('`x`'), [{ t: 'code', v: 'x' }]);
  assert.deepEqual(parseInline('[t](https://e.com)'), [{ t: 'a', v: 't', href: 'https://e.com' }]);
});

test('parseInline refuses non-http link targets', () => {
  // javascript: URLs must never survive into renderable nodes.
  for (const input of ['[click](javascript:alert(1))', '[x](data:text/html,<h1>x</h1>)', '[y](ftp://a.b)']) {
    const nodes = parseInline(input);
    assert.equal(nodes.some((n) => n.t === 'a'), false, `${input} must not produce a link`);
    assert.ok(inlineToText(nodes).includes('click') || inlineToText(nodes).includes('x') || inlineToText(nodes).includes('y'));
  }
});

test('parseMarkdown builds headings, lists, rules and tables', () => {
  const blocks = parseMarkdown(
    [
      '# Title',
      '',
      'Intro paragraph.',
      '',
      '---',
      '',
      '### Section',
      '',
      '1. **first**',
      '2. second',
      '',
      '* alpha',
      '* beta',
      '',
      '| A | B |',
      '|---|---|',
      '| 1 | 2 |',
    ].join('\n'),
  );

  const types = blocks.map((b) => b.type);
  assert.deepEqual(types, [
    'heading', 'paragraph', 'hr', 'heading', 'list', 'list', 'table',
  ]);
  assert.equal(blocks[0].level, 1);
  assert.equal(inlineToText(blocks[0].children), 'Title');
  assert.equal(blocks[4].ordered, true);
  assert.equal(blocks[4].items.length, 2);
  assert.equal(blocks[5].ordered, false);
  assert.equal(blocks[6].header.length, 2);
  assert.equal(blocks[6].rows.length, 1);
});

test('parseMarkdown keeps HTML as inert text, never as markup', () => {
  const blocks = parseMarkdown('<script>alert(1)</script>\n\nText here.');
  // Two blank-line-separated paragraphs, which is correct Markdown.
  assert.equal(blocks.length, 2);
  assert.ok(blocks.every((b) => b.type === 'paragraph'));
  // The tag survives only as a text node, which React escapes — never executed.
  assert.equal(inlineToText(blocks[0].children), '<script>alert(1)</script>');
  assert.equal(inlineToText(blocks[1].children), 'Text here.');
});

test('parseMarkdown returns an empty list for empty input', () => {
  assert.deepEqual(parseMarkdown(''), []);
  assert.deepEqual(parseMarkdown(null), []);
});

test('the real weekly report parses into usable blocks', async () => {
  const { readFileSync } = await import('node:fs');
  const { resolve } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  const here = fileURLToPath(new URL('.', import.meta.url));
  const markdown = readFileSync(resolve(here, '../../reports/weekly-report.md'), 'utf8');
  const blocks = parseMarkdown(markdown);

  assert.ok(blocks.length > 5, 'expected the report to produce blocks');
  assert.ok(blocks.some((b) => b.type === 'heading' && b.level === 1), 'expected a title heading');
  assert.ok(blocks.some((b) => b.type === 'list'), 'expected at least one list');

  // Nothing dangerous may reach a link node.
  for (const block of blocks) {
    const nodeLists = [];
    if (block.children) nodeLists.push(block.children);
    if (block.items) nodeLists.push(...block.items);
    for (const nodes of nodeLists) {
      for (const node of nodes) {
        if (node.t === 'a') assert.match(node.href, /^https?:\/\//);
      }
    }
  }
});

test('the real repository README produces a valid catalog', async () => {
  const { readFileSync } = await import('node:fs');
  const { resolve } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  const here = fileURLToPath(new URL('.', import.meta.url));
  const markdown = readFileSync(resolve(here, '../../README.md'), 'utf8');
  const parsed = parseReadme(markdown);

  assert.ok(parsed.entries.length > 400, `expected a large catalog, got ${parsed.entries.length}`);
  assert.deepEqual(validateCatalog({ entries: parsed.entries, source: {} }), []);

  const ids = parsed.entries.map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length, 'ids must be unique');

  // Non-catalog tables must never leak in.
  const leaked = parsed.entries.filter((entry) =>
    /changelog|automation|contribute|table of contents/i.test(entry.section),
  );
  assert.equal(leaked.length, 0, 'non-catalog sections must be excluded');

  // No date-shaped rows from the changelog.
  const dates = parsed.entries.filter((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry.name));
  assert.equal(dates.length, 0);

  // The website documentation section must not become catalog data.
  const websiteLeak = parsed.entries.filter((entry) => /ai hub website/i.test(entry.section));
  assert.equal(websiteLeak.length, 0, 'the AI Hub Website section must be excluded');
});

test('the AI Hub Website README section is excluded from the catalog', () => {
  const markdown = [
    '## AI Hub Website',
    '',
    '| | |',
    '|---|---|',
    '| **Stack** | React + TypeScript + Vite |',
    '',
    '## By Category',
    '',
    '| Model | Provider |',
    '|-------|----------|',
    '| Real Row | Someone |',
  ].join('\n');

  const result = parseReadme(markdown);
  assert.equal(result.entries.length, 1);
  assert.equal(result.entries[0].name, 'Real Row');
});