/**
 * Readme catalog parser.
 *
 * The repository README is the single authoritative source for the AI Hub
 * catalog. This module turns its markdown tables into a validated, normalized
 * catalog that the static site renders. It runs at build time only.
 *
 * Design rules:
 *  - Never invent data. Every field is derived verbatim from the README.
 *  - Be tolerant of messy input (ragged rows, missing cells, inline markup).
 *  - Be deterministic so generated ids are stable across rebuilds.
 */

const EXCLUDED_SECTIONS = new Set([
  'table of contents',
  'ai hub website',
  'how automation works',
  'how to contribute',
  'changelog',
  'getting started guide',
  'faq',
]);

/** Maps a README section to the entry kind when the table header is ambiguous. */
const SECTION_KIND = new Map(
  Object.entries({
    'open source models': 'model',
    'open source image models': 'model',
    'open source audio models': 'model',
    'open source video models': 'model',
    'vector databases': 'database',
    'llm runners & servers': 'runner',
    'code generation & dev tools': 'tool',
    'agents & orchestration': 'tool',
    'llm orchestration & rag': 'tool',
    'prompt management': 'tool',
    'llm testing & evaluation': 'tool',
    'fine-tuning platforms': 'tool',
    'api routing & proxy': 'tool',
  }),
);

/** Access-tier sections map to a tier label used for faceting. */
const SECTION_TIER = new Map(
  Object.entries({
    'free tier apis': 'Free',
    'freemium apis': 'Freemium',
    'paid apis': 'Paid',
    'enterprise / expensive apis': 'Enterprise',
    'open source / self-hostable': 'Open Source',
  }),
);

const PLACEHOLDER_CELLS = new Set(['', '-', '--', '—', '–', 'n/a', 'na', 'none', 'tbd']);

