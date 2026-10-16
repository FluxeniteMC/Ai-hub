"use strict";

/**
 * Deterministic file IO for generated artifacts.
 *
 * Two properties matter for the catalog pipeline:
 *   1. Serialisation is stable — same input always produces byte-identical
 *      output, so `git diff` shows real changes and nothing else.
 *   2. A file is only rewritten when its content actually changed. Rewriting
 *      identical bytes would make every daily run look like a change and
 *      produce an empty pull request.
 */

const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

const log = require("./log");

/**
 * JSON with sorted object keys and a trailing newline.
 *
 * `JSON.stringify` preserves insertion order, which depends on the order fields
 * were assigned while parsing upstream responses. Recursively sorting removes
 * that dependency so two runs over equivalent data serialise identically.
 */
function stableStringify(value, { indent = 2 } = {}) {
  return `${sortKeys(value, indent, 0)}\n`;
}

function sortKeys(value, indent, depth) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    const items = value.map((item) => sortKeys(item, indent, depth));
    if (items.length === 0) return "[]";
    return `[\n${items.map((i) => pad(indent, depth + 1) + i).join(",\n")}\n${pad(indent, depth)}]`;
  }

  const keys = Object.keys(value).filter((key) => value[key] !== undefined).sort();
  if (keys.length === 0) return "{}";
  const body = keys.map(
    (key) => `${pad(indent, depth + 1)}${JSON.stringify(key)}: ${sortKeys(value[key], indent, depth + 1)}`,
  );
  return `{\n${body.join(",\n")}\n${pad(indent, depth)}}`;
}

const pad = (indent, depth) => " ".repeat(indent * depth);

/**
 * Writes `content` to `filePath` only when it differs from what is on disk.
 *
 * @returns {{changed: boolean, reason: string}}
 */
function writeIfChanged(filePath, content) {
  const absolute = path.resolve(filePath);

  if (fs.existsSync(absolute)) {
    const current = fs.readFileSync(absolute, "utf8");
    if (current === content) {
      log.skip(`unchanged: ${path.basename(absolute)}`);
      return { changed: false, reason: "identical" };
    }
  } else {
    log.info(`create: ${path.basename(absolute)}`);
  }

  fs.mkdirSync(path.dirname(absolute), { recursive: true });

  // Write to a sibling temp file then rename, so a crash mid-write can never
  // leave a truncated catalog behind.
  const temporary = `${absolute}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, content, "utf8");
  fs.renameSync(temporary, absolute);

  log.ok(`wrote: ${path.basename(absolute)} (${content.length} bytes)`);
  return { changed: true, reason: fs.existsSync(absolute) ? "content" : "created" };
}

function writeJsonIfChanged(filePath, value, options) {
  return writeIfChanged(filePath, stableStringify(value, options));
}

function readJson(filePath, fallback = null) {
  const absolute = path.resolve(filePath);
  if (!fs.existsSync(absolute)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(absolute, "utf8"));
  } catch (error) {
    log.warn(`${path.basename(absolute)} is unreadable (${error.message}) — using fallback`);
    return fallback;
  }
}

/**
 * Fields that legitimately change on every run and carry no data signal.
 * Stripped at any depth for change detection only.
 */
const VOLATILE_FIELDS = ["generated_at", "observed_at"];

/**
 * True when `envelope` carries different *data* than what is already on disk.
 *
 * Run and observation timestamps change every time even when a provider returns
 * an identical catalog. Comparing them would make every scheduled run look like
 * a change and produce a pull request with an empty diff. They are excluded for
 * the comparison only; when the data is unchanged the file is left entirely
 * untouched, so `generated_at` keeps meaning "when this content last changed".
 */
function envelopeDataChanged(filePath, envelope) {
  const absolute = path.resolve(filePath);
  if (!fs.existsSync(absolute)) return true;

  const previous = readJson(absolute, null);
  if (!previous) return true;

  const strip = (value) => {
    if (Array.isArray(value)) return value.map(strip);
    if (value && typeof value === "object") {
      const out = {};
      for (const key of Object.keys(value).sort()) {
        if (VOLATILE_FIELDS.includes(key)) continue;
        out[key] = strip(value[key]);
      }
      return out;
    }
    return value;
  };

  return stableStringify(strip(previous)) !== stableStringify(strip(envelope));
}

/**
 * Writes an envelope only when its data changed.
 * @returns {{changed: boolean, skipped?: boolean}}
 */
function writeEnvelopeIfChanged(filePath, envelope) {
  if (!envelopeDataChanged(filePath, envelope)) {
    log.skip(`unchanged: ${path.basename(path.resolve(filePath))} (data identical)`);
    return { changed: false, skipped: true };
  }
  return writeJsonIfChanged(filePath, envelope);
}

/**
 * Lowercase slug that is stable for a given input.
 *
 * A name written entirely in a non-Latin script folds to nothing usable, so a
 * short digest of the original is used instead — the identifier stays URL-safe
 * and deterministic, which matters because it becomes a record key.
 */
function slugify(value) {
  const text = String(value ?? "");
  const slug = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  if (slug.length >= 2) return slug;
  return `m-${createHash("sha1").update(text, "utf8").digest("hex").slice(0, 12)}`;
}

module.exports = {
  stableStringify,
  writeIfChanged,
  writeJsonIfChanged,
  writeEnvelopeIfChanged,
  envelopeDataChanged,
  readJson,
  slugify,
  VOLATILE_FIELDS,
};