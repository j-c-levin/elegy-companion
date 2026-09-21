# Rules reference feature (Phase 3 task 12)

Searchable rules reference at `/reference`. Owner: task 12 agent. Scope:
searchable glossary (manual 1188–1396), basic actions with full result text
(manual 418–512), damage/clarity-loss tables by threat Rank (Health 681–722,
Clarity 723–761).

## Contract (foundation-owned, do not reshape)

- Glossary: `src/data/glossary.json` (id `glossary`, read-only) — term index only
  (`term`, `ref` excerpt key, `summary` one-liner). Full definitions render via
  the existing excerpts pipeline (`ManualRef` / `excerptForRange`), never by
  copying manual text into the JSON or the SFC.
- Rules content: reuse `src/data/basic-actions.json` (already digitized, do not
  duplicate) and the pre-registered ManualRef keys below for damage tables.
- No persisted state. This tool claims no storage name and writes nothing —
  not `game.*`, not feature-local keys.

## Files the implementation agent may touch

Everything in `src/features/reference/` (this README included), plus nothing else:
`src/router/routes.ts`, `src/store/*`, `src/styles/base.css`, `src/manual/refs.json`
(need a new citation key: coordinate with the lead — shared file),
`src/data/glossary.json` and other features are off-limits.

## Manual citations

Use the pre-registered keys: `glossary` (1188–1396), `basic-actions` (418–489,
existing), `generic-action` (490–512), `health` (681–722, existing),
`health-harm` (681–722), `clarity` (723–761, existing), `clarity-harm`
(723–761). Prefer registry keys over ad-hoc ranges; add a `ManualRef` button
next to every quoted rule.

## Known limitations (foundation stub)

- `ReferencePage.vue` is a `ToolStub` placeholder. Search + tables are task 12's work.
- `glossary.json` ships 26 anchor terms for search scaffolding; full A–Z coverage
  is task 12's work (extend the JSON additively, keep `ref` keys parseable).