/** Removes emoji / pictographs and variation selectors from a heading. */
export function stripEmoji(text) {
  return text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Splits a table row on pipes that are not backslash-escaped. */
export function splitCells(row) {
  const cells = [];
  let current = '';
  for (let i = 0; i < row.length; i += 1) {
    const char = row[i];
    if (char === '\\' && row[i + 1] === '|') {
      current += '|';
      i += 1;
    } else if (char === '|') {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current);
  // A markdown row starts and ends with a pipe, producing empty edge cells.
  return cells.slice(1, -1).map((cell) => cell.trim());
}

export function isSeparatorRow(row) {
  return /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(row.trim());
}

/**
 * Strips inline markdown down to display text, preserving meaning.
 * Handles links, code spans, bold/italic, images and HTML tags.
 */
export function toPlainText(cell) {
  return cell
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1$2')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Extracts the first markdown link target from a cell, if present. */
export function extractLink(cell) {
  const match = cell.match(/\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  return match ? { label: toPlainText(match[1]), url: match[2] } : null;
}

export function isPlaceholder(value) {
  return PLACEHOLDER_CELLS.has(toPlainText(value ?? '').toLowerCase());
}

/** Builds a deterministic, URL-safe slug from a display name. */
export function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'entry';
}

/**
 * Keys used to merge the same listing across sections.
 * Lowercased, whitespace/punctuation-insensitive, markdown stripped.
 */
export function dedupeKey(name) {
  return toPlainText(name)
    .toLowerCase()
    .replace(/\s*\/\s*/g, ' ')
    .replace(/[^a-z0-9]+/g, '');
}

/** Parses a context-window cell such as "200K+", "1M", "—". */
export function parseContext(rawValue) {
  if (!rawValue || isPlaceholder(rawValue)) return { context: null, contextTokens: null };
  const text = toPlainText(rawValue);
  const match = text.match(/([\d.,]+)\s*([kmb])/i);
  if (!match) return { context: text, contextTokens: null };
  const amount = Number(match[1].replace(/,/g, ''));
  if (!Number.isFinite(amount)) return { context: text, contextTokens: null };
  const unit = match[2].toLowerCase();
  const multiplier = unit === 'm' ? 1e6 : unit === 'b' ? 1e9 : 1e3;
  return { context: text, contextTokens: Math.round(amount * multiplier) };
}

/**
 * Extracts pricing only when the README states per-1M-token input/output rates.
 * Deliberately conservative: anything ambiguous stays in `costText` only.
 */
export function parseCost(rawValue) {
  const result = {
    costText: null,
    inputPerMTokens: null,
    outputPerMTokens: null,
    isFree: false,
  };
  if (!rawValue || isPlaceholder(rawValue)) return result;

  const text = toPlainText(rawValue);
  if (!text) return result;
  result.costText = text;
  result.isFree = /\bfree\b/i.test(text);

  // Requires a second currency amount, so "$15/1M" is NOT read as input/output.
  const pair = text.match(/\$\s*([\d.,]+)\s*\/\s*\$\s*([\d.,]+)/);
  if (pair) {
    const input = Number(pair[1].replace(/,/g, ''));
    const output = Number(pair[2].replace(/,/g, ''));
    if (Number.isFinite(input) && Number.isFinite(output)) {
      result.inputPerMTokens = input;
      result.outputPerMTokens = output;
    }
  }
  return result;
}

/** Finds a column by any of the supplied header aliases. */
function findColumn(headers, aliases) {
  return headers.findIndex((header) =>
    aliases.some((alias) => header.toLowerCase().includes(alias)),
  );
}

function classifyKind(firstHeader, section) {
  const header = firstHeader.toLowerCase();
  if (/\bmodel\b/.test(header)) return 'model';
  if (/^(db|database)$|vector database/.test(header)) return 'database';
  if (/^project$|runner|server/.test(header)) return 'runner';
  if (/tool|framework|platform|service/.test(header)) return 'tool';
  if (/^api/.test(header)) return 'api';
  return SECTION_KIND.get(section.toLowerCase()) ?? 'api';
}

/**
 * Parses README markdown into catalog entries plus diagnostics.
 *
 * @param {string} markdown Full README contents.
 * @returns {{entries: object[], tables: object[], stats: object, warnings: object[]}}
 */
export function parseReadme(markdown) {
  const lines = markdown.split(/\r?\n/);
  const warnings = [];
  const tables = [];

  let section = '';
  let subsection = '';
  let group = null;
  let inFence = false;
  let fenceMarker = '';
  let index = 0;
  /** @type {object[]} Raw per-table-row listings, merged later by `finalize`. */
  const entryOccurrences = [];

  const flushGroup = () => {
    group = null;
  };

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    // Track fenced code blocks so examples are never parsed as catalog data.
    const fence = trimmed.match(/^(`{3,}|~{3,})/);
    if (fence) {
      if (!inFence) {
        inFence = true;
        fenceMarker = fence[1][0];
      } else if (fence[1][0] === fenceMarker) {
        inFence = false;
        fenceMarker = '';
      }
      index += 1;
      continue;
    }
    if (inFence) {
      index += 1;
      continue;
    }

    const h2 = trimmed.match(/^##\s+(.*)$/);
    if (h2) {
      section = stripEmoji(toPlainText(h2[1]));
      subsection = '';
      flushGroup();
      index += 1;
      continue;
    }

    const h3 = trimmed.match(/^###\s+(.*)$/);
    if (h3) {
      subsection = stripEmoji(toPlainText(h3[1]));
      flushGroup();
      index += 1;
      continue;
    }

    const h4 = trimmed.match(/^####\s+(.*)$/);
    if (h4) {
      subsection = stripEmoji(toPlainText(h4[1]));
      flushGroup();
      index += 1;
      continue;
    }

    // Standalone bold lines act as within-section groups ("Frontier / Best-in-Class").
    const bold = trimmed.match(/^\*\*(.+)\*\*$/);
    if (bold && trimmed.length > 2) {
      group = stripEmoji(toPlainText(bold[1]));
      index += 1;
      continue;
    }

    if (!trimmed.startsWith('|')) {
      // Prose closes the current group; blank lines and rules do not.
      if (trimmed && !trimmed.startsWith('>') && !/^(-{3,}|={3,}|\*{3,})$/.test(trimmed)) {
        flushGroup();
      }
      index += 1;
      continue;
    }

    // Collect a contiguous block of table rows.
    const startLine = index + 1;
    const block = [];
    while (index < lines.length && lines[index].trim().startsWith('|')) {
      block.push(lines[index].trim());
      index += 1;
    }

    if (block.length < 2 || !isSeparatorRow(block[1])) {
      warnings.push({ type: 'malformed-table', line: startLine, detail: 'missing separator row' });
      continue;
    }

    const headers = splitCells(block[0]);
    const rows = block.slice(2);
    tables.push({
      line: startLine,
      section,
      subsection,
      group,
      headers,
      rowCount: rows.length,
    });

    if (EXCLUDED_SECTIONS.has(section.toLowerCase())) continue;

    const nameIndex = 0;
    const providerIndex = findColumn(headers, ['provider', 'creator', 'vendor']);
    const contextIndex = findColumn(headers, ['context']);
    const costIndex = findColumn(headers, ['cost', 'pricing', 'price']);
    const notesIndex = findColumn(headers, ['notes', 'standout', 'special']);
    const inputIndex = findColumn(headers, ['input cost', 'input price']);
    const outputIndex = findColumn(headers, ['output cost', 'output price']);

    for (const row of rows) {
      const cells = splitCells(row);

      if (cells.length !== headers.length) {
        warnings.push({
          type: 'ragged-row',
          line: startLine,
          detail: `expected ${headers.length} columns, found ${cells.length}: ${row.slice(0, 80)}`,
        });
      }

      // Ragged rows are tolerated by folding trailing cells into the last column.
      const normalized = [...cells];
      while (normalized.length < headers.length) normalized.push('');
      if (normalized.length > headers.length) {
        const overflow = normalized.splice(headers.length);
        normalized[headers.length - 1] = [normalized[headers.length - 1], ...overflow]
          .filter(Boolean)
          .join(' — ');
      }

      const nameCell = normalized[nameIndex] ?? '';
      const name = toPlainText(nameCell);
      if (!name || PLACEHOLDER_CELLS.has(name.toLowerCase())) {
        warnings.push({ type: 'empty-name', line: startLine, detail: row.slice(0, 80) });
        continue;
      }

      // Reject non-catalog rows that slipped into a catalog section.
      if (/^\d{4}-\d{2}-\d{2}$/.test(name)) continue;

      const link = extractLink(nameCell);
      const provider = providerIndex >= 0 ? toPlainText(normalized[providerIndex] ?? '') : '';
      const contextCell = contextIndex >= 0 ? normalized[contextIndex] : '';

      let costSource = costIndex >= 0 ? normalized[costIndex] : '';
      let input = null;
      let output = null;
      if (inputIndex >= 0 && outputIndex >= 0) {
        const parseIn = Number(toPlainText(normalized[inputIndex] ?? '').replace(/[^0-9.]/g, ''));
        const parseOut = Number(toPlainText(normalized[outputIndex] ?? '').replace(/[^0-9.]/g, ''));
        if (Number.isFinite(parseIn) && parseIn > 0) input = parseIn;
        if (Number.isFinite(parseOut) && parseOut > 0) output = parseOut;
        // The paid-API table splits input/output, so summarize them for display.
        costSource = [normalized[inputIndex], normalized[outputIndex]].filter(Boolean).join(' / ');
      }

      const cost = parseCost(costSource);
      const { context, contextTokens } = parseContext(contextCell);

      const attributes = [];
      normalized.forEach((cell, cellIndex) => {
        const label = headers[cellIndex];
        const value = toPlainText(cell);
        if (!label || !value || PLACEHOLDER_CELLS.has(value.toLowerCase())) return;
        attributes.push({ label, value });
      });

      tables[tables.length - 1].entryRows = (tables[tables.length - 1].entryRows ?? 0) + 1;

      entryOccurrences.push({
        name,
        url: link ? link.url : null,
        provider: provider && !isPlaceholder(provider) ? provider : null,
        kind: classifyKind(headers[nameIndex] ?? '', section),
        section,
        subsection: subsection || null,
        group: group || null,
        tier: SECTION_TIER.get(section.toLowerCase()) ?? null,
        attributes,
        notes: notesIndex >= 0 ? toPlainText(normalized[notesIndex] ?? '') || null : null,
        context,
        contextTokens,
        costText: cost.costText,
        inputPerMTokens: input ?? cost.inputPerMTokens,
        outputPerMTokens: output ?? cost.outputPerMTokens,
        isFree: cost.isFree,
        line: startLine,
        key: dedupeKey(name),
      });
    }
  }

  return finalize(tables, entryOccurrences, warnings);
}

/** Merges duplicate listings and assigns stable ids. */
function finalize(tables, occurrences, warnings) {
  const byKey = new Map();
  const usedIds = new Set();

  for (const occurrence of occurrences) {
    const existing = byKey.get(occurrence.key);
    if (!existing) {
      byKey.set(occurrence.key, { ...occurrence, occurrences: [occurrence] });
      continue;
    }
    existing.occurrences.push(occurrence);
    // Fill gaps from later sightings without overwriting first-seen values.
    existing.url ??= occurrence.url;
    existing.provider ??= occurrence.provider;
    existing.context ??= occurrence.context;
    existing.contextTokens ??= occurrence.contextTokens;
    existing.costText ??= occurrence.costText;
    existing.inputPerMTokens ??= occurrence.inputPerMTokens;
    existing.outputPerMTokens ??= occurrence.outputPerMTokens;
    existing.notes ??= occurrence.notes;
    existing.isFree ||= occurrence.isFree;
    // Prefer the most specific placement when the first sighting was ungrouped.
    existing.subsection ??= occurrence.subsection;
    existing.group ??= occurrence.group;

    const known = new Set(existing.attributes.map((attribute) => attribute.label));
    for (const attribute of occurrence.attributes) {
      if (!known.has(attribute.label)) {
        existing.attributes.push(attribute);
        known.add(attribute.label);
      }
    }

    const sections = new Set(
      [existing.section, ...existing.occurrences.map((item) => item.section)].filter(Boolean),
    );
    existing.sections = [...sections];
    const groups = new Set(existing.occurrences.map((item) => item.group).filter(Boolean));
    existing.groups = [...groups];
  }

  const entries = [];
  for (const value of byKey.values()) {
    const base = slugify(value.name);
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
      warnings.push({ type: 'id-collision', detail: `${value.name} -> ${id}` });
    }
    usedIds.add(id);

    entries.push({
      id,
      name: value.name,
      url: value.url,
      provider: value.provider,
      kind: value.kind,
      section: value.section,
      subsection: value.subsection,
      sections: value.sections ?? [value.section],
      group: value.group,
      groups: value.groups ?? (value.group ? [value.group] : []),
      tier: value.tier,
      attributes: value.attributes,
      notes: value.notes,
      context: value.context,
      contextTokens: value.contextTokens,
      costText: value.costText,
      inputPerMTokens: value.inputPerMTokens,
      outputPerMTokens: value.outputPerMTokens,
      isFree: value.isFree,
      listingCount: value.occurrences.length,
      occurrences: value.occurrences.map((occurrence) => ({
        section: occurrence.section,
        subsection: occurrence.subsection,
        group: occurrence.group,
        line: occurrence.line,
      })),
    });
  }

  entries.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

  return {
    entries,
    tables,
    warnings,
    stats: {
      tableCount: tables.length,
      occurrenceCount: occurrences.length,
      entryCount: entries.length,
      duplicateCount: occurrences.length - entries.length,
    },
  };
}