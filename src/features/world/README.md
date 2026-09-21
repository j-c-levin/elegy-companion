# World feature (Phase 3 task 10)

Guided world creation at `/world`. Owner: task 10 agent. Scope: step through Truths
with oracle wiring (manual 1491–1627), city creation (manual 2338–2698), first
mission generation (manual 2699–2891).

## Contract (foundation-owned, do not reshape)

- Truths options: `src/data/truths.json` (id `truths`, one entry per category with
  `options`; "Other / create your own" is a free-text slot, never a stored option).
  Import it read-only; do not edit the file (coordinate with the lead if a line is wrong).
- Persisted world state: `elegy:world` via `readJson`/`writeJson` (see `world.ts`
  `loadWorld` / `saveWorld`), payload `{ version: 1, truths, city, firstMission }`.
- Types + defaults: `src/features/world/world.ts` (`TruthId`, `WorldState`,
  `createDefaultWorld`, `loadWorld`, `saveWorld`, `setTruth`).
- Truth choice values are option ids plus `custom:<text>` for free-text "Other".
  City `details` and `districts` are free text; `firstMission` links to Progress
  Tracks by name reference only.

## Storage (claimed)

- `world` (`elegy:world`, version 1): owned by this feature. World truths, city,
  and first-mission draft. Never write `game.*` from here except through `updateGame`.
- Commitments onto shared state (first mission → `elegy:progress-tracks`, mentor
  Connection → `elegy:connections`) happen by reference (name/rank notes) or by
  the user confirming in the owning tool — never by importing another feature's store.

## Files the implementation agent may touch

Everything in `src/features/world/` (this README included), plus nothing else:
`src/router/routes.ts`, `src/store/*`, `src/styles/base.css`, `src/manual/refs.json`
(need a new citation key: coordinate with the lead — shared file),
`src/data/truths.json` and other features are off-limits.

## Manual citations

Use the pre-registered keys: `truths` (1491–1627) + per-category keys
(`truths-origins`, `truths-innate-powers`, `truths-population`,
`truths-political-landscape`, `truths-loyalty`, `truths-hunting-territory`,
`truths-sunlight`, `truths-district-access`, `truths-witches`,
`truths-hunters`, `truths-werewolves`, `truths-fey`), `city` (2338–2698),
`city-basics`, `city-faction`, `city-districts`, `first-mission` (2699–2891),
`first-mission-envision`, `first-mission-commit`.

## Known limitations (foundation stub)

- `WorldPage.vue` is a `ToolStub` placeholder. The wizard UI is task 10's work.
