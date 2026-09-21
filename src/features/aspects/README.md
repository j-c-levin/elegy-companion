# Aspect database feature (Phase 3 task 13)

Aspect browser at `/aspects`. Owner: task 13 agent. Scope: browse Expertises,
Gifts, Mysteries, Edges, Burdens with abilities and acquisition requirements
(manual 2892–4269). Cite the per-type keys below, not the whole chapter.

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

Use the pre-registered keys: `aspects-how-they-work` (2893–2959),
`aspects-expertise` (2960–3309), `aspects-gift` (3310–3671), `aspects-edge`
(3672–3915), `aspects-connection` (3916–3960), `aspects-burden` (3961–4269).
Cite subsection ranges only; whole-chapter ManualRef dialogs are
intentionally not registered.

## Known limitations (task 13)

- `aspects.json` now carries the full per-aspect catalog alongside the type
  index (63 entries: 17 Expertises, 13 Gifts, 6 Mysteries, 3 Edges, 10
  Connection abilities, 14 Burdens). Per-entry `ref` ranges are provenance
  only; card ManualRef buttons open the covering per-type excerpt, not the
  single aspect — per-aspect ranges are not registered in `refs.json`.
- Mysteries have no registered section key of their own: they cite
  `aspects-edge` (3672–3915), whose range covers both Edge (3672–3704) and
  Mystery (3710–3915) pages. A dedicated `aspects-mystery` key (3710–3915)
  would give cleaner dialogs — lead's call, refs.json is shared.
- Connection abilities have no names in the manual (3916–3960); the ten
  names in `aspects.json` are editorial labels for browsing.
- The `Blighted` tag marks the ten burdens tied to the Blighted condition
  (manual 4033–4034); the UI does not otherwise model condition linkage.
- No owned-aspects tracking; this tool persists nothing by design. Future
  "owned aspects" tracking needs a new claimed storage name (coordinate
  with the lead).
