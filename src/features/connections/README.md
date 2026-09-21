# Connections feature (Phase 2 task 8)

Dedicated connection manager at `/connections`. Scope: create Connections with name and Rank
(manual 980–985), Rank 1–5 with the per-rank progress table, Pulse = Rank + 2 (1060–1062), the
Sealed state and its XP / +2-Rush effects (1017–1019), Bloodied by you / by them states with their
mechanical effects (1029–1049), testing outcomes (1026–1046), Pulse damage and the three healing
routes (1057–1079). Progress-track math for filling a Connection already exists in the tracks
feature; do not duplicate it — cite and link where the two overlap.

## Storage

- `elegy:connections` (version 1 payload): owned by this feature. Connection state is structured
  (rank, pulse, flags, notes), so it does not go into `game.lists` (text-only items).
- Do not read or write `elegy:progress-tracks`; the tracks tool keeps its own connection-kind
  tracks for mission-linked progress. If the two need linking, do it by reference (a name/id note)
  and record the limitation in "Known limitations" here.
- `game.xp` / `game.meters`: mutate only through `updateGame`; award XP with
  `awardXp` from `@/features/session/xp` (see `docs/store.md` XP conventions).

## Files the implementation agent may touch

Everything in `src/features/connections/` (this README included), plus nothing else:
`src/router/routes.ts`, `src/store/*`, `src/styles/base.css`, `src/manual/refs.json` (need a new
citation key: coordinate with the lead — shared file) and other features are off-limits.
Feature styles stay scoped in this feature's SFCs.

## Cross-tool notes

- Slumber heals Connections by their Rank in Pulse (manual 1074–1076): the Session night log shows
  a reminder linking here; applying the heal belongs to this feature.
- Interaction bonus when Bloodied by you (extra action die, 1043–1045) and the Rank penalty when
  acting against a Connection Bloodied by them (1048–1050) surface here as displayed rules text;
  the Roll Engine reads modifiers from the store only, so if rolls should consume these states,
  coordinate with the lead before adding cross-feature imports.
