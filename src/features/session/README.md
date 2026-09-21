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
  here from the character feature in Phase 2 (see `docs/store.md`); the Loose Ends block in
  `src/features/character/XpSection.vue` is the legacy Phase 1 surface and is superseded.
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
