# Shared store API

The shared game state layer lives in `src/store/`. Feature agents consume it read-write through
the functions below; they never rewrite these files, they extend additively in their own feature
directories. All state persists to `localStorage` under the `elegy:` namespace — no backend, no sync.
The store assumes a single tab per device: last-write-wins, no `storage`-event sync.

## Where things live

| File | Purpose |
|---|---|
| `src/store/types.ts` | All shared types (re-exported from the barrel) |
| `src/store/storage.ts` | Generic namespaced localStorage helpers |
| `src/store/game.ts` | The reactive game state singleton, defaults, migration, list helpers |
| `src/store/index.ts` | Barrel — import from `@/store` |

Import everything from the barrel:

```ts
import { game, updateGame, resetGame, addListItem, METER_MAX } from '@/store'
```

## Types

```ts
export const ATTRIBUTE_KEYS = ['body', 'mind', 'charm', 'soul'] as const
export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number]   // 'body' | 'mind' | 'charm' | 'soul'
export type Attributes = Record<AttributeKey, number>

export type MeterKey = 'health' | 'clarity' | 'blood' | 'rush'

export interface Meter {            // Health / Clarity / Blood
  value: number
  max: number
}

export interface RushMeter extends Meter {
  base: number                      // base Rush, resets here when cooled (manual 363–375)
}

export interface GameMeters {
  health: Meter
  clarity: Meter
  blood: Meter
  rush: RushMeter
}

export interface CharacterIdentity {          // manual 174–190
  name: string
  apparentAge: string                         // free text, ages like "early 20s"
  realAge: string                             // free text, may be "18" or "two centuries"
  occupation: string
  look: string
  progenitor: string
  home: string
  possessions: string[]
}

export interface ListItem {
  id: string
  text: string
}

export interface GameState {
  version: number                   // GAME_SCHEMA_VERSION
  identity: CharacterIdentity
  attributes: Attributes            // character creation: distribute +3, +2, +2, +1 (manual 1942–1946); 0 = not yet set
  meters: GameMeters
  xp: number
  activeConditions: string[]        // e.g. ['Wounded', 'In Shock'] — feature agents own the catalogs
  lists: Record<string, ListItem[]> // generic named lists for feature data (see below)
}
```

### Meter defaults (manual 2046–2052, "Step 7: Finishing Touches")

- Health 5 / max 5, Clarity 5 / max 5, Blood 4 / max 5 (`METER_MAX = 5`, see manual 6909 / 7137)
- Rush: value 2, `base` 2 (`BASE_RUSH`), `max` 10 (`MAX_RUSH`) — "Set Max Rush to 10, and Base Rush to 2", manual 2048

`maxRush` is `game.meters.rush.max`; `baseRush` is `game.meters.rush.base`. Conditions that adjust
them mutate those fields; do not cache them.

## Constants

| Export | Value | Meaning |
|---|---|---|
| `GAME_SCHEMA_VERSION` | `1` | Bump only when the shared schema itself changes shape |
| `GAME_STORAGE_NAME` | `'game'` | localStorage key is `elegy:game` |
| `METER_MAX` | `5` | Default max for Health / Clarity / Blood |
| `BASE_RUSH` | `2` | Default base Rush (manual 363–375, 2048) |
| `MAX_RUSH` | `10` | Default max Rush (manual 2048) |
| `ATTRIBUTE_KEYS` | readonly tuple | Iterate attributes without string literals |

## Storage helpers (`src/store/storage.ts`)

For feature-local persisted data (tracks, logs, oracle history). Keys are namespaced for you;
use one name per feature concern, kebab-case (e.g. `'progress-tracks'` → key `elegy:progress-tracks`).

```ts
function storageKey(name: string): string          // 'elegy:' + name
function readJson<T>(name: string): T | null       // safe parse; null if absent/corrupt
function writeJson(name: string, value: unknown): void   // JSON.stringify; swallows quota errors
function removeKey(name: string): void
```

Version feature-local data by embedding `version` in the stored value and migrating on read —
the same pattern `migrateGameState` uses.

## Game state functions (`src/store/game.ts`)

### `game: DeepReadonly<GameState>`

A module-level read-only view over a Vue `reactive` singleton, loaded from `localStorage` at
import time. Read it directly anywhere (it is reactive; templates and computeds track it).
`vue-tsc` rejects direct writes (`game.identity.name = 'x'`, `v-model="game.identity.name"`)
— the only mutation paths are `updateGame` and `resetGame`. Reads stay fully reactive in
templates; note that template `v-model` on a readonly path does not raise a vue-tsc error, so
feature agents must bind native form inputs through `:value` + `@input` into
`updateGame` instead of `v-model="game...."`. (`:model-value` /
`@update:model-value` are inert on native inputs — the props render as DOM
attributes and no event is ever emitted — so do not use that pattern there;
it is only valid on a wrapper component that genuinely emits
`update:modelValue`.)

### `createDefaultState(): GameState`

Fresh blank state: empty identity, all attributes 0, meters at creation defaults (table above),
`xp: 0`, no conditions, empty lists.

### `createDefaultMeters(): GameMeters`

Meter block at creation defaults (see table above). Useful when resetting meters without
resetting the character.

### `migrateGameState(raw: unknown): GameState`

