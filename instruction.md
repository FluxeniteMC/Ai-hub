# 📋 Directory Update Instructions

**This file is the contract for every automated update to `README.md`.**
The automation reads this file *before* touching the README. If this file and a
prompt ever disagree, **this file wins**.

---

## 🚫 Rule 1 — Never add a new listing (absolute)

You must **never** insert a row that was not already in the table you were given.

- Do **not** add models, APIs, vendors or products.
- Do **not** "fill gaps", "add missing flagships", or "add anything recent".
- Do **not** add entries because they sound plausible or are rumoured.
- If you believe a listing is missing, **do not add it**. Report it instead, in
  the `data/` suggestion log, so a human can verify and add it by hand.

> **Why:** a previous version of this repository instructed the updater to add
> new APIs from model knowledge. That produced fabricated entries — GPT-7 Astra,
> Claude Fable 6.0, Gemini 5 Ultra, Grok 6.0 — which had to be deleted again by a
> human commit. An automated system cannot verify a product exists. Only a human
> can.

## ✅ Rule 2 — What you *may* change

You may only edit rows that **already exist** in the table:

1. Correct a price that is clearly outdated, to the format `$X.XX/1M` or per unit.
2. Correct a clearly wrong provider, category or context-window value.
3. Refresh a "last checked" style note if the table has one.
4. Mark a listing as deprecated **only** when the shutdown is official and
   verifiable from your knowledge.

## 🛑 Rule 3 — When you are unsure, change nothing

Uncertainty is the normal case. If a value is not something you can state with
confidence:

- Leave the existing value exactly as it is.
- Do not guess, interpolate, estimate, or round into plausibility.
- Do not "average" or "sanity check" a number into something smoother.

Keeping a possibly-stale verified figure is always better than replacing it with
a confident invention.

## 🧾 Rule 4 — Provenance and honesty

- Never present a guess as a fact.
- Never invent a benchmark score, a context-window size, or an API-compatibility claim.
- If a row needs a caveat, put the caveat **in that row**, not hidden.

## 🔒 Rule 5 — Structural rules

- Keep the table's **exact header row** and column meanings. Never add, remove or
  reorder a column.
- Preserve the existing row order unless a row is genuinely dead.
- Match the surrounding style: same emoji usage, same tone in the notes.
- Return **only** the rewritten section — no commentary, no code fences.
- A safety gate validates every rewrite. A failed rewrite is discarded and the
  original is kept. Do not try to work around the gate.

---

## 🔍 For humans

| I want to… | Do this |
|---|---|
| Add a genuinely new API/model | Open a pull request (see `CONTRIBUTING.md`). Only a human confirms it exists. |
| Fix a wrong price | Edit the row directly, or open a PR. |
| Remove a dead API | Open a PR with the official deprecation as the reason. |
| See what the bot *wanted* to add | Look in `data/new-apis-*.json`. Nothing there is added automatically. |

The automated updater is deliberately **conservative**. It polishes what humans
already decided is true. It does not decide what is true.