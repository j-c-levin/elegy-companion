# Roster feature (Phase 2 task 9)

NPC & adversary roster at `/roster`. Scope: create and list NPCs and adversaries with Rank,
Pulse and notes; the common-rank table per creature type (manual 986–1008, `npc-ranks`; repeated
for statblocks at 4311); Chapter 5 references (4270–4854) for creation rules and statblocks.
Combat rank/damage interaction stays in the tracks feature (1085–1121) — the roster is the
directory, not a second combat engine.

## Storage

- `elegy:npc-roster` (version 1 payload): owned by this feature. NPCs are structured records
  (name, creature type, rank, pulse, notes), so they do not go into `game.lists` (text-only items).
- `game.meters` / `game.xp`: shared state, mutate only through `updateGame` if the roster ever
  needs to (it should not in v1).

## Files the implementation agent may touch

Everything in `src/features/roster/` (this README included), plus nothing else:
`src/router/routes.ts`, `src/store/*`, `src/styles/base.css`, `src/manual/refs.json` (need a new
citation key: coordinate with the lead — shared file) and other features are off-limits.
Feature styles stay scoped in this feature's SFCs.

## Cross-tool notes

- Adversaries fought in Combat are modeled as combat tracks in the tracks tool; the roster holds
  the standing NPC/adversary entries. Keep the two linked by reference (name/notes), not by
  cross-feature imports.
- Werewolves count as one Rank higher while transformed (manual 1007 note) — surface as rules text.
