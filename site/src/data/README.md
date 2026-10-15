# Generated catalog data

`catalog.json` in this folder is **generated at build time** and is intentionally
git-ignored.

- Source of truth: [`../../README.md`](../../README.md) (the repository README tables).
- Generator: [`../../scripts/generate-data.mjs`](../../scripts/generate-data.mjs)
- Parser: [`../../scripts/lib/readme-parser.mjs`](../../scripts/lib/readme-parser.mjs)
- Validator: [`../../scripts/lib/validate-catalog.mjs`](../../scripts/lib/validate-catalog.mjs)

Regenerate it at any time with:

```bash
npm run generate
```

The build (`npm run build`) always regenerates and re-validates the catalog before
Vite bundles the app, so the deployed site never depends on fetching the README at
runtime.