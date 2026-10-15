/**
 * Catalog validation rules shared by the generator, the CI check and tests.
 * Returns a list of human-readable problems; an empty list means valid.
 */

const ALLOWED_KINDS = new Set(['model', 'api', 'tool', 'database', 'runner']);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateCatalog(catalog) {
  const problems = [];

  if (!catalog || typeof catalog !== 'object') {
    return ['Catalog is not an object'];
  }
  if (!Array.isArray(catalog.entries)) {
    return ['Catalog.entries is not an array'];
  }
  if (!catalog.source || typeof catalog.source !== 'object') {
    problems.push('Catalog.source is missing');
  }
  if (catalog.entries.length === 0) {
    problems.push('Catalog contains no entries — the README parser matched nothing');
  }

  const seenIds = new Map();
  const seenKeys = new Map();

  for (const [index, entry] of catalog.entries.entries()) {
    const where = `entries[${index}]`;

    if (typeof entry.id !== 'string' || entry.id.length === 0) {
      problems.push(`${where}: missing id`);
    } else if (!ID_PATTERN.test(entry.id)) {
      problems.push(`${where}: id "${entry.id}" is not a URL-safe slug`);
    } else if (seenIds.has(entry.id)) {
      problems.push(
        `${where}: duplicate id "${entry.id}" (also at entries[${seenIds.get(entry.id)}])`,
      );
    } else {
      seenIds.set(entry.id, index);
    }

    if (typeof entry.name !== 'string' || entry.name.trim() === '') {
      problems.push(`${where}: missing name`);
    }

    const nameKey = entry.name?.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (nameKey) {
      if (seenKeys.has(nameKey)) {
        problems.push(
          `${where}: duplicate listing "${entry.name}" (also at entries[${seenKeys.get(nameKey)}])`,
        );
      } else {
        seenKeys.set(nameKey, index);
      }
    }

    if (!ALLOWED_KINDS.has(entry.kind)) {
      problems.push(`${where}: unknown kind "${entry.kind}"`);
    }

    if (entry.url !== null && entry.url !== undefined) {
      if (typeof entry.url !== 'string' || !/^https?:\/\//.test(entry.url)) {
        problems.push(`${where}: url "${entry.url}" is not an absolute http(s) URL`);
      }
    }

    for (const [field, value] of [
      ['contextTokens', entry.contextTokens],
      ['inputPerMTokens', entry.inputPerMTokens],
      ['outputPerMTokens', entry.outputPerMTokens],
    ]) {
      if (value !== null && value !== undefined && !Number.isFinite(value)) {
        problems.push(`${where}: ${field} must be a finite number or null, got ${value}`);
      }
    }

    if (!Array.isArray(entry.attributes)) {
      problems.push(`${where}: attributes must be an array`);
    } else {
      entry.attributes.forEach((attribute, attributeIndex) => {
        if (typeof attribute?.label !== 'string' || typeof attribute?.value !== 'string') {
          problems.push(`${where}.attributes[${attributeIndex}]: expected {label, value} strings`);
        }
      });
    }
  }

  return problems;
}