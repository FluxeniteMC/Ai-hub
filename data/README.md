# Data Directory

Every file here is **generated**. Do not hand-edit any of it — a manual change is
overwritten on the next run and will show up as noise in the catalog pull
request.

## Machine-readable model catalogs (v2.1)

| File | Produced by | Contents |
|---|---|---|
| `readme-models.json` | `convert.py` | Models parsed from `README.md`. Community-maintained prose, lowest authority. |
| `openrouter.json` | `js/openrouter.js` | Live [OpenRouter](https://openrouter.ai/) `/api/v1/models` catalog. Public endpoint, no key. |
| `groq.json` | `js/groq.js` | Live [Groq](https://console.groq.com/) `/openai/v1/models` catalog. Needs `GROQ_API_KEY`. |
| `models.json` | `js/build-models.js` | The unified, deduplicated catalog consumed by the website. |

All four share schema version `1.0.0` (documented in `js/lib/schema.js`).

### Rules these files follow

- **A missing price is `null`, never `0`.** Zero asserts a real, stated price of
  zero. Groq publishes no pricing on `/models`, so its entries always carry
  `null`.
- **Nothing is invented.** A field no source states stays empty and is rendered
  as "Not stated".
- **Last known good data survives failure.** If a provider request fails, rate
  limits, times out or returns garbage, the previous catalog is left untouched
  and the envelope records `status: "stale"`. An empty or malformed response
  never overwrites good data.
- **Merges require verified identity.** Distinct versions, quantisations,
  fine-tunes and variants are never merged. Uncertain matches stay separate in
  `review_queue` for a human to resolve.
- **Generation is deterministic and change-aware.** Identical input produces
  byte-identical output, and a file is only rewritten when its data actually
  changed — so an unchanged run produces no git diff and no pull request.

### Refresh

```bash
npm run catalog:refresh   # convert.py + both providers + unified build
npm run test              # Python + JavaScript test suites
```

Runs daily via `.github/workflows/catalog-update.yml` (23:41 UTC = 05:41 +06:00).
Changed data is pushed to `automation/catalog-update` and raised as a pull
request. It is never pushed straight to `main` and never merged automatically.

## Historical run logs

- `stats.json` — repository stats (API count, last updated)
- `pricing-updates-YYYY-MM-DD.json` — Gemini pricing update logs
- `new-apis-YYYY-MM-DD.json` — discovered new APIs
- `update-YYYY-MM-DD.json` — full update run results