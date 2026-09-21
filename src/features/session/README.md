# Session feature (Phase 2 tasks 5-7)

One bookkeeping flow at `/session`: the night log / slumber checklist, the Loose Ends tracker and
the XP economy. `SessionPage.vue` (foundation-owned) switches between three section SFCs using the
`?view=` query parameter (`night-log` | `loose-ends` | `xp`, default `night-log`); sections are
deep-linkable (`#/session?view=xp`).

## Scope and file ownership

One implementation agent owns exactly one section and never edits shared or sibling files:

| Task | Section | Files that agent may touch | Manual |
|---|---|---|---|
| 5 — Night log / slumber checklist | `NightLogSection.vue` | plus new modules it creates (e.g. `night-log.ts`) | 767–778 (`slumber`), context 762–805 (`blood`); Standing test 856–907 (`standing`) |
| 6 — Loose Ends tracker | `LooseEndsSection.vue` | plus new modules it creates | 1147–1155 (`loose-ends`), 1150–1152 (`loose-end-write`) |
| 7 — XP economy | `XpSection.vue` | plus new modules it creates | 1122–1160 (`xp`), 1128–1149 (`xp-acquire`), 1161–1187 (`xp-tallies`) |

Off-limits to all of them: `SessionPage.vue`, `xp.ts`, each other's files, `src/router/routes.ts`,
`src/store/*`, `src/styles/base.css`, `src/manual/refs.json` (need a new citation key: coordinate
with the lead — shared file), other features. Each agent documents its work in its own subsection
below ("Task N notes") rather than editing shared tables, so parallel branches do not conflict.

## Storage

- `game.lists['loose-ends']` / `game.lists['loose-ends-tied']`: owned by task 6. Ownership moved
  here from the character feature in Phase 2 (see `docs/store.md`); the legacy Loose Ends block
  in the character XP section was removed in Phase 2 cleanup.
- `elegy:night-log`: owned by task 5. Store the per-night slumber checklist history there with a
  `version` field (`docs/store.md` storage helpers); simple derived counters belong in the payload,
  not in new `game.lists` names.
- `game.xp`, `game.meters`: shared state, mutate only through `updateGame`.

## XP helpers

Award and spend XP via `awardXp` / `spendXp` from `./xp` (spend clamps to 0; manual 1122–1160).
Pre-check `game.xp >= cost` before spending — the helpers ignore non-positive amounts and report nothing.
`xp.ts` is foundation-owned and frozen for this phase so parallel worktrees cannot collide —
do not edit it in an implementation task. Loose Ends ties award XP with `awardXp(1)` inside the
same `updateGame` recipe as the list move, or as an immediate second call if that keeps the code
simpler; never write `draft.xp` directly from a section SFC.

## Cross-tool notes

- Slumbering restores each Connection's Pulse by its Rank (manual 1074–1076): the night log should
  surface a reminder linking to `/connections`, not mutate connections data; task 8 owns applying it.
- "Try Your Standing" (manual 770–772) is rolled in the Roll Engine like all tenet tests; the
  character feature owns the pending-test state (`elegy:character-tenets`). If the night log needs
  to queue one, prefer a prompt that links to `/character` over importing
  `character/sheet.ts` internals; revisit with the lead if a shared pending-test API is warranted.
- XP awarded for Mission/Connection completion is granted by the tracks feature; the XP section
  displays and spends the shared total but never double-awards rank XP (manual 1132–1140).

## Task 5 notes — Night log / slumber checklist (`feature/session-night-log`)

Files: `NightLogSection.vue` + `night-log.ts` (routine logic and history persistence). Built at
`/session?view=night-log`.

- The checklist runs the whole end-of-night routine in one `updateGame` recipe (manual 767–778,
  context 762–805): lose 1 Blood (unmitigable) and gain +1 Rush, capped at max Rush, mirroring the
  Phase 1 `character/sheet.ts` slumber clamping. If Blood is already 0 the meter is clamped, not
  driven below 0; a warning prompt then links to `/character` for cascade resolution
  (806–825, key `blood-cascade`) instead of duplicating cascade logic.
