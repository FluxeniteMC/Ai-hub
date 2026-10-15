/**
 * Minimal Markdown -> block AST parser.
 *
 * The weekly report is AI-generated Markdown. Rather than shipping a Markdown
 * renderer to the browser or injecting raw HTML, the report is parsed once at
 * build time into a small block tree and rendered as React elements. That
 * keeps the client bundle free of a Markdown dependency and makes injection of
 * report content structurally impossible.
 *
 * Supports the subset the reports actually use: headings, paragraphs, rules,
 * ordered/unordered lists, tables, fenced code, and bold/italic/code/links.
 */

/** Inline node: { t: 'text'|'b'|'i'|'code'|'a', v: string, href?: string } */

/**
 * Parses a single line of inline Markdown into inline nodes.
 * Emphasis is handled with a small hand-written scanner rather than a regex
 * so that nested combinations such as *text **bold** text* behave.
 */
export function parseInline(input) {
  const nodes = [];
  const pattern = /(\*\*([^*]+)\*\*)|(\*([^*\n]+)\*)|(`([^`]+)`)|(\[([^\]]*)\]\(([^)\s]+)\))/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(input)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ t: 'text', v: input.slice(lastIndex, match.index) });
    }
    if (match[2] !== undefined) nodes.push({ t: 'b', v: match[2] });
    else if (match[4] !== undefined) nodes.push({ t: 'i', v: match[4] });
    else if (match[6] !== undefined) nodes.push({ t: 'code', v: match[6] });
    else if (match[8] !== undefined) {
      // Only allow http(s) targets; anything else is kept as plain text.
      const href = match[9];
      if (/^https?:\/\//i.test(href)) nodes.push({ t: 'a', v: match[8], href });
      else nodes.push({ t: 'text', v: match[8] });
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < input.length) nodes.push({ t: 'text', v: input.slice(lastIndex) });
  return nodes.length > 0 ? nodes : [{ t: 'text', v: '' }];
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableSeparator(line) {
  return /^\s*\|?[\s:|-]*-{2,}[\s:|-]*\|?\s*$/.test(line) && line.includes('-');
}

/**
 * Parses Markdown into a flat list of blocks.
 * @param {string} markdown
 * @returns {object[]}
 */
export function parseMarkdown(markdown) {
  const lines = String(markdown ?? '').split(/\r?\n/);
  const blocks = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();

    // Blank
    if (!trimmed) {
      i += 1;
      continue;
    }

    // Fenced code
    const fence = trimmed.match(/^(`{3,}|~{3,})(.*)$/);
    if (fence) {
      const marker = fence[1][0];
      const language = fence[2].trim();
      const buffer = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? '').trim().startsWith(marker)) {
        buffer.push(lines[i] ?? '');
        i += 1;
      }
      i += 1; // closing fence
      blocks.push({ type: 'code', language, value: buffer.join('\n') });
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    // Heading
    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({
        type: 'heading',
        level: (heading[1] ?? '#').length,
        children: parseInline(heading[2] ?? ''),
      });
      i += 1;
      continue;
    }

    // Table: a header row followed by a separator row
    if (trimmed.startsWith('|') && isTableSeparator(lines[i + 1] ?? '')) {
      const header = splitRow(trimmed).map(parseInline);
      const rows = [];
      i += 2;
      while (i < lines.length && (lines[i] ?? '').trim().startsWith('|')) {
        rows.push(splitRow(lines[i] ?? '').map(parseInline));
        i += 1;
      }
      blocks.push({ type: 'table', header, rows });
      continue;
    }

    // List (ordered or unordered)
    const listItem = trimmed.match(/^([-*+]|\d+[.)])\s+(.*)$/);
    if (listItem) {
      const ordered = /\d/.test(listItem[1] ?? '');
      const items = [];
      while (i < lines.length) {
        const current = (lines[i] ?? '').trim();
        const item = current.match(/^([-*+]|\d+[.)])\s+(.*)$/);
        if (!item) break;
        items.push(parseInline(item[2] ?? ''));
        i += 1;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    // Paragraph: consume until a blank line or the start of another block
    const buffer = [];
    while (i < lines.length) {
      const current = (lines[i] ?? '').trim();
      if (!current) break;
      if (
        current.startsWith('|') ||
        /^#{1,6}\s/.test(current) ||
        /^(-{3,}|\*{3,}|_{3,})$/.test(current) ||
        /^([-*+]|\d+[.)])\s+/.test(current) ||
        /^(`{3,}|~{3,})/.test(current)
      ) {
        break;
      }
      buffer.push(current);
      i += 1;
    }
    if (buffer.length > 0) {
      blocks.push({ type: 'paragraph', children: parseInline(buffer.join(' ')) });
    }
  }

  return blocks;
}

/** Strips markup so a block can be used as a plain-text preview or title. */
export function inlineToText(nodes) {
  return nodes.map((node) => node.v).join('');
}