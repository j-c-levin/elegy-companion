# Aspect database feature (Phase 3 task 13)

Aspect browser at `/aspects`. Owner: task 13 agent. Scope: browse Expertises,
Gifts, Mysteries, Edges, Burdens with abilities and acquisition requirements
(manual 2892–4269).

## Contract (foundation-owned, do not reshape)

- Aspect catalog: `src/data/aspects.json` (id `aspects`, read-only) — type index
  only (`aspectType`, `ref` excerpt key, `label`, `summary`, `acquire` short rule).
  Full ability text renders via the existing excerpts pipeline (`ManualRef` /
  `excerptForRange`), never by copying manual text into the JSON or the SFC.
- Single source for aspect-type metadata: task 11's wizard links here for ability
  text instead of duplicating it; this tool never imports from `features/create`.
- No persisted state. This tool claims no storage name and writes nothing —
  not `game.*`, not feature-local keys. (Future "owned aspects" tracking, if any,
  needs a new claimed name — coordinate with the lead.)

## Files the implementation agent may touch

Everything in `src/features/aspects/` (this README included), plus nothing else:
`src/router/routes.ts`, `src/store/*`, `src/styles/base.css`, `src/manual/refs.json`
(need a new citation key: coordinate with the lead — shared file),
`src/data/aspects.json` and other features are off-limits.

## Manual citations

Use the pre-registered keys: `aspects` (2892–4269), `aspects-how-they-work`
(2893–2959), `aspects-expertise` (2960–3309), `aspects-gift` (3310–3671),
`aspects-edge` (3672–3915), `aspects-connection` (3916–3960),
`aspects-burden` (3961–4269). Prefer registry keys over ad-hoc ranges; add a
`ManualRef` button next to every quoted rule.

## Known limitations (foundation stub)

- `AspectsPage.vue` is a `ToolStub` placeholder. Browse + acquisition flows are
  task 13's work.
- `aspects.json` ships the type skeleton only; per-aspect entries (Animality,
  Shadows, …) are task 13's work (extend additively, keep `ref` keys parseable).
