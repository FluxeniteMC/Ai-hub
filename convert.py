#!/usr/bin/env python3
"""convert.py — README.md  ->  data/readme-models.json

Extracts model records from the repository README and emits a schema-1.0.0
envelope identical in shape to the provider catalogs, so ``js/build-models.js``
can merge all three without special-casing.

Supported input formats
-----------------------
1. **Markdown tables** under a heading, first row a header, first column the
   model name (optionally a markdown link). Columns are matched by header name,
   case-insensitively, exact alias first then contains-match:

   ==================  ==================================================
   Field              Header aliases
   ==================  ==================================================
   name               model name, name, model, api, service, tool,
                      product
   model_id           model id, modelid, id, slug, identifier
   provider           provider, vendor, by, from, company, organization
   description        description, about, focus, best-known focus, summary,
                      what it does, purpose, overview
   aliases            aliases, aka, also known as, alternate names
   capabilities       capabilities, features, supports, capability
   modalities         input modalities, modalities, modals, input/output
   architecture       architecture, arch, model type
   context_window     context window, context, context length, max context,
                      tokens
   pricing            input cost, pricing, cost, price, input pricing
   tier               tier, pricing tier, plan, type
   notes              notes, availability / notes, availability, caveats
   url                url, link, website, homepage, docs
   ==================  ==================================================

2. **Bullet lists** of the form ``- **Name** — description (Provider)``.

3. Everything else (prose, changelogs, badges) is ignored. Fenced code blocks
   are skipped entirely so documentation examples cannot leak into the catalog.

Non-negotiable rules
--------------------
* Never invent a value. A field the README does not state is ``None`` / ``[]``.
* Never silently discard. Malformed rows and conflicting values are reported in
  ``diagnostics``; conflicts are preserved per-record under ``conflicts``.
* Deterministic. Object keys are sorted; model list is sorted by id.
* Write only when content changed, so a no-op run produces no git diff.

Exit codes
----------
0  success (warnings are not fatal)
1  usage error / unreadable README
2  README parsed but produced zero models
3  ``--strict`` and diagnostics contain errors
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import unicodedata
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

SCHEMA_VERSION = "1.0.0"

REPO_ROOT = Path(__file__).resolve().parent
DEFAULT_README = REPO_ROOT / "README.md"
DEFAULT_OUTPUT = REPO_ROOT / "data" / "readme-models.json"

# Order encodes precedence: exact alias match takes the first free field.
COLUMN_ALIASES: dict[str, tuple[str, ...]] = {
    "name": (
        "model name",
        "name",
        "model",
        "api",
        "service",
        "tool",
        "product",
        "framework",
        "library",
        "engine",
        "platform",
        "suite",
        "database",
        "runner",
        "vendor",
        "db",
        "vector db",
        "engine name",
        "product name",
    ),
    "model_id": ("model id", "modelid", "id", "slug", "identifier"),
    "provider": ("provider", "vendor", "by", "from", "company", "organization"),
    "description": (
        "description",
        "about",
        "focus",
        "best-known focus",
        "summary",
        "what it does",
        "purpose",
        "overview",
    ),
    "aliases": ("aliases", "aka", "also known as", "alternate names"),
    "capabilities": ("capabilities", "features", "supports", "capability"),
    "modalities": ("input modalities", "modalities", "modals", "input/output"),
    "architecture": ("architecture", "arch", "model type"),
    "context_window": (
        "context window",
        "context",
        "context length",
        "max context",
        "tokens",
    ),
    "pricing": ("input cost", "pricing", "cost", "price", "input pricing", "pricing model"),
    # Some tables split the pair across two columns instead of writing
    # "$6/$30 per 1M" in one cell. Without these aliases the input and output
    # rates are silently dropped.
    "input_price": ("input cost", "input price", "input cost / 1m", "input ($/1m)", "cost / input"),
    "output_price": ("output cost", "output price", "output cost / 1m", "output ($/1m)", "cost / output"),
    "tier": ("tier", "pricing tier", "plan", "type"),
    "notes": ("notes", "availability / notes", "availability", "caveats"),
    "url": ("url", "link", "website", "homepage", "docs"),
}

# Non-English headers. The repository README is English, but contributors add
# translated sections, and dropping those tables silently would lose real data.
COLUMN_ALIASES_I18N: dict[str, tuple[str, ...]] = {
    "name": ("模型", "名称", "模型名称", "模型名", "产品", "サービス", "モデル", "모델", "모델명"),
    "model_id": ("模型 id", "标识", "标识符"),
    "provider": ("提供商", "提供者", "供应商", "厂商", "プロバイダー", "제공업체"),
    "description": ("说明", "描述", "简介", "用途", "説明", "설명"),
    "capabilities": ("能力", "功能", "特点"),
    "context_window": ("上下文", "上下文长度", "上下文窗口", "コンテキスト"),
    "pricing": ("价格", "定价", "费用", "价格（美元）", "価格", "요금"),
    "notes": ("备注", "说明2"),
}

for _field, _aliases in COLUMN_ALIASES_I18N.items():
    COLUMN_ALIASES[_field] = COLUMN_ALIASES[_field] + _aliases
del _field, _aliases

# Documentation sections are not catalog data.
EXCLUDED_SECTION_PATTERNS = (
    r"table of contents",
    r"changelog",
    r"getting started",
    r"contributing",
    r"accuracy rules",
    r"verification policy",
    r"legend",
    r"how to",
    r"faq",
    r"terms of service",
    r"privacy policy",
    # Documentation about this project itself. Its tables describe workflows and
    # site architecture, not AI services, and must never become catalog entries.
    r"how automation works",
    r"ai hub website",
    r"repository structure",
    r"file structure",
    r"contributors? and credits",
)

# A genuine input/output pair looks like "$6.00/$30.00" or "$6/$30": both
# sides are prices, so the second number is either $-prefixed or written as a
# decimal. Requiring that is what stops "$12/1M tokens" — a single price of $12
# per 1M tokens — from being read as a $12-in / $1-out pair.
PAIR_PRICE_RE = re.compile(
    r"\$\s*(?P<inp>\d[\d,]*(?:\.\d+)?)\s*/\s*"
    r"(?:\$\s*(?P<out_dollar>\d[\d,]*(?:\.\d+)?)|(?P<out_plain>\d+\.\d+))"
)
PER_MILLION_RE = re.compile(r"per\s*1\s*m(?:illion)?|1m\s*tokens|/1m", re.IGNORECASE)
SINGLE_PRICE_RE = re.compile(r"\$\s*(?P<amount>\d[\d,]*(?:\.\d+)?)")
FREE_RE = re.compile(r"\bfree\b", re.IGNORECASE)
CONTEXT_SHORT_RE = re.compile(r"(?P<value>\d[\d,._]*)\s*(?P<unit>[kmb])\b", re.IGNORECASE)
CONTEXT_PLAIN_RE = re.compile(r"(\d[\d,_]*)")
BULLET_RE = re.compile(r"^\s*[-*+]\s+(?P<body>\S.*?)\s*$")
HEADING_RE = re.compile(r"^(?P<hashes>#{1,6})\s+(?P<title>.+?)\s*#*\s*$")
FENCE_RE = re.compile(r"^\s*(?:```|~~~)")
LINK_RE = re.compile(r"\[(?P<label>[^\]]*)\]\(\s*(?P<href>[^)\s]+)[^)]*\)")
CODE_SPAN_RE = re.compile(r"`([^`]*)`")
BOLD_RE = re.compile(r"\*\*([^*]+)\*\*")
HTML_TAG_RE = re.compile(r"<[^>]+>")
ALNUM_RE = re.compile(r"[\wÀ-ɏ一-鿿]")
PLACEHOLDERS = {"", "-", "--", "—", "n/a", "na", "none", "tbd", "tba"}


# ── Text helpers ────────────────────────────────────────────────────────────


def strip_inline(text: str) -> str:
    """Flatten inline markdown to plain text, preserving non-English content."""
    value = text or ""
    value = CODE_SPAN_RE.sub(r"\1", value)
    value = LINK_RE.sub(lambda m: m.group("label") or m.group("href"), value)
    value = BOLD_RE.sub(r"\1", value)
    value = re.sub(r"(?<!\w)[*_]{1,2}(?!\w)", "", value)
    value = HTML_TAG_RE.sub(" ", value)
    for entity, char in (
        ("&rsquo;", "’"),
        ("&lsquo;", "‘"),
        ("&ldquo;", "“"),
        ("&rdquo;", "”"),
        ("&amp;", "&"),
        ("&nbsp;", " "),
        ("&lt;", "<"),
        ("&gt;", ">"),
    ):
        value = value.replace(entity, char)
    value = value.replace("\\|", "|")
    return re.sub(r"\s+", " ", value).strip()


def first_link(text: str) -> tuple[str | None, str | None]:
    """Return (label, href) of the first markdown link, or (None, None)."""
    match = LINK_RE.search(text or "")
    if not match:
        return None, None
    label = (match.group("label") or "").strip()
    href = (match.group("href") or "").strip()
    return (label or None, href or None)


def slugify(value: str) -> str:
    """Lowercase, ASCII-folded, stable identifier.

    A name written entirely in a non-Latin script folds to nothing usable, so a
    short digest of the original is used instead. The identifier stays URL-safe
    and deterministic, which matters because it becomes a record key.
    """
    normalized = unicodedata.normalize("NFKD", value or "")
    stripped = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", stripped).strip("-").lower()[:120]
    if len(slug) >= 2:
        return slug
    return "m-" + hashlib.sha1((value or "").encode("utf-8")).hexdigest()[:12]


def normalize_context(value: str | None) -> int | None:
    """'200K' / '1M' / '128000' -> integer tokens. None when unparseable."""
    if not value:
        return None
    raw = value.strip()
    short = CONTEXT_SHORT_RE.search(raw)
    if short:
        number = short.group("value").replace(",", "").replace("_", ".")
        try:
            base = float(number)
        except ValueError:
            return None
        multiplier = {"k": 1_000, "m": 1_000_000, "b": 1_000_000_000}[short.group("unit").lower()]
        total = int(base * multiplier)
        return total if total > 0 else None

    plain = CONTEXT_PLAIN_RE.search(raw.replace(",", ""))
    if plain:
        try:
            number = int(plain.group(1))
        except ValueError:
            return None
        return number if number > 0 else None
    return None


def split_list(value: str | None) -> list[str]:
    """Split a cell on commas/semicolons/slashes/pipes/'or'."""
    if not value:
        return []
    parts = re.split(r"\s*(?:,|;|/|\|)\s+|\s+or\s+", strip_inline(value))
    return [part.strip() for part in parts if part.strip()]


def split_aliases(value: str | None) -> list[str]:
    return [part for part in split_list(value) if part]


def split_capabilities(value: str | None) -> list[str]:
    """Normalise capability prose to lowercase slugs. No invention."""
    text = strip_inline(value or "").lower()
    if text in PLACEHOLDERS:
        return []
    slugs = set()
    for part in split_list(text):
        slug = re.sub(r"[^a-z0-9]+", "-", part).strip("-")
        if slug and len(slug) > 1:
            slugs.add(slug)
    return sorted(slugs)


def parse_modalities(modalities: str, architecture: str) -> dict[str, list[str]]:
    """Derive input/output modality lists only from what the source states."""
    source = strip_inline(modalities) or strip_inline(architecture)
    if not source or source.lower() in PLACEHOLDERS:
        return {"input": [], "output": []}

    lowered = source.lower()
    known = {"text", "image", "audio", "video", "file"}

    if "->" in lowered:
        left, _, right = lowered.partition("->")
        inputs = [p for p in re.split(r"[+,\s]+", left.strip()) if p in known]
        outputs = [p for p in re.split(r"[+,\s]+", right.strip()) if p in known]
        return {"input": sorted(set(inputs)), "output": sorted(set(outputs))}

    parts = [p for p in re.split(r"[+,\s]+", lowered) if p in known]
    return {"input": sorted(set(parts)), "output": []}


#: A bare per-1M figure in its own cell, e.g. "$6/1M", "$0.80/1M", "$2 per 1M".
CELL_RATE_RE = re.compile(
    r"\$\s*(?P<amount>\d[\d,]*(?:\.\d+)?)\s*(?:/|per)\s*(?:1\s*m(?:illion)?|1m\s*tokens?)",
    re.IGNORECASE,
)


def parse_split_pricing(input_cell: str | None, output_cell: str | None) -> dict[str, Any]:
    """Build a pricing block from separate input and output columns.

    Returns an unknown block unless BOTH columns state a per-1M rate, which
    keeps the same "never half-a-pair" rule as the single-cell parser.
    """
    empty = unknown_price_block()
    if not input_cell or not output_cell:
        return empty

    def rate(cell: str) -> float | None:
        match = CELL_RATE_RE.search(strip_inline(cell))
        if not match:
            return None
        try:
            return float(match.group("amount").replace(",", ""))
        except ValueError:
            return None

    input_rate = rate(input_cell)
    output_rate = rate(output_cell)
    if input_rate is None or output_rate is None:
        return empty

    return {
        "currency": "USD",
        "input_per_1m_usd": input_rate,
        "output_per_1m_usd": output_rate,
        "raw": f"{strip_inline(input_cell)} in / {strip_inline(output_cell)} out",
    }


def parse_pricing(value: str | None) -> dict[str, Any]:
    """Parse a pricing cell conservatively.

    Input/output numbers are recorded only when the source states BOTH rates
    *and* says they are per-1M. A single figure, a monthly fee, or any
    unrecognised text keeps the verbatim string in ``raw`` and leaves the
    numbers ``None`` — unknown is never written as zero. A literal "Free" is a
    stated price of zero, which is a different claim.
    """
    empty: dict[str, Any] = {
        "currency": "USD",
        "input_per_1m_usd": None,
        "output_per_1m_usd": None,
        "raw": None,
    }
    if not value:
        return empty

    text = strip_inline(value)
    if text.lower() in PLACEHOLDERS:
        return {**empty, "raw": text or None}

    pair = PAIR_PRICE_RE.search(text)
    if pair and PER_MILLION_RE.search(text):
        output_raw = pair.group("out_dollar") if pair.group("out_dollar") else pair.group("out_plain")
        try:
            input_price = float(pair.group("inp").replace(",", ""))
            output_price = float(output_raw.replace(",", ""))
        except ValueError:
            return {**empty, "raw": text}
        return {
            "currency": "USD",
            "input_per_1m_usd": input_price,
            "output_per_1m_usd": output_price,
            "raw": text,
        }

    if FREE_RE.search(text) and not SINGLE_PRICE_RE.search(text):
        return {
            "currency": "USD",
            "input_per_1m_usd": 0.0,
            "output_per_1m_usd": 0.0,
            "raw": text,
        }

    # Stated but not a per-token pair: keep the text, record no numbers.
    return {**empty, "raw": text}


def unknown_price_block() -> dict[str, Any]:
    """An unknown price. Never zero — zero asserts a stated price of zero."""
    return {
        "currency": "USD",
        "input_per_1m_usd": None,
        "output_per_1m_usd": None,
        "raw": None,
    }


def split_row(line: str) -> list[str]:
    """Split a markdown table row, honouring escaped pipes."""
    body = line.strip()
    if body.startswith("|"):
        body = body[1:]
    if body.endswith("|"):
        body = body[:-1]

    cells: list[str] = []
    buffer: list[str] = []
    escaped = False
    for char in body:
        if escaped:
            buffer.append(char)
            escaped = False
            continue
        if char == "\\":
            escaped = True
            continue
        if char == "|":
            cells.append("".join(buffer))
            buffer = []
            continue
        buffer.append(char)
    cells.append("".join(buffer))
    return [cell.strip() for cell in cells]


def is_separator_row(cells: list[str]) -> bool:
    return bool(cells) and all(
        re.fullmatch(r":?-{2,}:?", (cell or "").strip()) for cell in cells
    )


# Aliases shorter than this are matched exactly only. Substring matching a
# 2-3 character alias produces nonsense: "id" matches "provider" (prov-id-er),
# "by" matches "Nearby", "api" matches "capital".
MIN_SUBSTRING_ALIAS = 3


def looks_like_listing_column(cells: list[str]) -> bool:
    """True when a column's values read like linked listing names.

    Used as a positional fallback. Some catalog tables name their first column
    something the alias table has never seen — "Framework", "Key For" — and
    skipping those tables silently deletes real listings.

    The test is deliberately strict: most values must be markdown links to
    external pages. A weaker "short string" test also matched this project's own
    documentation tables, where the first column held workflow filenames and
    headings like "Stack" or "Backend", and turned them into fake models.
    """
    linked = sum(1 for cell in cells if first_link(cell)[1])
    return linked >= max(1, len(cells) * 0.5)


def map_header(header_cells: list[str], body: list[str] | None = None) -> dict[str, int]:
    """Header text -> field name -> column index.

    Two passes per header:

    1. **Exact** alias match, which is unambiguous and always wins.
    2. **Contains** match, resolved by the LONGEST matching alias.

    The longest-alias rule matters: "Input Pricing (per 1M tokens)" contains
    both the alias "pricing" (7 chars) and the alias "tokens" (6 chars, which
    belongs to context_window). Taking the first match by declaration order
    would map that column to context, silently discarding the price. Longer,
    more specific aliases must win.

    `body` is the table's data rows. When no header resolves to a name column
    but the first column clearly holds listing names, column 0 is used
    instead of dropping the table.
    """
    mapping: dict[str, int] = {}

    for position, raw in enumerate(header_cells):
        label = strip_inline(raw).lower().strip(":").strip()
        if not label:
            continue

        for field_name, aliases in COLUMN_ALIASES.items():
            if label in aliases and field_name not in mapping:
                mapping[field_name] = position
                break
        else:
            best_field: str | None = None
            best_length = 0
            for field_name, aliases in COLUMN_ALIASES.items():
                if field_name in mapping:
                    continue
                for alias in aliases:
                    # Short aliases are never substring-matched: "id" matches
                    # "provider" (prov-id-er), "by" matches "nearby".
                    if len(alias) < MIN_SUBSTRING_ALIAS or alias not in label:
                        continue
                    if len(alias) > best_length:
                        best_field, best_length = field_name, len(alias)
            if best_field:
                mapping[best_field] = position

    if "name" not in mapping and body and header_cells:
        first_column = [row[0] for row in body if row]
        if first_column and looks_like_listing_column(first_column):
            mapping["name"] = 0

    return mapping


# ── Parser ──────────────────────────────────────────────────────────────────


@dataclass
class Diagnostics:
    total_rows: int = 0
    accepted: int = 0
    rejected: int = 0
    duplicates: int = 0
    conflicts: int = 0
    sections_seen: list[str] = field(default_factory=list)
    rejected_rows: list[dict[str, Any]] = field(default_factory=list)
    conflicts_detail: list[dict[str, Any]] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "total_rows": self.total_rows,
            "accepted": self.accepted,
            "rejected": self.rejected,
            "duplicates": self.duplicates,
            "conflicts": self.conflicts,
            "sections_seen": sorted(set(self.sections_seen)),
            "rejected_rows": self.rejected_rows,
            "conflicts_detail": self.conflicts_detail,
            "notes": self.notes,
        }


class ReadmeParser:
    """Single-pass parser producing schema-1.0.0 model records."""

    def __init__(self, text: str, source_ref: str, observed_at: str) -> None:
        self.text = text
        self.source_ref = source_ref
        self.observed_at = observed_at
        self.diagnostics = Diagnostics()
        self.records: dict[str, dict[str, Any]] = {}

    # -- entry point -------------------------------------------------------

    def parse(self) -> list[dict[str, Any]]:
        lines = self.text.splitlines()
        section = "Uncategorised"
        subsection: str | None = None
        in_fence = False
        index = 0

        while index < len(lines):
            line = lines[index]

            if FENCE_RE.match(line):
                in_fence = not in_fence
                index += 1
                continue
            if in_fence:
                index += 1
                continue

            heading = HEADING_RE.match(line)
            if heading:
                level = len(heading.group("hashes"))
                title = strip_inline(heading.group("title"))
                if level <= 2:
                    section, subsection = title, None
                else:
                    subsection = title
                index += 1
                continue

            if line.strip().startswith("|"):
                index = self._consume_table(lines, index, section, subsection)
                continue

            if BULLET_RE.match(line):
                index = self._consume_bullet(lines, index, section, subsection)
                continue

            index += 1

        for record in self.records.values():
            conflicts = record.get("conflicts") or {}
            record["conflicts"] = {key: value for key, value in conflicts.items() if value}
        return list(self.records.values())

    # -- tables ------------------------------------------------------------

    def _consume_table(
        self, lines: list[str], start: int, section: str, subsection: str | None
    ) -> int:
        rows: list[tuple[int, list[str]]] = []
        index = start
        while index < len(lines) and lines[index].strip().startswith("|"):
            rows.append((index + 1, split_row(lines[index])))
            index += 1

        if len(rows) < 2:
            return index

        header_line, header_cells = rows[0]
        if is_separator_row(header_cells):
            return index

        body = rows[1:]
        if body and is_separator_row(body[0][1]):
            body = body[1:]
        if not body:
            return index

        if not self._section_allowed(section, subsection):
            self.diagnostics.notes.append(f"section excluded: {subsection or section}")
            return index

        mapping = map_header(header_cells, [cells for _line, cells in body])
        if "name" not in mapping:
            self.diagnostics.notes.append(
                f"table at line {header_line} has no recognisable name column; skipped"
            )
            return index

        self.diagnostics.sections_seen.append(subsection or section)

        for line_number, cells in body:
            self.diagnostics.total_rows += 1
            record = self._row_to_record(cells, line_number, section, subsection, mapping)
            if record is None:
                self.diagnostics.rejected += 1
                continue
            self._merge_record(record)

        return index

    def _row_to_record(
        self,
        cells: list[str],
        line_number: int,
        section: str,
        subsection: str | None,
        mapping: dict[str, int],
    ) -> dict[str, Any] | None:
        def cell(field_name: str) -> str:
            position = mapping.get(field_name)
            if position is None or position >= len(cells):
                return ""
            return cells[position]

        name_raw = cell("name")
        link_label, href = first_link(name_raw)
        name = strip_inline(name_raw)

        if name.lower() in PLACEHOLDERS:
            self.diagnostics.rejected_rows.append(
                {"line": line_number, "reason": "empty or placeholder name", "cells": cells}
            )
            return None
        if not ALNUM_RE.search(name):
            self.diagnostics.rejected_rows.append(
                {"line": line_number, "reason": "name has no alphanumeric content", "cells": cells}
            )
            return None

        model_id = strip_inline(cell("model_id")) or None
        provider = strip_inline(cell("provider")) or None
        description = strip_inline(cell("description")) or None

        aliases = split_aliases(cell("aliases"))
        if link_label and link_label != name:
            aliases.append(link_label)
        if model_id and model_id != name:
            aliases.append(model_id)

        pricing = parse_pricing(cell("pricing"))
        # Tables that split the pair across separate input/output columns.
        if pricing["input_per_1m_usd"] is None and pricing["output_per_1m_usd"] is None:
            split = parse_split_pricing(cell("input_price"), cell("output_price"))
            if split["input_per_1m_usd"] is not None:
                pricing = split

        record: dict[str, Any] = {
            "id": slugify(name),
            "name": name,
            "aliases": sorted({a for a in aliases if a and a != name}),
            "provider": provider,
            "kind": "model",
            "description": description,
            "capabilities": split_capabilities(cell("capabilities")),
            "modalities": parse_modalities(cell("modalities"), cell("architecture")),
            "pricing": pricing,
            "context_window": normalize_context(strip_inline(cell("context_window")) or None),
            "tier": strip_inline(cell("tier")) or None,
            "notes": strip_inline(cell("notes")) or None,
            "url": href,
            "sections": sorted({section} | ({subsection} if subsection else set())),
            "occurrences": [
                {
                    "section": section,
                    "subsection": subsection,
                    "line": line_number,
                    "cells": [strip_inline(c) for c in cells],
                }
            ],
            "availability": {
                "readme": {
                    "available": True,
                    "model_id": model_id,
                    "observed_at": self.observed_at,
                }
            },
            "merge": {
                "confidence": "verified",
                "reasons": ["single readme occurrence"],
                "review_required": False,
            },
            "provenance": [
                {
                    "source": "readme",
                    "observed_at": self.observed_at,
                    "ref": f"{self.source_ref}#L{line_number}",
                }
            ],
        }
        return record

    # -- bullets -----------------------------------------------------------

    def _consume_bullet(
        self, lines: list[str], start: int, section: str, subsection: str | None
    ) -> int:
        """
        Bullet-list support, restricted to entries that link to their own page.

        A permissive bullet rule is a fabrication risk: this README is full of
        navigation bullets and feature blurbs ("Community-maintained (PRs very
        welcome)", "Covers 500+ API listings across 15+ categories"), and any of
        them would otherwise become a "model" with invented fields.

        So a bullet only becomes a record when it carries an absolute http(s)
        markdown link. In-page anchors (`#-free-tier-apis`) are navigation, and
        prose with a parenthesised aside is a feature bullet, not a listing.
        Anything skipped is reported in diagnostics so it is visible rather than
        silently dropped.
        """
        if not self._section_allowed(section, subsection):
            match = BULLET_RE.match(lines[start])
            label = strip_inline(match.group("body")) if match else ""
            if label:
                self.diagnostics.notes.append(
                    f"line {start + 1}: bullet in excluded section {subsection or section!r}: {label[:60]!r}"
                )
            return start + 1

        match = BULLET_RE.match(lines[start])
        body = match.group("body") if match else ""

        link_label, href = first_link(body)
        is_external = bool(href) and href.startswith(("http://", "https://"))

        name = strip_inline(link_label or body.split("—")[0].split(":")[0])

        if not is_external:
            if name and name.lower() not in PLACEHOLDERS:
                self.diagnostics.notes.append(
                    f"line {start + 1}: bullet skipped (no external link): {name[:60]!r}"
                )
            return start + 1

        if name.lower() in PLACEHOLDERS or not ALNUM_RE.search(name):
            self.diagnostics.rejected_rows.append(
                {
                    "line": start + 1,
                    "reason": "bullet list entry has no usable name",
                    "cells": [body[:120]],
                }
            )
            self.diagnostics.rejected += 1
            return start + 1

        provider_match = re.search(r"\(([^)]+)\)\s*$", strip_inline(body))
        provider = provider_match.group(1) if provider_match else None
        remainder = strip_inline(body).split("—", 1)
        description = remainder[1].strip() if len(remainder) > 1 else None

        record = {
            "id": slugify(name),
            "name": name,
            "aliases": [a for a in (link_label,) if a and a != name],
            "provider": provider,
            "kind": "model",
            "description": description,
            "capabilities": [],
            "modalities": {"input": [], "output": []},
            "pricing": unknown_price_block(),
            "context_window": None,
            "tier": None,
            "notes": None,
            "url": href,
            "sections": sorted({section} | ({subsection} if subsection else set())),
            "occurrences": [
                {"section": section, "subsection": subsection, "line": start + 1, "cells": [name]}
            ],
            "availability": {
                "readme": {"available": True, "model_id": None, "observed_at": self.observed_at}
            },
            "merge": {
                "confidence": "verified",
                "reasons": ["readme bullet list with an external source link"],
                "review_required": False,
            },
            "provenance": [
                {
                    "source": "readme",
                    "observed_at": self.observed_at,
                    "ref": f"{self.source_ref}#L{start + 1}",
                }
            ],
        }
        self.diagnostics.total_rows += 1
        self._merge_record(record)
        return start + 1

    # -- merge -------------------------------------------------------------

    def _merge_record(self, record: dict[str, Any]) -> None:
        existing = self.records.get(record["id"])

        if existing is None:
            self.records[record["id"]] = record
            self.diagnostics.accepted += 1
            return

        self.diagnostics.duplicates += 1
        existing.setdefault("occurrences", []).extend(record.get("occurrences", []))
        existing["sections"] = sorted(set(existing.get("sections", [])) | set(record.get("sections", [])))

        # Scalars: fill gaps, never overwrite a stated value; record conflicts.
        for scalar in ("name", "provider", "description", "model_id", "context_window", "url"):
            incoming = record.get(scalar)
            current = existing.get(scalar)
            if incoming in (None, ""):
                continue
            if current in (None, ""):
                existing[scalar] = incoming
                continue
            if current != incoming:
                self._record_conflict(existing, scalar, current, incoming, record)

        for list_field in ("aliases", "capabilities"):
            existing[list_field] = sorted(
                set(existing.get(list_field, [])) | set(record.get(list_field, []))
            )

        # Prefer a stated price over an absent one; never the reverse.
        existing_price = existing.get("pricing") or {}
        incoming_price = record.get("pricing") or {}
        if existing_price.get("input_per_1m_usd") is None and incoming_price.get("input_per_1m_usd") is not None:
            existing["pricing"] = incoming_price
        elif (
            existing_price.get("input_per_1m_usd") is not None
            and incoming_price.get("input_per_1m_usd") is not None
            and existing_price.get("input_per_1m_usd") != incoming_price.get("input_per_1m_usd")
        ):
            self._record_conflict(
                existing, "pricing", existing_price.get("raw"), incoming_price.get("raw"), record
            )

        reasons = existing["merge"].get("reasons", [])
        if "multiple readme occurrences" not in reasons:
            reasons.append("multiple readme occurrences")
        existing["merge"]["reasons"] = reasons

    def _record_conflict(
        self,
        existing: dict[str, Any],
        field_name: str,
        kept: Any,
        other: Any,
        incoming: dict[str, Any],
    ) -> None:
        self.diagnostics.conflicts += 1
        line = (incoming.get("occurrences") or [{}])[-1].get("line")
        self.diagnostics.conflicts_detail.append(
            {
                "id": existing["id"],
                "field": field_name,
                "kept": kept,
                "also_found": other,
                "line": line,
                "resolution": "kept first stated value; both preserved on the record",
            }
        )
        conflicts = existing.setdefault("conflicts", {})
        bucket = conflicts.setdefault(field_name, [])
        if other not in bucket:
            bucket.append(other)

    # -- helpers -----------------------------------------------------------

    def _section_allowed(self, section: str, subsection: str | None) -> bool:
        for candidate in (subsection or "", section):
            lowered = candidate.lower()
            if any(re.search(pattern, lowered) for pattern in EXCLUDED_SECTION_PATTERNS):
                return False
        return True


def parse_readme(
    text: str,
    source_ref: str = "README.md",
    observed_at: str | None = None,
) -> tuple[list[dict[str, Any]], Diagnostics]:
    """Parse README markdown into schema-1.0.0 model records plus diagnostics."""
    observed = observed_at or utc_now()
    parser = ReadmeParser(text, source_ref, observed)
    return parser.parse(), parser.diagnostics


# ── Serialisation ───────────────────────────────────────────────────────────


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def sorted_json(value: Any, indent: int = 2, depth: int = 0) -> str:
    """Deterministic JSON: object keys sorted; authored array order preserved."""
    if value is None or isinstance(value, (bool, int, float, str)):
        return json.dumps(value, ensure_ascii=False)
    if isinstance(value, list):
        if not value:
            return "[]"
        pad = " " * (indent * (depth + 1))
        closing = " " * (indent * depth)
        items = [f"{pad}{sorted_json(item, indent, depth + 1)}" for item in value]
        return "[\n" + ",\n".join(items) + "\n" + closing + "]"
    if isinstance(value, dict):
        keys = sorted(value.keys())
        if not keys:
            return "{}"
        pad = " " * (indent * (depth + 1))
        closing = " " * (indent * depth)
        items = [
            f"{pad}{json.dumps(key, ensure_ascii=False)}: {sorted_json(value[key], indent, depth + 1)}"
            for key in keys
        ]
        # Concatenated rather than an f-string: the literal closing brace after
        # an f-string expression is ambiguous across Python versions.
        return "{\n" + ",\n".join(items) + "\n" + closing + "}"
    raise TypeError(f"unserialisable type: {type(value)!r}")


#: Fields that change on every run and carry no data signal. Excluded when
#: deciding whether the output file needs rewriting.
VOLATILE_FIELDS = frozenset({"generated_at", "observed_at", "last_updated"})


def _strip_volatile(value: Any) -> Any:
    """Recursively drop run timestamps so two runs over the same input compare equal."""
    if isinstance(value, dict):
        return {k: _strip_volatile(v) for k, v in sorted(value.items()) if k not in VOLATILE_FIELDS}
    if isinstance(value, list):
        return [_strip_volatile(item) for item in value]
    return value


def data_changed(path: Path, envelope: Any) -> bool:
    """True when the envelope's *data* differs from what is already on disk.

    Timestamps alone must not count as a change. If they did, every scheduled
    run would rewrite the catalog and the daily workflow would open a pull
    request whose diff is nothing but a clock reading.
    """
    if not path.exists():
        return True
    try:
        previous = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        # Unreadable or corrupt output is treated as changed so it is repaired.
        return True
    return sorted_json(_strip_volatile(previous)) != sorted_json(_strip_volatile(envelope))


def write_if_changed(path: Path, content: str) -> bool:
    """Writes only when bytes differ, so a no-op run produces no git diff."""
    if path.exists() and path.read_text(encoding="utf-8") == content:
        print(f"⏭️  unchanged: {path.name}")
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + f".tmp-{os.getpid()}")
    temporary.write_text(content, encoding="utf-8")
    os.replace(temporary, path)
    print(f"✅ wrote: {path.name} ({len(content)} bytes)")
    return True


def write_envelope_if_changed(path: Path, envelope: Any) -> bool:
    """Writes only when the envelope's data changed, not merely its timestamps."""
    if not data_changed(path, envelope):
        print(f"⏭️  unchanged: {path.name} (data identical; timestamps not refreshed)")
        return False
    return write_if_changed(path, sorted_json(envelope) + "\n")