- The required lingering question (1150–1152, key `loose-end-write`) is written with `addListItem`
  into `game.lists['loose-ends']` (task 6's list; entries only) inside the same recipe. The
  slumber button stays disabled until the question is non-empty.
- "Violated a law or custom tonight" checkbox (856–907, key `standing`): after completing, a
  prompt links to `/character` to queue and resolve the Standing test. `character/sheet.ts` and
  `elegy:character-tenets` are never imported or written.
- Secondary flow "stay awake through the day" (773–776): lose 2 Blood, 1 less when spending
  1 Rush per 779–783 (key `mitigate-blood`, unavailable while Starving); logged as `stayed-awake`.
- After slumbering: reminder that each Connection recovers Pulse equal to its Rank (1057–1079,
  key `pulse`) linking to `/connections`; if `Cautioned` is active, a reminder to erase it on
  `/character` (888–890). Connections and conditions are never mutated from here.
- History persists in `elegy:night-log` via `readJson`/`writeJson` as a version-1 payload
  (`entries` capped at 100, newest first, plus `slumberCount` / `awakeCount` / `totalBloodLost`
  counters), validated and defaulted on read.

### Known limitations

- The Standing test is not queued into `elegy:character-tenets` programmatically — the user
  queues it on `/character` (cross-tool note above); revisit if a shared pending-test API lands.
- Connection Pulse recovery and `Cautioned` recovery are reminders only; they are applied on
  their owning pages (task 8 / character feature).
- The "Flow Your Blood with Soul" roll for staying awake must be made in the Roll Engine; the
  section reminds but does not roll.
- Counters are simple totals; no per-scene journaling (the Phase 4 journal may supersede).

## Task 6 notes — Loose Ends tracker

Implemented in `LooseEndsSection.vue` with list logic in `loose-ends.ts` (same directory):

- Write form appends a trimmed question to `game.lists['loose-ends']` via `addListItem` inside
  `updateGame`; empty input is rejected client-side and guarded in `writeLooseEnd`.
- "Tied (+1 XP)" moves the item from `loose-ends` to `loose-ends-tied` (same id and text, mirroring
  the legacy `character/sheet.ts` shape) and awards +1 XP through `awardXp(1)` from `./xp` as an
  immediate second call after the move's `updateGame` recipe; `draft.xp` is never written directly.
  A pre-check on the reactive read prevents awarding XP for an id that is no longer open (e.g.
  double-click).
- "Drop" removes an open end after an inline two-step confirm (button flips to "Sure?" for 4 s),
  matching `discardLooseEnd` semantics from `character/sheet.ts`.
- Entries render from the shared lists reactively, so questions written by the night log
  (task 5, via `addListItem`) appear without any extra wiring; items are plain `{ id, text }`.
- Manual citations use the pre-registered keys `loose-ends` (1147–1155) and `loose-end-write`
  (1150–1152); no new refs.json keys were needed.

### Known limitations

- Tying awards XP in a second `updateGame` call after the list move (sanctioned by this README's
  XP helpers section), so a crash between the two calls would persist the move without the XP.
- The tied list is a flat archive: tied ends cannot be re-opened or deleted; if a tie was a
  mistake, the only recourse is editing localStorage. Add an "untie" affordance if that bites.
- The Drop confirm is a local two-step button, not the character feature's `ConfirmButton`
  component (that file is outside this task's ownership); consider extracting a shared confirm
  component in end-of-phase cleanup.
- No per-entry timestamps: `ListItem` is `{ id, text }` only, so entries cannot be sorted by when
  they were written; list order (append at end) is the only chronology.

## Task 7 notes (XP economy)

`XpSection.vue` implements the XP economy at `/session?view=xp`:

- **Shared total with tally units**: `game.xp` rendered as tally marks grouped into 5-mark units
  (fifth tick drawn as the diagonal strike; a partial unit shows faded empty slots), manual
  1161–1187 (`xp-tallies`). An aria label describes units/ticks for screen readers.
- **Manual award buttons**: "+1 XP — Failure" and "+3 XP — Failure with a match" (manual
  1144–1146) call `awardXp` from `./xp`; the section never touches `draft.xp` directly.
- **Spend buttons**: 10 XP upgrade / 15 XP acquire (manual 1123–1155) call `spendXp` with the
  mandatory pre-check `game.xp >= cost`; buttons are disabled when unaffordable. Two-click
  confirm ("Cross out 2/3 units?") with a 4s disarm; while armed, the units that would be crossed
  out are highlighted in the tally (manual 1168–1172).
- **Acquisition guidance** (manual 1128–1149, `xp-acquire`; Edge/Expertise 1150–1152,
  Connections/Burdens 1153–1155): upgrade = new Ability + slumber;
  acquire flows per Aspect type — innate Gift (slumber), learned Gift / Mystery (Connection
  teaches via a favor Mission one Rank below theirs, min Rank 1), Edge/Expertise (narrative
  justification + slumber); Connections and Burdens are never bought with XP. Guided text links
  to `/connections` and `/tracks`; the section never grants rank XP itself — tracks owns
  Mission/Connection completion XP (manual 1132–1140). Tying Loose Ends (+1 XP, 1147–1152) is
  linked to the Loose Ends tab, not duplicated here.

### Known limitations (for end-of-phase cleanup)

- Devtools name collision: this component and `character/XpSection.vue` are both registered as
  `XpSection`. Rename one (e.g. `SessionXpSection`) when the legacy character surface retires.
- The spend-confirm armed state and tally-crossing affordance are local to this SFC; if another
  feature ever needs a confirm button, consider promoting a shared `ConfirmButton` (the character
  feature has one but importing across features would couple them).
- Manual award buttons are raw +1/+3 buttons by design (the roll engine could auto-award on
  Failure, but that would couple the rolls feature to session state — revisit with the lead).