Parses arbitrary stored JSON into a valid `GameState`. Unknown/invalid fields fall back to
defaults per field; `lists` items keep only `id` and `text` — extra fields are stripped.
A stored `version` newer than `GAME_SCHEMA_VERSION` logs a console warning and loads defaults;
the load-time guard refuses to persist over it, so an older bundle never clobbers newer data.
Persistence code calls this; feature code normally does not.

### `game` loading + `persistGame(): void`

The singleton loads once via `readJson('game')` + `migrateGameState` and refuses to persist
when the stored payload came from a schema newer than `GAME_SCHEMA_VERSION` (stale-bundle
protection). `persistGame()` serializes the current state to `localStorage` — `updateGame`
and `resetGame` already call it; use it directly only if you mutate outside `updateGame` (avoid).

### `updateGame(recipe: (draft: GameState) => void): void`

The one way to change shared state. The recipe receives the live reactive state object (not
an immer-style draft), so it mutates in place; persistence runs after the recipe returns.
Keep recipes synchronous and non-throwing: if the recipe throws, memory keeps the partial
mutation while disk still holds the previous state, and nothing retries the write.

```ts
updateGame((draft) => {
  draft.meters.health.value -= 1
  draft.xp += 1
})
```

### `resetGame(): void`

Replaces all shared state with `createDefaultState()` and persists. Use for a "new character"
affordance; confirm with the user first, it is destructive.

### `makeId(): string`

Stable unique id for list items and feature entities. `crypto.randomUUID()` with a
Math.random-based fallback for non-secure contexts (e.g. phone testing over LAN HTTP).

### `addListItem(draft: GameState, listName: string, text: string): ListItem`

Appends `{ id, text }` to a named list (creating it if missing) and returns the item. Call it
inside `updateGame`.

### `removeListItem(draft: GameState, listName: string, id: string): void`

Removes the item with that id from the named list. Call it inside `updateGame`.

### The `lists` container

Feature data that is a simple list of named entries (loose ends, connections, tracks, journal
entries) should live in `game.lists` under a feature-owned name. Treat names as owned by one
feature; document yours in your feature's README. Structured per-item state goes in your own
feature-local storage key (see storage helpers) instead — `lists` is for simple text entries.

## Usage example

```ts
import { game, updateGame, addListItem, removeListItem } from '@/store'

// read (reactive)
const rush = game.meters.rush

// write
updateGame((draft) => {
  draft.identity.name = 'Yasmin'
  draft.attributes.body = 3
  draft.attributes.mind = 2
  draft.attributes.charm = 2
  draft.attributes.soul = 1
  draft.meters.rush.value += 1
})

// named lists
updateGame((draft) => {
  addListItem(draft, 'loose-ends', 'Who runs the docks?')
  removeListItem(draft, 'loose-ends', someId)
})
```

## Extension rules for feature agents

- Additive only: new files, new names in `lists`, or a new version case in `migrateGameState`
  when the shared schema must change. Never rewrite shared store files.
- Per-feature persisted data uses `readJson`/`writeJson` with your own storage name; keep a
  `version` field in your payload.
- Business rules (cascades, clamping, XP awards) live in feature code, not in the store.

## Storage name registry

Every storage name — a `game.lists` key or a feature-local `elegy:` name — is owned by exactly one
feature. Claim new names here and in your feature README before using them.

| Name | Kind | Owner | Notes |
|---|---|---|---|
| `game` (`elegy:game`) | shared state | store | the whole `GameState` |
| `game.lists['loose-ends']` | shared list | session (task 6, Loose Ends) | ownership moved here from the character feature in Phase 2 |
| `game.lists['loose-ends-tied']` | shared list | session (task 6, Loose Ends) | same transfer |
| `night-log` (`elegy:night-log`) | feature-local | session (task 5, Night log) | slumber checklist history (manual 767–778) |
| `connections` (`elegy:connections`) | feature-local | connections (task 8) | connection manager roster (manual 979–1084) |
| `npc-roster` (`elegy:npc-roster`) | feature-local | roster (task 9) | NPC & adversary roster (manual 986–1008, 4270–4854) |
| `character-tenets` (`elegy:character-tenets`) | feature-local | character | pending Conscience/Standing tests (Phase 1) |
| `rolls` (`elegy:rolls`) | feature-local | rolls | roll history and panel state (Phase 1) |
| `progress-tracks` (`elegy:progress-tracks`) | feature-local | tracks | mission/connection/combat tracks (Phase 1) |

## XP conventions

`game.xp` is shared state — no feature owns it. Every mutation goes through `updateGame`;
spending clamps to 0 minimum, awards never make it negative (manual 1122–1160). Phase 2 code
awards and spends XP through the small helpers in `src/features/session/xp.ts` (`awardXp` /
`spendXp`); any feature may import them, they are the sanctioned cross-feature XP entry point.
Both helpers ignore non-positive amounts; `spendXp` clamps the total at 0 and reports nothing —
callers must pre-check `game.xp >= cost` and disable unaffordable actions (manual 1123–1155).
Do not edit `xp.ts` in an implementation task — it is frozen for the phase so parallel
worktrees cannot collide; if you need more, add a module next to your own SFC. The Phase 1
helpers (`character/sheet.ts` `addXp`/`spendXp`, `tracks/store.ts` `grantXp`) keep working;
migrating their call sites is end-of-phase cleanup, not Phase 2 work.
