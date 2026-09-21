# Roster feature (Phase 2 task 9)

NPC & adversary roster at `/roster`. Scope: create and list NPCs and adversaries with Rank,
Pulse and notes; the common-rank table per creature type (manual 986–1008, `npc-ranks`; repeated
for statblocks at 4311); Chapter 5 references (4270–4854) for creation rules and statblocks.
Combat rank/damage interaction stays in the tracks feature (1085–1121) — the roster is the
directory, not a second combat engine.

## Implementation (v1)

- `types.ts` — `Npc` record (name, creature type, rank, pulse, notes), creature types, the
  common-rank table data (986–1008, repeated 4311–4333), `transformedRank` (werewolves count one
  Rank higher while transformed, 1008 / 4333; statblocks 4573, 4587, 4589), `pulseMax`
  (= Rank + 2, 1060–1062).
- `store.ts` — reactive store persisted to `elegy:npc-roster` (payload `{ version: 1, npcs }`)
  via `readJson`/`writeJson`, stale-version guard mirroring `migrateGameState`. Pulse is clamped
  to 0–(Rank + 2) on write, including when Rank is lowered later.
- `CommonRankTable.vue` — the common-rank table as a creation helper: each titled cell is a
  button that prefills the form with that creature type and Rank. Werewolf cells are starred with
  the transformed-Rank footnote (1008). Cited via the pre-registered `npc-ranks` ManualRef key.
- `NpcForm.vue` — create/edit form (prop-driven; editing an entry loads it, a table pick loads
  the preset). Shows the common-rank title for the chosen type/Rank and the effective Rank while
  transformed; optional Pulse (defaults to Rank + 2) for Connection NPCs in dangerous missions
  (4303–4305).
- `RosterList.vue` — entry cards with type chip, Rank + common title, transformed-Rank chip,
  Pulse, notes; edit and two-step remove.
- `RulesPanel.vue` — Chapter 5 creation rules as cited text (4270–4310: single mechanical stat
  4277–4279, Drives/Means 4290–4294, Rank up/down 4299–4302, Pulse track 4303–4305, long-term
  NPCs 4282–4285, werewolf note 1008); statblock line map (4338–4854); combat-belongs-to-tracks
  note (1085–1121) with link-by-name/notes convention.

## Storage

- `elegy:npc-roster` (version 1 payload): owned by this feature. NPCs are structured records
  (name, creature type, rank, pulse, notes), so they do not go into `game.lists` (text-only items).
- `game.meters` / `game.xp`: shared state, mutate only through `updateGame` if the roster ever
  needs to (it does not in v1).

## Files the implementation agent may touch

Everything in `src/features/roster/` (this README included), plus nothing else:
`src/router/routes.ts`, `src/store/*`, `src/styles/base.css`, `src/manual/refs.json` (need a new
citation key: coordinate with the lead — shared file) and other features are off-limits.
Feature styles stay scoped in this feature's SFCs.

## Cross-tool notes

- Adversaries fought in Combat are modeled as combat tracks in the tracks tool; the roster holds
  the standing NPC/adversary entries. Keep the two linked by reference (name/notes), not by
  cross-feature imports. In v1 the link lives in the entry's notes (the form placeholder prompts
  for it) and the RulesPanel spells out the convention.
- Werewolves count as one Rank higher while transformed (manual 1008 note) — surfaced as rules
  text in the table footnote, the form hint, and the roster card chip.

## Known limitations (v1)

- **Chapter 5 citations are plain text.** `refs.json` (shared file, off-limits to this task) has
  no keys for 4270–4490 (creation + vampires/mortals/hunters/ghosts statblocks), 4491–4567
  (witches), 4568–4606 (werewolves), 4607–4660 (fey) or 4661–4854 (factions) — only `npc-ranks`
  (986–1008) was pre-registered. Those ranges are therefore cited as text, not ManualRef
  buttons; registering keys (e.g. `npc-creation` 4270–4310) would let the buttons render bundled
  excerpts.
- **The contract's "1007 note" is line 1008.** Lines 1006–1007 are blank in the extraction; the
  werewolf transformed-Rank note sits at 1008 (and 4333). Cited as 1008 throughout.
- **Records are name/type/rank/pulse/notes only.** Drives and Means (4290–4294) are carried in
  the notes field rather than structured fields; ghost-mission rank rule (4474) is not surfaced.
- **No cross-link to combat tracks beyond notes.** Linking is by name/notes as agreed; no
  validation that a referenced combat track exists.
- **Pulse is informational here.** Damage/healing/avoid-destruction mechanics for Connection NPCs
  stay in the tracks and connections tools; the roster records the standing value only.
- **Form resets are prop-driven.** Picking a table cell or editing another entry replaces any
  half-typed input in the form (including the name); the roster list is the source of truth.
- **Single-tab convention** applies (last write wins, no `storage`-event sync), per `docs/store.md`.
