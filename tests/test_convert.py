#!/usr/bin/env python3
"""Tests for convert.py.

Run with:  python -m unittest discover -s tests -p "test_*.py"
       or: python tests/test_convert.py
"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

import convert  # noqa: E402

VALID_TABLE = """
## Free Tier APIs

| API | Provider | Description | Cost |
|-----|----------|-------------|------|
| [Example API](https://example.com) | Example Inc | A free tier API | Free |
| Paid One | Paid Co | Costs money | $5/month |
"""

TABLE_WITH_PRICES = """
## Paid APIs

| Model | Provider | Context | Pricing |
|-------|----------|---------|---------|
| Alpha | A | 200K | $6.00/$30.00 per 1M |
| Beta | B | 1M | $1.00/$4.00 per 1M |
| Gamma | C | - | $12/1M tokens |
| Delta | D | 8K | Free |
"""

NON_ENGLISH = """
## 国际模型

| 模型 | 提供商 | 说明 | 价格 |
|------|--------|------|------|
| [阿里云通义千问](https://qwen.example) | 阿里巴巴 | 中文描述 | $0.02/$0.06 per 1M |
"""

DUPLICATES = """
## Category One

| Model | Provider | Description |
|-------|----------|-------------|
| Repeated Model | First Co | The first description |

## Category Two

| Model | Provider | Description |
|-------|----------|-------------|
| Repeated Model | Second Co | A different description |
| Repeated Model | Second Co | A different description |
"""

MALFORMED = """
## Section

| Model | Provider | Notes |
|-------|----------|-------|
|  | Empty | no name |
| — | Dashes | placeholder |
| ✅ | Emoji | no alphanumerics |
| Good One | Co | fine |
"""

CONFLICTING_PRICES = """
## Section

| Model | Provider | Pricing |
|-------|----------|---------|
| Contested | Co | $1.00/$2.00 per 1M |
| Contested | Co | $9.00/$8.00 per 1M |
"""

CODE_FENCE = """
## Section

| Model | Provider |
|-------|----------|
| Real Entry | Co |

```markdown
| Model | Provider |
|-------|----------|
| Example In Docs | Not Real |
```
"""

EXCLUDED_SECTION = """
## Changelog

| Model | Provider |
|-------|----------|
| Should Not Appear | Co |

## Real Section

| Model | Provider |
|-------|----------|
| Should Appear | Co |
"""


class ParseTests(unittest.TestCase):
    def parse(self, markdown: str):
        return convert.parse_readme(markdown, "README.md", "2026-01-01T00:00:00Z")

    # ── valid input ───────────────────────────────────────────────────────

    def test_parses_a_valid_table(self):
        models, diagnostics = self.parse(VALID_TABLE)
        self.assertEqual(len(models), 2)
        self.assertEqual(diagnostics.rejected, 0)
        by_name = {m["name"]: m for m in models}
        self.assertIn("Example API", by_name)

    def test_markdown_link_supplies_the_url(self):
        models, _ = self.parse(VALID_TABLE)
        entry = next(m for m in models if m["name"] == "Example API")
        self.assertEqual(entry["url"], "https://example.com")
        self.assertEqual(entry["provider"], "Example Inc")

    def test_duplicate_rows_merge_rather_than_multiply(self):
        models, diagnostics = self.parse(DUPLICATES)
        self.assertEqual(len(models), 1, "one canonical entry, not three")
        self.assertEqual(diagnostics.duplicates, 2)
        self.assertEqual(len(models[0]["occurrences"]), 3, "every occurrence is retained")

    def test_duplicate_merge_keeps_both_providers(self):
        models, _ = self.parse(DUPLICATES)
        self.assertEqual(len(models[0]["sections"]), 2)

    # ── missing fields ────────────────────────────────────────────────────

    def test_missing_optional_fields_are_null_not_invented(self):
        models, _ = self.parse(VALID_TABLE)
        entry = next(m for m in models if m["name"] == "Paid One")
        self.assertIsNone(entry["context_window"])
        self.assertIsNone(entry["availability"]["readme"]["model_id"])
        self.assertEqual(entry["capabilities"], [])
        self.assertIsNone(entry["url"])

    def test_a_missing_price_stays_unknown(self):
        models, _ = self.parse(VALID_TABLE)
        entry = next(m for m in models if m["name"] == "Paid One")
        self.assertEqual(entry["pricing"]["input_per_1m_usd"], None, "unknown is never zero")
        self.assertEqual(entry["pricing"]["output_per_1m_usd"], None)
        self.assertEqual(entry["pricing"]["raw"], "$5/month", "the verbatim text is preserved")

    # ── pricing rules ─────────────────────────────────────────────────────

    def test_a_price_pair_is_parsed(self):
        models, _ = self.parse(TABLE_WITH_PRICES)
        entry = next(m for m in models if m["name"] == "Alpha")
        self.assertEqual(entry["pricing"]["input_per_1m_usd"], 6.0)
        self.assertEqual(entry["pricing"]["output_per_1m_usd"], 30.0)

    def test_a_single_figure_is_never_split_into_two_rates(self):
        models, _ = self.parse(TABLE_WITH_PRICES)
        entry = next(m for m in models if m["name"] == "Gamma")
        self.assertEqual(entry["pricing"]["input_per_1m_usd"], None)
        self.assertEqual(entry["pricing"]["output_per_1m_usd"], None)
        self.assertEqual(entry["pricing"]["raw"], "$12/1M tokens")

    def test_stated_free_is_recorded_as_zero(self):
        models, _ = self.parse(TABLE_WITH_PRICES)
        entry = next(m for m in models if m["name"] == "Delta")
        self.assertEqual(entry["pricing"]["input_per_1m_usd"], 0.0, "a stated free price is zero")
        self.assertEqual(entry["pricing"]["output_per_1m_usd"], 0.0)

    def test_free_tier_wording_with_a_price_is_not_zero(self):
        models, _ = self.parse(VALID_TABLE)
        entry = next(m for m in models if m["name"] == "Paid One")
        self.assertNotEqual(entry["pricing"]["input_per_1m_usd"], 0.0)

    # ── context parsing ───────────────────────────────────────────────────

    def test_context_suffixes_are_parsed(self):
        models, _ = self.parse(TABLE_WITH_PRICES)
        cases = {"Alpha": 200_000, "Beta": 1_000_000, "Gamma": None, "Delta": 8000}
        for name, expected in cases.items():
            entry = next(m for m in models if m["name"] == name)
            self.assertEqual(entry["context_window"], expected, f"context for {name}")

    # ── malformed input ───────────────────────────────────────────────────

    def test_malformed_rows_are_rejected_and_reported(self):
        models, diagnostics = self.parse(MALFORMED)
        self.assertEqual(len(models), 1, "only the well-formed row survives")
        self.assertEqual(diagnostics.rejected, 3)
        self.assertEqual(len(diagnostics.rejected_rows), 3)
        for rejected in diagnostics.rejected_rows:
            self.assertIn("line", rejected)
            self.assertIn("reason", rejected)

    def test_code_fences_are_ignored(self):
        models, _ = self.parse(CODE_FENCE)
        names = [m["name"] for m in models]
        self.assertEqual(names, ["Real Entry"], "documentation examples must not leak in")

    def test_documentation_sections_are_excluded(self):
        models, diagnostics = self.parse(EXCLUDED_SECTION)
        names = [m["name"] for m in models]
        self.assertEqual(names, ["Should Appear"])
        self.assertTrue(any("excluded" in note for note in diagnostics.notes))

    def test_a_table_with_no_name_column_is_skipped_not_crashed(self):
        markdown = """
## Section

| Timestamp | Event |
|-----------|-------|
| 2026-01-01 | Something happened |
"""
        models, diagnostics = self.parse(markdown)
        self.assertEqual(len(models), 0)
        self.assertTrue(any("no recognisable name column" in n for n in diagnostics.notes))

    # ── conflicts ─────────────────────────────────────────────────────────

    def test_conflicting_prices_are_both_preserved(self):
        models, diagnostics = self.parse(CONFLICTING_PRICES)
        self.assertEqual(len(models), 1)
        self.assertEqual(diagnostics.conflicts, 1)
        entry = models[0]
        self.assertEqual(entry["pricing"]["input_per_1m_usd"], 1.0, "first stated value is kept")
        self.assertIn("$9.00/$8.00 per 1M", entry["conflicts"]["pricing"])

    # ── header mapping ────────────────────────────────────────────────────

    def test_short_aliases_do_not_match_substrings(self):
        mapping = convert.map_header(["Model", "Provider", "Dimensions", "Context", "Cost"])
        self.assertNotIn("model_id", mapping, "'id' must not substring-match 'provider'")
        self.assertEqual(mapping["provider"], 1)

    def test_header_aliases_resolve_by_contains(self):
        mapping = convert.map_header(["Model", "Input Pricing (per 1M tokens)", "Context Length"])
        self.assertEqual(mapping["pricing"], 1)
        self.assertEqual(mapping["context_window"], 2)

    # ── bullet lists ──────────────────────────────────────────────────────

    def test_a_bullet_with_an_external_link_becomes_a_record(self):
        markdown = """
## Model List

- [Some Model](https://example.com/some-model) — a real listing (Example Inc)
"""
        models, _ = self.parse(markdown)
        self.assertEqual(len(models), 1)
        self.assertEqual(models[0]["name"], "Some Model")
        self.assertEqual(models[0]["url"], "https://example.com/some-model")
        self.assertEqual(models[0]["provider"], "Example Inc")

    def test_navigation_and_prose_bullets_never_become_models(self):
        # These are the shapes actually present in this repository's README.
        # Turning any of them into a "model" would be invented data.
        # Uses a non-excluded section so the bullet rule itself is exercised.
        markdown = """
## Overview

- Organized by price tier AND category
- Auto-validated weekly (dead links get flagged)
- Community-maintained (PRs very welcome)
- Covers 500+ API listings across 15+ categories
- [Free Tier APIs](#-free-tier-apis) - Zero cost, no CC needed
- [Large Language Models](#-large-language-models-llms)
"""
        models, diagnostics = self.parse(markdown)
        self.assertEqual(models, [], "prose and navigation bullets are not models")
        self.assertTrue(
            any("bullet skipped" in note for note in diagnostics.notes),
            "skipped bullets must be reported, not silently dropped",
        )

    def test_an_excluded_section_is_skipped_wholesale(self):
        markdown = """
## Getting Started Guide

- Something that would otherwise parse
"""
        models, diagnostics = self.parse(markdown)
        self.assertEqual(models, [])
        self.assertTrue(
            any("excluded section" in note for note in diagnostics.notes),
            "an excluded section must be visible in diagnostics",
        )

    def test_in_page_anchor_bullets_are_treated_as_navigation(self):
        markdown = """
## Section

- [Something](#anchor-only)
"""
        models, _ = self.parse(markdown)
        self.assertEqual(models, [])

    # ── header fallbacks and split pricing ───────────────────────────────

    def test_an_unknown_first_column_header_still_parses_when_rows_are_linked(self):
        # Real tables in this README name the first column "Framework",
        # "Key For" and similar. Skipping them silently deletes real listings.
        markdown = """
### Agents

| Framework | Language | License | Best For |
|-----------|----------|---------|----------|
| [Agno](https://github.com/agno-agi/agno) | Python | Apache | Fast agents |
| [CrewAI](https://www.crewai.com/) | Python | MIT | Role-based |
"""
        models, _ = self.parse(markdown)
        self.assertEqual({m["name"] for m in models}, {"Agno", "CrewAI"})

    def test_a_prose_column_is_not_mistaken_for_the_name_column(self):
        # Project documentation tables have unlinked first columns
        # ("Stack", "Backend", workflow filenames). They must never become models.
        markdown = """
## How Automation Works

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| auto-update.yml | Daily | Edits README rows |
| validate.yml | Weekly | Checks links |
"""
        models, _ = self.parse(markdown)
        self.assertEqual(models, [])

    def test_project_documentation_sections_are_excluded(self):
        markdown = """
## How Automation Works

| Framework | Language |
|-----------|----------|
| [Agno](https://example.com) | Python |
"""
        models, _ = self.parse(markdown)
        self.assertEqual(models, [], "the section itself is excluded")

    def test_split_input_and_output_price_columns_are_combined(self):
        markdown = """
## Paid

| API | Provider | Category | Pricing Model | Input Cost | Output Cost | Context |
|-----|----------|----------|---------------|------------|-------------|---------|
| [Mistral Large 4](https://mistral.ai/) | Mistral AI | LLM | Per token | $0.45/1M | $1.40/1M | 128K |
"""
        models, _ = self.parse(markdown)
        entry = models[0]
        self.assertEqual(entry["pricing"]["input_per_1m_usd"], 0.45)
        self.assertEqual(entry["pricing"]["output_per_1m_usd"], 1.4)

    def test_split_pricing_requires_both_columns(self):
        markdown = """
## Paid

| API | Input Cost | Output Cost |
|-----|------------|-------------|
| Only Input | $0.45/1M | - |
"""
        models, _ = self.parse(markdown)
        self.assertEqual(models[0]["pricing"]["input_per_1m_usd"], None)
        self.assertEqual(models[0]["pricing"]["output_per_1m_usd"], None)

    def test_db_header_is_recognised_as_the_name_column(self):
        markdown = """
## Embeddings

| DB | Best For | Cost |
|----|----------|------|
| Pinecone | Production RAG | $70/month |
| Redis Vector | Low-latency | Redis cost |
"""
        models, _ = self.parse(markdown)
        self.assertEqual({m["name"] for m in models}, {"Pinecone", "Redis Vector"})

    # ── non-English ───────────────────────────────────────────────────────

    def test_non_english_content_is_preserved(self):
        models, _ = self.parse(NON_ENGLISH)
        self.assertEqual(len(models), 1)
        entry = models[0]
        self.assertEqual(entry["name"], "阿里云通义千问")
        self.assertEqual(entry["provider"], "阿里巴巴")
        self.assertEqual(entry["description"], "中文描述")
        self.assertEqual(entry["pricing"]["input_per_1m_usd"], 0.02)

    def test_non_english_names_produce_a_usable_id(self):
        models, _ = self.parse(NON_ENGLISH)
        identifier = models[0]["id"]
        self.assertTrue(identifier)
        self.assertRegex(identifier, r"^[a-z0-9-]+$", "ids must stay URL-safe")

    # ── determinism ───────────────────────────────────────────────────────

    def test_parsing_is_deterministic(self):
        first, _ = self.parse(VALID_TABLE)
        second, _ = self.parse(VALID_TABLE)
        self.assertEqual(
            convert.sorted_json(first),
            convert.sorted_json(second),
        )

    def test_output_sorts_models_by_id(self):
        models, _ = self.parse(VALID_TABLE)
        ids = [m["id"] for m in models]
        self.assertEqual(ids, sorted(ids))


class SerialisationTests(unittest.TestCase):
    def test_serialiser_produces_valid_json(self):
        models, diagnostics = convert.parse_readme(VALID_TABLE, "README.md", "2026-01-01T00:00:00Z")
        payload = {
            "schema_version": convert.SCHEMA_VERSION,
            "generated_at": "2026-01-01T00:00:00Z",
            "source": {"type": "readme", "status": "ok"},
            "count": len(models),
            "models": models,
            "diagnostics": diagnostics.to_dict(),
        }
        text = convert.sorted_json(payload)
        self.assertEqual(json.loads(text)["count"], len(models))

    def test_serialiser_sorts_object_keys(self):
        self.assertEqual(convert.sorted_json({"b": 1, "a": 2}), convert.sorted_json({"a": 2, "b": 1}))

    def test_serialiser_handles_non_ascii(self):
        text = convert.sorted_json({"name": "通义千问"})
        self.assertEqual(json.loads(text)["name"], "通义千问")


class CliTests(unittest.TestCase):
    """End-to-end behaviour including exit codes."""

    def run_cli(self, markdown: str, *extra: str):
        with tempfile.TemporaryDirectory() as tmp:
            readme = Path(tmp) / "README.md"
            output = Path(tmp) / "out.json"
            readme.write_text(markdown, encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(REPO_ROOT / "convert.py"), "--readme", str(readme), "--output", str(output), *extra],
                capture_output=True,
                text=True,
                encoding="utf-8",
            )
            payload = json.loads(output.read_text(encoding="utf-8")) if output.exists() else None
            return result, payload

    def test_writes_a_catalog_and_exits_zero(self):
        result, payload = self.run_cli(VALID_TABLE)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["schema_version"], convert.SCHEMA_VERSION)
        self.assertEqual(payload["count"], 2)

    def test_missing_readme_exits_one(self):
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "out.json"
            result = subprocess.run(
                [sys.executable, str(REPO_ROOT / "convert.py"), "--readme", str(Path(tmp) / "nope.md"), "--output", str(output)],
                capture_output=True,
                text=True,
                encoding="utf-8",
            )
        self.assertEqual(result.returncode, 1)

    def test_zero_models_exits_two(self):
        result, payload = self.run_cli("# Just a heading\n\nNo tables here.\n")
        self.assertEqual(result.returncode, 2, "an empty catalog must never be published")
        self.assertIsNone(payload, "nothing is written when nothing parses")

    def test_strict_exits_three_on_conflicts(self):
        result, _ = self.run_cli(CONFLICTING_PRICES, "--strict")
        self.assertEqual(result.returncode, 3)

    def test_unchanged_content_does_not_rewrite(self):
        # A second run over identical markdown must not touch the file, even
        # when a second has elapsed between the runs. Comparing mtime alone is
        # not enough — assert the bytes are untouched by checking the recorded
        # mtime *and* that the file was never rewritten.
        with tempfile.TemporaryDirectory() as tmp:
            readme = Path(tmp) / "README.md"
            output = Path(tmp) / "out.json"
            readme.write_text(VALID_TABLE, encoding="utf-8")

            def run():
                return subprocess.run(
                    [sys.executable, str(REPO_ROOT / "convert.py"), "--readme", str(readme), "--output", str(output), "--quiet"],
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                )

            first = run()
            self.assertEqual(first.returncode, 0, first.stderr)
            original = output.read_text(encoding="utf-8")
            stamp = output.stat().st_mtime_ns

            time.sleep(1.1)  # guarantee a different wall-clock second

            second = run()
            self.assertEqual(second.returncode, 0, second.stderr)

            self.assertEqual(
                output.stat().st_mtime_ns,
                stamp,
                "identical input must not rewrite the file",
            )
            self.assertEqual(output.read_text(encoding="utf-8"), original)
            self.assertIn("unchanged", second.stdout)

    def test_a_tiny_change_does_rewrite(self):
        with tempfile.TemporaryDirectory() as tmp:
            readme = Path(tmp) / "README.md"
            output = Path(tmp) / "out.json"
            readme.write_text(VALID_TABLE, encoding="utf-8")

            def run():
                return subprocess.run(
                    [sys.executable, str(REPO_ROOT / "convert.py"), "--readme", str(readme), "--output", str(output), "--quiet"],
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                )

            run()
            # Append the row inside the table block, not after it.
            readme.write_text(
                VALID_TABLE.replace(
                    "| Paid One | Paid Co | Costs money | $5/month |",
                    "| Paid One | Paid Co | Costs money | $5/month |\n"
                    "| Another Model | Co | desc | $1/$2 per 1M |",
                ),
                encoding="utf-8",
            )
            result = run()
            self.assertEqual(result.returncode, 0, result.stderr)
            payload = json.loads(output.read_text(encoding="utf-8"))
            self.assertIn("another-model", [m["id"] for m in payload["models"]])

    def test_run_timestamps_alone_do_not_count_as_a_change(self):
        # The whole point of the change-detection rule: two runs seconds apart
        # must compare equal, otherwise every scheduled run opens a pull request
        # whose diff is only a clock reading.
        envelope = {"schema_version": convert.SCHEMA_VERSION, "generated_at": "A", "count": 1,
                    "source": {"observed_at": "A"}, "models": []}
        later = {"schema_version": convert.SCHEMA_VERSION, "generated_at": "B", "count": 1,
                 "source": {"observed_at": "B"}, "models": []}
        self.assertEqual(
            convert.sorted_json(convert._strip_volatile(envelope)),
            convert.sorted_json(convert._strip_volatile(later)),
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)