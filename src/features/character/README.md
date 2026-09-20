# Character Sheet feature

Phase 1 item 1: the interactive character sheet (README roadmap). All rules implemented from
`reference/elegy-4e-beta-v3.txt`; line citations appear in the UI next to each rule.

## Shared state ownership

- `game.identity`, `game.attributes`, `game.meters`, `game.xp`, `game.activeConditions`: all
  written through `updateGame` from `sheet.ts`.
- `game.lists['loose-ends']` / `game.lists['loose-ends-tied']`: owned by this feature.
- Feature-local storage: `elegy:character-tenets` (version 1) — pending Conscience/Standing tests.

## Condition catalog

`conditions.ts` is the authoritative catalog of condition keys stored in `game.activeConditions`:

| Track | Keys (cascade order) |
|---|---|
| health | `Wounded`, `Mangled`, `Scarred` |
| clarity | `In Shock`, `Tormented`, `Traumatized` |
| blood | `Starving`, `Enraged`, `Torpid` |
| conscience | `Detached`, `Penitent`, `Blighted` |
| standing | `Cautioned`, `Discredited`, `Branded` |

Effect modifiers per key (max Rush / Soul / action penalty) are in the catalog. `sheet.ts` keeps
`game.meters.rush.base` / `game.meters.rush.max` in sync with the active conditions on every
condition change, so other tools (Roll Engine, Progress Tracks) can read them straight from the
store: Burdens reduce base Rush first (down to 0), then max Rush (manual 3965–3967); Wounded,
Mangled, In Shock, Tormented, Penitent, Cautioned and Discredited each reduce max Rush by 1;
Detached reduces Soul by 1, not max Rush (manual 866–869).

## Cross-tool notes

- Tenet tests (Conscience 853–882, Standing 856–907) and all recovery rolls are rolled in the
  Roll Engine; this sheet only records the picked outcome.
- Missions/progress tracks are referenced, never duplicated: `#tracks` links where the manual
  says "create a progress track".
