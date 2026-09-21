# Character Sheet feature

Phase 1 item 1: the interactive character sheet (README roadmap). All rules implemented from
`reference/elegy-4e-beta-v3.txt`; line citations appear in the UI next to each rule.

## Shared state ownership

- `game.identity`, `game.attributes`, `game.meters`, `game.xp`, `game.activeConditions`: all
  written through `updateGame` from `sheet.ts`.
- `game.lists['loose-ends']` / `game.lists['loose-ends-tied']`: owned by Session. The legacy
  Loose Ends block was removed from this feature's XP section; tying and dropping live on
  `/session?view=loose-ends`. RecoverySection slumber still writes a new end via `addLooseEnd`.
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
store: the four named Burdens (Branded, Scarred, Torpid, Traumatized — `reducesBaseRush: true`)
reduce base Rush first (down to 0), then max Rush (manual 3965–3967); Blighted picks a Burden
Aspect of the player's choice (manual 876–879, 4033+), so it does not itself reduce base Rush;
Wounded, Mangled, In Shock, Tormented, Penitent, Cautioned and Discredited each reduce max
Rush by 1; Detached reduces Soul by 1, not max Rush (manual 866–869).

## Cross-tool notes

- Tenet tests (Conscience 853–882, Standing 856–907) and all recovery rolls are rolled in the
  Roll Engine; this sheet only records the picked outcome.
- Missions/progress tracks are referenced, never duplicated: `#tracks` links where the manual
  says "create a progress track".

## Feeding from preserved blood

Preserved blood applies "lose 1 Rush and gain 1 less Blood" only on a Failure result
(manual 800). Any non-failure feed that gains Blood erases Starving (manual 790–791, 809–813);
a Failure feed on preserved blood never triggers the voracious branch (no Conscience test) and
never erases Starving.

## Known limitations

- `pendingLoss` / `pendingRushLoss` are ephemeral module refs: reloading mid-cascade drops them,
  so the prompt a player was mid-answer on is lost.
- Rush caps resync only on condition change (`markCondition` / `eraseCondition` / `syncRushCaps`
  call sites). A reload with pre-existing conditions defers the resync until the next
  mark/erase; stored caps from an older build can show briefly until then.
- The Torpid-burden mitigation upgrade ("When you lose Blood and spend 1 Rush to mitigate,
  reduce the total Blood lost to 0 instead of by 1", manual ~4009–4013) is unimplemented.
- The remaining review-noted gaps from the original report still hold: no Aspect/Burden
  database (acquiring a burden applies only its starting −1 base/max Rush); the victim-fed-
  yesterday two-day rule is narrative text only; Mangled/Enraged/Discredited/Tormented
  progress-track completion is not wired back, so those conditions are erased manually.