# ── Entry point ─────────────────────────────────────────────────────────────


def main(argv: list[str] | None = None) -> int:
    # Windows consoles default to cp1252, which cannot render the status
    # markers. Emojis are decoration; a crash while printing one is not.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):  # already UTF-8 or not a TextIO
            pass

    parser = argparse.ArgumentParser(
        description="Convert README.md model tables into data/readme-models.json"
    )
    parser.add_argument("--readme", type=Path, default=DEFAULT_README, help="path to README.md")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="output JSON path")
    parser.add_argument("--strict", action="store_true", help="exit 3 when rows are rejected or conflict")
    parser.add_argument("--quiet", action="store_true", help="suppress the progress report")
    args = parser.parse_args(argv)

    if not args.readme.is_file():
        print(f"❌ README not found: {args.readme}", file=sys.stderr)
        return 1

    try:
        text = args.readme.read_text(encoding="utf-8")
    except UnicodeDecodeError as error:
        print(f"❌ README is not valid UTF-8: {error}", file=sys.stderr)
        return 1

    if not text.strip():
        print("❌ README is empty", file=sys.stderr)
        return 1

    observed_at = utc_now()
    models, diagnostics = parse_readme(text, args.readme.name, observed_at)

    if not models:
        print(
            "❌ No models parsed — the README table format may have changed. "
            "Refusing to publish an empty catalog.",
            file=sys.stderr,
        )
        return 2

    envelope = {
        "schema_version": SCHEMA_VERSION,
        "generated_at": observed_at,
        "source": {
            "type": "readme",
            "ref": args.readme.name,
            "observed_at": observed_at,
            "commit": os.environ.get("SOURCE_COMMIT") or None,
            "status": "ok",
            "note": f"sha256:{hashlib.sha256(text.encode('utf-8')).hexdigest()[:16]}",
        },
        "count": len(models),
        "models": sorted(models, key=lambda model: model["id"]),
        "diagnostics": diagnostics.to_dict(),
    }

    content = sorted_json(envelope) + "\n"

    # The custom serialiser must produce parseable JSON. Verify before writing,
    # so a formatting bug can never ship a corrupt catalog.
    try:
        json.loads(content)
    except json.JSONDecodeError as error:
        print(f"❌ serialiser produced invalid JSON: {error}", file=sys.stderr)
        return 1

    changed = write_envelope_if_changed(args.output, envelope)

    if not args.quiet:
        priced = sum(1 for m in models if m["pricing"]["input_per_1m_usd"] is not None)
        print(f"ℹ️  models        : {len(models)}")
        print(f"ℹ️  rows scanned  : {diagnostics.total_rows}")
        print(f"ℹ️  rejected rows : {diagnostics.rejected}")
        print(f"ℹ️  duplicates    : {diagnostics.duplicates} (merged, not multiplied)")
        print(f"ℹ️  conflicts     : {diagnostics.conflicts} (preserved for review)")
        print(f"ℹ️  with pricing  : {priced}")
        if diagnostics.rejected_rows:
            print(f"⚠️  {len(diagnostics.rejected_rows)} row(s) rejected — see diagnostics.rejected_rows")

    if args.strict and (diagnostics.rejected or diagnostics.conflicts):
        print(
            f"❌ --strict: {diagnostics.rejected} rejected row(s), {diagnostics.conflicts} conflict(s)",
            file=sys.stderr,
        )
        return 3

    return 0


if __name__ == "__main__":
    raise SystemExit(main())