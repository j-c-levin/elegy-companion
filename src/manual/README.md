# Manual references

Shared infrastructure for quoting the manual in the UI: a registry of cited line ranges, a
build-time excerpt pipeline, and the `ManualRef` info-button component. Line numbers refer to
`reference/elegy-4e-beta-v3.txt` **as extracted with `pdftotext -layout`** from the beta PDF
(8,273 lines). The extraction is deterministic, so the numbers stay stable; the layout mode puts
the PDF's two columns side by side on shared lines, and page headers/footers are inline — excerpts
show those raw lines as-is.

## Pieces

| File | Purpose |
|---|---|
| `refs.json` | The range registry — the single source of truth mapping semantic keys to line ranges + labels |
| `refs.ts` | Typed accessor: `MANUAL_REFS`, `excerptForRange`, helpers (`conditionRefKey`, `mitigationRefKey`, `endRefKey`, `parseManualSource`) |
| `excerpts.json` | GENERATED — raw manual lines (+4 context each side) for every cited range; do not edit by hand |
| `../scripts/build-manual-excerpts.mjs` | Regenerates `excerpts.json` from `refs.json` + the reference text + oracle table `source` fields |
| `../components/ManualRef.vue` | The inline "i" button and its dialog |

`npm run dev` and `npm run build` regenerate `excerpts.json` automatically (`predev` / `prebuild`);
`npm run manual:build` runs it standalone. `excerpts.json` is committed so builds are reproducible.

## Adding a range

1. Add an entry to `refs.json`:

   ```json
   { "key": "health-regenerate", "label": "Regenerating Health", "section": "Chapter 2 — Health",
     "ranges": [{ "start": 682, "end": 692 }] }
   ```

   Keys are kebab-case; `section` groups entries by manual section (use the README.md index).
   One entry may cite several ranges (each gets its own labelled excerpt block in the dialog).
2. Drop the button next to the citation: `<ManualRef ref-key="health-regenerate" />` (import from
   `@/components/ManualRef.vue`). A `label` prop overrides the registry label; ad-hoc ranges work
   without a registry key via `<ManualRef :start="682" :end="692" label="..." />`, but only if the
   excerpt is bundled (see below).
3. Run `npm run manual:build` and commit the regenerated `excerpts.json`.

## How excerpts get bundled

The generator collects every range it must ship from two places:

- every range in `refs.json`, and
- every `"source": "reference/elegy-4e-beta-v3.txt:START-END"` field in `src/data/oracles/*.json`
  (so oracle table views can offer the raw table text via ad-hoc `start`/`end` props — the
  generator guarantees an excerpt exists for any parseable source line).

For each unique range it emits one excerpt (cited lines ±4 context, deduplicated across keys) into
`excerpts.json`, keyed `"<start>-<end>"`. `ManualRef` lazy-loads that file on first open (code-split
chunk), so the main bundle carries only the registry. Nothing ships the whole manual: excerpts exist
only for ranges the app cites.

## For future agents

- Wherever your feature quotes or paraphrases the manual, add a `ManualRef` next to the citation —
  prefer a registry `key` over ad-hoc ranges. Feature-file edits stay additive (button next to the
  existing text, no logic rewrites).
- If a rule range is missing, add it to `refs.json` rather than hard-coding ranges in your template.
- Range lookups are validated at build time: the generator fails on out-of-bounds or reversed
  ranges, so a bad key/range cannot silently ship a broken dialog. An unresolvable key renders no
  button; a missing excerpt shows an error block in the dialog.
- `src/styles/base.css`, `src/store/`, `src/router/` are off-limits; scoped styles in the component
  only, no new dependencies, no emojis.

## Oracle tables

Oracle table JSONs already carry their source range; `OracleTableView` renders a `ManualRef` with
`parseManualSource(table.source)`. To digitize a new oracle table, keep the `source` field in the
same `:START-END` shape and the info button works with no registry change.
