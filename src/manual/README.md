# Manual references

Shared infrastructure for quoting the manual in the UI: a registry of cited line ranges, a
build-time excerpt pipeline, a citation-stable readable layer, and the `ManualRef` info-button
component. Line numbers refer to `reference/elegy-4e-beta-v3.txt` **as extracted with
`pdftotext -layout`** from the beta PDF (8,273 lines). The extraction is deterministic, so the
numbers stay stable; the layout mode puts the PDF's two columns side by side on shared lines,
and page headers/footers are inline. `excerpts.json` keeps those raw lines as-is; `readable.json`
carries the reflowed reading view. Neither file changes any range value or citation.

## Pieces

| File | Purpose |
|---|---|
| `refs.json` | The range registry — the single source of truth mapping semantic keys to line ranges + labels |
| `refs.ts` | Typed accessor: `MANUAL_REFS`, `excerptForRange`, `readableForRange`, helpers (`conditionRefKey`, `mitigationRefKey`, `endRefKey`, `parseManualSource`) |
| `excerpts.json` | GENERATED — raw manual lines (+4 context each side) for every cited range; do not edit by hand |
| `readable.json` | GENERATED — deterministic readable blocks for covered ranges, keyed by exact `START-END`; do not edit by hand |
| `readable-overrides.json` | Curated splice list for ranges the reflow cannot handle alone (empty `splices` until needed) |
| `../../scripts/lib/manual-reflow.mjs` | Pure reflow: two-column separation, hyphen joining, heading/list/table blocks; verbatim text, no paraphrase |
| `../../scripts/build-manual-excerpts.mjs` | Regenerates `excerpts.json` + `readable.json` from `refs.json` + the reference text + oracle/glossary/aspect `source`/`ref` fields |
| `../components/ManualRef.vue` | The inline "i" button and its dialog (readable when covered, raw fallback otherwise) |

`npm run dev` and `npm run build` regenerate both JSON files automatically (`predev` /
`prebuild`); `npm run manual:build` runs it standalone. Both files are committed so builds are
reproducible.

## Readable coverage

The generator reflows every cited range of 110 lines or fewer and fails the build if any covered
range leaves lines uncovered. Covered ranges render as headings, paragraphs, lists, and tables
with a `Source: reference/elegy-4e-beta-v3.txt:START-END` footer. Ranges over the cap (full
Chapter 4 aspect lists, the whole-glossary key, the city/faction setup spans, and the faction
oracle table) keep the existing raw-line fallback until curated splices land in
`readable-overrides.json`. Every readable block carries its source line span (`s`), so each
paragraph traces to its original lines.

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
3. Run `npm run manual:build` and commit the regenerated `excerpts.json` and `readable.json`. If
   the new range is over the cap or reflows badly, add a splice to `readable-overrides.json`
   (shape: `{ "version": 1, "splices": [{ "from": 1, "to": 2, "side": "full", "blocks": [] }] }`)
   instead of editing generated output; small two-column table ranges work with no override.

## How excerpts get bundled

The generator collects every range it must ship from four places:

- every range in `refs.json`,
- every `"source": "reference/elegy-4e-beta-v3.txt:START-END"` field in `src/data/oracles/*.json`
  (so oracle table views can offer the table text via ad-hoc `start`/`end` props),
- every `"ref": "START-END"` in `src/data/glossary.json` terms,
- every `"ref": "START-END"` in `src/data/aspects.json` types.

For each unique range it emits one raw excerpt (cited lines ±4 context, deduplicated across keys)
into `excerpts.json`, keyed `"<start>-<end>"`, plus one readable entry into `readable.json` when
the range is within the line cap. `ManualRef` lazy-loads both files on first open (code-split
chunks), so the main bundle carries only the registry. Nothing ships the whole manual: excerpts
exist only for ranges the app cites.

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
