import { reactive, type DeepReadonly } from 'vue'

import { readJson, writeJson } from './storage'
import { ATTRIBUTE_KEYS } from './types'
import type {
  AttributeKey,
  CharacterIdentity,
  GameMeters,
  GameState,
  ListItem,
  Meter,
} from './types'

export const GAME_SCHEMA_VERSION = 1
export const GAME_STORAGE_NAME = 'game'
export const METER_MAX = 5
export const BASE_RUSH = 2
export const MAX_RUSH = 10

const IDENTITY_TEXT_KEYS = [
  'name',
  'apparentAge',
  'realAge',
  'occupation',
  'look',
  'progenitor',
  'home',
] as const satisfies readonly (keyof CharacterIdentity)[]

const METER_KEYS = ['health', 'clarity', 'blood'] as const

export function createDefaultMeters(): GameMeters {
  const plain = (value: number): Meter => ({ value, max: METER_MAX })
  return {
    health: plain(5),
    clarity: plain(5),
    blood: plain(4),
    rush: { value: BASE_RUSH, base: BASE_RUSH, max: MAX_RUSH },
  }
}

export function createDefaultState(): GameState {
  return {
    version: GAME_SCHEMA_VERSION,
    identity: {
      name: '',
      apparentAge: '',
      realAge: '',
      occupation: '',
      look: '',
      progenitor: '',
      home: '',
      possessions: [],
    },
    attributes: { body: 0, mind: 0, charm: 0, soul: 0 },
    meters: createDefaultMeters(),
    xp: 0,
    activeConditions: [],
    lists: {},
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function coerceMeters(raw: unknown): GameMeters {
  const meters = createDefaultMeters()
  if (!isRecord(raw)) return meters
  for (const key of METER_KEYS) {
    const meter = raw[key]
    if (
      isRecord(meter) &&
      typeof meter.value === 'number' &&
      Number.isFinite(meter.value) &&
      typeof meter.max === 'number' &&
      Number.isFinite(meter.max)
    ) {
      meters[key] = { value: meter.value, max: meter.max }
    }
  }
  const rush = raw.rush
  if (
    isRecord(rush) &&
    typeof rush.value === 'number' &&
    Number.isFinite(rush.value) &&
    typeof rush.base === 'number' &&
    Number.isFinite(rush.base) &&
    typeof rush.max === 'number' &&
    Number.isFinite(rush.max)
  ) {
    meters.rush = { value: rush.value, base: rush.base, max: rush.max }
  }
  return meters
}

export function migrateGameState(raw: unknown): GameState {
  const state = createDefaultState()
  if (!isRecord(raw)) return state
  const version = typeof raw.version === 'number' ? raw.version : 0
  if (version > GAME_SCHEMA_VERSION) {
    console.warn(
      `[elegy] stored game data is version ${version}, newer than supported ${GAME_SCHEMA_VERSION}; loaded defaults instead`,
    )
    return state
  }
  const identity = raw.identity
  if (isRecord(identity)) {
    for (const key of IDENTITY_TEXT_KEYS) {
      const value = identity[key]
      if (typeof value === 'string') state.identity[key] = value
    }
    if (Array.isArray(identity.possessions)) {
      state.identity.possessions = identity.possessions.filter(
        (item): item is string => typeof item === 'string',
      )
    }
  }
  if (isRecord(raw.attributes)) {
    for (const key of ATTRIBUTE_KEYS) {
      const value = raw.attributes[key]
      if (typeof value === 'number' && Number.isFinite(value)) {
        state.attributes[key as AttributeKey] = value
      }
    }
  }
  state.meters = coerceMeters(raw.meters)
  if (typeof raw.xp === 'number' && Number.isFinite(raw.xp)) state.xp = raw.xp
  if (Array.isArray(raw.activeConditions)) {
    state.activeConditions = raw.activeConditions.filter(
      (item): item is string => typeof item === 'string',
    )
  }
  if (isRecord(raw.lists)) {
    for (const [name, items] of Object.entries(raw.lists)) {
      if (!Array.isArray(items)) continue
      const cleaned: ListItem[] = []
      for (const item of items) {
        if (isRecord(item) && typeof item.id === 'string' && typeof item.text === 'string') {
          cleaned.push({ id: item.id, text: item.text })
        }
      }
      state.lists[name] = cleaned
    }
  }
  return state
}

const stored = readJson<unknown>(GAME_STORAGE_NAME)
const storedVersion =
  isRecord(stored) && typeof stored.version === 'number' ? stored.version : null
const persistBlocked = storedVersion !== null && storedVersion > GAME_SCHEMA_VERSION

const state: GameState = reactive(migrateGameState(stored))

export const game: DeepReadonly<GameState> = state

export function persistGame(): void {
  if (persistBlocked) {
    console.warn('[elegy] refusing to persist: stored data is from a newer schema version')
    return
  }
  writeJson(GAME_STORAGE_NAME, state)
}

export function updateGame(recipe: (draft: GameState) => void): void {
  recipe(state)
  persistGame()
}

export function resetGame(): void {
  Object.assign(state, createDefaultState())
  persistGame()
}

export function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const bits = (Math.random() * 16) | 0
    return (char === 'x' ? bits : (bits & 0x3) | 0x8).toString(16)
  })
}

export function addListItem(draft: GameState, listName: string, text: string): ListItem {
  const item: ListItem = { id: makeId(), text }
  const list = draft.lists[listName] ?? []
  list.push(item)
  draft.lists[listName] = list
  return item
}

export function removeListItem(draft: GameState, listName: string, id: string): void {
  const list = draft.lists[listName]
  if (!list) return
  draft.lists[listName] = list.filter((item) => item.id !== id)
}
