# Connections feature (Phase 2 task 8)

Dedicated connection manager at `/connections`. Scope: create Connections with name and Rank
(manual 980–985), Rank 1–5 with the per-rank progress table, Pulse = Rank + 2 (1060–1062), the
Sealed state and its XP / +2-Rush effects (1017–1019), Bloodied by you / by them states with their
mechanical effects (1029–1049), testing outcomes (1026–1046), Pulse damage and the three healing
routes (1057–1079). Progress-track math for filling a Connection already exists in the tracks
feature; do not duplicate it — cite and link where the two overlap.

## Implemented

- `ConnectionsPage.vue` — create Connections (name, Rank 1–5 picker, mortality), page XP/Rush
  chips, batch "you slumbered" healing (+Rank Pulse to every live Connection, manual 1061–1062),
  roster, rank reference (marks to fill per rank from 924–927/942–950, max Pulse, XP per Rank
  from 1136–1140), common-NPC-rank citation via `npc-ranks`.
- `components/ConnectionCard.vue` — per-connection management:
  - Name edit, Rank select (re-clamps Pulse to the new max Pulse, manual 1060–1062), mortality
    toggle (tests roll Soul if mortal, Charm if not, manual 1028–1029).
  - Progress & sealing: seal grants XP per Rank via `awardXp` (1014–1016, 1136–1140); "Sealed
    without XP" affordance for seals already claimed on the track; sealed progress awards +2 Rush
    capped at max (1017–1019). Marking marks is not duplicated — the card links to Progress Tracks.
  - Test the Connection: inline roll (1d6 + Soul/Charm, +1 if Sealed, vs 2d10, manual
    1028–1029) or manual outcome recording; Stylish/Flat grant progress (sealed → +2 Rush);
    Failure opens the proof-of-loyalty pick-one (drink their blood → Bloodied by them; required
    Mission at Rank +1, max 5, with benefit suspended; refuse → permanently undone, manual
    1031–1046). Challenge-dice matches during a test point to the Roll Engine (513–524).
  - Pulse: max = Rank + 2, damage buttons (−1/−2), heal +1; at 0 Pulse the avoid-destruction roll
    (dice + Rank instead of an Attribute): Stylish +1 Pulse, Flat +1 Pulse −1 Rush, Failure out of
    action, match = dead (1071–1079).
  - Three healing routes (1057–1079): slumber (+Rank), give blood (1–3 Pulse at the same Blood
    cost, marks Bloodied by you, Conscience reminder, 1036–1037/1063–1066), let them heal (dice +
    Rank: Stylish +Rank, Flat half Rank up, Failure half Rank down plus pay the price).
  - Blood bonds: Bloodied-by-you (extra action die on interactions, display only, 1042–1045),
    Bloodied-by-them (subtract their Rank when rolling against them, display only, 1048–1051),
    drank-against-your-will (no dots or Feats, grants no bonuses, 1046–1048).
  - Notes and a free-text "linked track" reference field.

## Storage

- `elegy:connections` (version 1 payload): owned by this feature. Connection state is structured
  (rank, pulse, flags, notes), so it does not go into `game.lists` (text-only items).
  Payload: `{ version: 1, connections: Connection[] }`; corrupt/newer payloads fall back to
  defaults per field (newer-version data is warned about and never overwritten).
- Do not read or write `elegy:progress-tracks`; the tracks tool keeps its own connection-kind
  tracks for mission-linked progress. If the two need linking, do it by reference (a name/id note)
  and record the limitation in "Known limitations" here.
- `game.xp` / `game.meters`: mutate only through `updateGame`; award XP with
  `awardXp` from `@/features/session/xp` (see `docs/store.md` XP conventions).

Connection fields: `id, name, rank (1–5), mortal, pulse, sealed, bloodiedByYou, bloodiedByThem,
boundAgainstWill, loyaltyDemand, outOfAction, dead, notes, trackNote, createdAt`.

## Files the implementation agent may touch

Everything in `src/features/connections/` (this README included), plus nothing else:
`src/router/routes.ts`, `src/store/*`, `src/styles/base.css`, `src/manual/refs.json` (need a new
citation key: coordinate with the lead — shared file) and other features are off-limits.
Feature styles stay scoped in this feature's SFCs (`connections-shared.css` mirrors the tracks
feature's feature-local shared-class file and is loaded by this feature only).

## Cross-tool notes

- Slumber heals Connections by their Rank in Pulse (manual 1061–1062): the Session night log shows
  a reminder linking here; applying the heal belongs to this feature (per-card button and the
  page-level batch button).
- Interaction bonus when Bloodied by you (extra action die, 1043–1045) and the Rank penalty when
  acting against a Connection Bloodied by them (1048–1050) surface here as displayed rules text;
  the Roll Engine reads modifiers from the store only, so if rolls should consume these states,
  coordinate with the lead before adding cross-feature imports.
- Sealing XP flows through `awardXp` from `@/features/session/xp`, the sanctioned XP entry point.

## Known limitations

- No automated link to Progress Tracks. Filling the Connection's progress track happens in the
  tracks tool (ten boxes, marks per rank); this manager never reads or writes
  `elegy:progress-tracks`, so ticks, rank, and seal state are not synced. Linking is by the free
  text `trackNote` field only. Sealing can be claimed in either tool — sealing here awards XP, and
  the tracks tool awards its own XP when sealing a connection-kind track; use "Mark Sealed without
  XP" here if the XP was already claimed with the track.
- The failed-test "required Mission" (1042–1046) is not created as a track; commit it manually in
  Progress Tracks. Locally only the benefit suspension is recorded (`loyaltyDemand`), cleared by
  hand ("Mission done").
- "Create a Connection if you don't already have one" on bloodying (1032–1037, 1043–1046) and the
  progress it grants are manual: create the card, then tick Bloodied by you / by them.
- Inline rolls here resolve verdicts only; Twist/Misfortune/Impulse tables are not wired (use the
  Roll Engine, manual 513–524). Avoid-destruction matches are handled (dead).
- The extra action die and the subtract-Rank modifiers of the Bloodied states are rules text
  only — the Roll Engine does not consume them (no cross-feature store contract exists yet).
- A failed test's "If you refuse or fail, the Connection is permanently undone" deletes the card
  (two-step confirm); there is no archive/undo history.
- Dead Connections remain in the roster, tagged "Dead or destroyed", until deleted manually.
