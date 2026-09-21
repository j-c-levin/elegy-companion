# Rules reference feature (Phase 3 task 12)

Searchable rules reference at `/reference`. Owner: task 12 agent (implemented).
Scope: searchable glossary (manual 1188–1396), basic actions with full result
text (manual 418–512), damage/clarity-loss tables by threat Rank (Health
681–722, Clarity 723–761).

## Contract (foundation-owned, do not reshape)

- Glossary: `src/data/glossary.json` (id `glossary`, read-only) — term index only
  (`term`, `ref` excerpt key, `summary` one-liner). Full definitions render via
  the existing excerpts pipeline (`ManualRef` / `excerptForRange`), never by
  copying manual text into the JSON or the SFC.
- Rules content: reuse `src/data/basic-actions.json` (already digitized, do not
  duplicate) and the pre-registered ManualRef keys below for damage tables.
- No persisted state. This tool claims no storage name and writes nothing —
  not `game.*`, not feature-local keys.

## Files

- `ReferencePage.vue` — in-page tabs (Glossary / Actions / Tables), no route
  changes; tab choice lives in memory only.
- `GlossaryBrowser.vue` — search over term + summary (case-insensitive),
  letter-grouped rows; each row cites its `ref` range via `ManualRef`.
- `BasicActionsView.vue` — renders all six actions from
  `src/data/basic-actions.json`, section keys `basic-actions` / `generic-action`.
- `HarmTablesView.vue` — Health loss by source of danger (manual 687–696,
  key `health-harm`) and Clarity loss by gravity (manual 728–739, key
  `clarity-harm`), plus cascade and mitigation citations; combat context via
  key `combat`.

## Manual citations

Registered keys used: `glossary` (1188–1396), `basic-actions` (418–489),
`generic-action` (490–512), `aspects-give-rush` (436–438), `combat`
(1085–1121), `health-harm` (681–722), `clarity-harm` (723–761),
`health-cascade` (694–717), `clarity-cascade` (726–744), `mitigate-health`
(708–712), `mitigate-clarity` (741–744). No new `refs.json` entries were
needed; per-term `ref` ranges in `glossary.json` all exactly match existing
registry ranges (verified at build time against `excerpts.json`).

## Known limitations

- Glossary rows open the covering rule-section excerpt, not the glossary's own
  line ranges (those are not registered individually); terms with no dedicated
  rule section (Ally, Elegy, Game Master) open the full glossary excerpt.
- `glossary.json` term names follow the manual's glossary canon (`Basic
  Action`, `Feed`, `Experience (XP)`); `Combat` is kept as an anchor term
  although the manual glossary itself has no COMBAT entry.
- Harm-table cell text is digitized in `HarmTablesView.vue` following the
  oracle-tables precedent (tabular data + ManualRef for the full raw text);
  prose paragraphs stay in the excerpts pipeline.
- The plain grouped list (84 terms) is not virtualized — fine at this size;
  revisit only if the glossary grows several times over.
- Per-action `ref` ranges inside `basic-actions.json` are informational; the
  page cites the section keys, so narrower per-action excerpts are not bundled.
