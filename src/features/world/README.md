# World feature (Phase 3 task 10)

Guided world creation at `/world`. Owner: task 10 agent. Scope: step through Truths
with oracle wiring (manual 1491–1627), city creation (manual 2338–2698), first
mission generation (manual 2699–2891). Cite the per-category and per-section
keys below; whole-chapter ManualRef dialogs are intentionally not registered.

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

Use the pre-registered keys: per-category keys (`truths-origins`,
`truths-innate-powers`, `truths-population`, `truths-political-landscape`,
`truths-loyalty`, `truths-hunting-territory`, `truths-sunlight`,
`truths-district-access`, `truths-witches`, `truths-hunters`,
`truths-werewolves`, `truths-fey`), `city-basics`, `city-faction`,
`city-highlight`, `city-ugly-side`, `city-districts`,
`first-mission-envision`, `first-mission-commit`.

## Known limitations

- The manual's d10 Highlight and Ugly side tables (manual 2358–2431, 2433–2500) are digitized
  locally in `city-tables.ts` with paraphrased summaries, not as `src/data/oracles` JSONs (the
  oracle registry is shared). The raw table text is available through `ManualRef` via the
  `city-highlight` and `city-ugly-side` keys wired next to the Roll controls.
- A whole-chapter `city` key (2338–2698) is intentionally unregistered per the foundation
  contract; the three section keys are cited instead.
- Truths have no oracle wiring: the manual directs choosing one option per category
  (1502–1504), not rolling, so no table is attached to that step.
- Districts are stored as free-text lines (per the contract). The structured add-form composes
  one string per district ("Name — Type — Faction: … — Key place: …"); individual fields are
  not recoverable after save.
- The wizard shows one step per screen at every viewport; the desktop "rail" is a sticky
  stepper, not a side-by-side view of all steps.
- Out-of-range `firstMission.rank` values are clamped to 1–5 on load rather than falling back
  to `null`.
- Persist guards refuse to overwrite newer stored data, mirroring `migrateGameState`; update
  both if the version scheme changes.
- The faction values list is capped at 3 with add/remove chips but does not enforce exactly
  three while drafting; the manual's "choose three values" (2508) is a hint, not a hard gate.
