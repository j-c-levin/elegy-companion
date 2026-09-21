import { readJson, writeJson } from '@/store'

import truthsData from '@/data/truths.json'

export const WORLD_STORAGE_NAME = 'world'
export const WORLD_STORAGE_VERSION = 1

export type TruthId =
  | 'origins'
  | 'innate-powers'
  | 'population'
  | 'political-landscape'
  | 'loyalty'
  | 'hunting-territory'
  | 'sunlight'
  | 'district-access'
  | 'witches'
  | 'hunters'
  | 'werewolves'
  | 'fey'

export const TRUTH_IDS: readonly TruthId[] = truthsData.categories.map(
  (category) => category.id as TruthId,
)

export type TruthChoice = string

export interface CityState {
  name: string
  founded: string
  economy: string
  climate: string
  languages: string
  highlight: string
  uglySide: string
  factionName: string
  factionValues: string[]
  districts: string[]
}

export interface FirstMissionState {
  title: string
  subject: string
  goal: string
  rank: number | null
  scene: string
}

export interface WorldState {
  version: number
  truths: Record<TruthId, TruthChoice>
  city: CityState
  firstMission: FirstMissionState
}

function emptyTruths(): Record<TruthId, TruthChoice> {
  return Object.fromEntries(TRUTH_IDS.map((id) => [id, ''])) as Record<TruthId, TruthChoice>
}

function emptyCity(): CityState {
  return {
    name: '',
    founded: '',
    economy: '',
    climate: '',
    languages: '',
    highlight: '',
    uglySide: '',
    factionName: '',
    factionValues: [],
    districts: [],
  }
}

function emptyMission(): FirstMissionState {
  return { title: '', subject: '', goal: '', rank: null, scene: '' }
}

export function createDefaultWorld(): WorldState {
  return { version: WORLD_STORAGE_VERSION, truths: emptyTruths(), city: emptyCity(), firstMission: emptyMission() }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function coerceWorld(raw: unknown): WorldState {
  const fallback = createDefaultWorld()
  if (!isRecord(raw)) return fallback
  if (typeof raw.version === 'number' && raw.version > WORLD_STORAGE_VERSION) {
    console.warn(`[elegy] stored world is version ${raw.version}; ignoring newer data`)
    return fallback
  }
  const state = createDefaultWorld()
  if (isRecord(raw.truths)) {
    for (const id of TRUTH_IDS) {
      if (typeof raw.truths[id] === 'string') state.truths[id] = raw.truths[id]
    }
  }
  if (isRecord(raw.city)) {
    for (const key of ['name', 'founded', 'economy', 'climate', 'languages', 'highlight', 'uglySide', 'factionName'] as const) {
      if (typeof raw.city[key] === 'string') state.city[key] = raw.city[key]
    }
    if (Array.isArray(raw.city.factionValues)) {
      state.city.factionValues = raw.city.factionValues.filter((v): v is string => typeof v === 'string')
    }
    if (Array.isArray(raw.city.districts)) {
      state.city.districts = raw.city.districts.filter((v): v is string => typeof v === 'string')
    }
  }
  if (isRecord(raw.firstMission)) {
    for (const key of ['title', 'subject', 'goal', 'scene'] as const) {
      if (typeof raw.firstMission[key] === 'string') state.firstMission[key] = raw.firstMission[key]
    }
    if (typeof raw.firstMission.rank === 'number' && Number.isFinite(raw.firstMission.rank)) {
      state.firstMission.rank = Math.min(5, Math.max(1, Math.round(raw.firstMission.rank)))
    }
  }
  return state
}

export function loadWorld(): WorldState {
  return coerceWorld(readJson<unknown>(WORLD_STORAGE_NAME))
}

export function saveWorld(state: WorldState): void {
  writeJson(WORLD_STORAGE_NAME, state)
}

export function setTruth(state: WorldState, id: TruthId, choice: TruthChoice): void {
  state.truths[id] = choice
  saveWorld(state)
}
