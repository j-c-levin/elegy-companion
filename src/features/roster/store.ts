import { reactive, watch } from 'vue'

import { makeId, readJson, writeJson } from '@/store'

import { clampRank, CREATURE_TYPES, pulseMax, type CreatureType, type Npc, type Rank } from './types'

const STORAGE_NAME = 'npc-roster'
const STORAGE_VERSION = 1

interface StoredRoster {
  version: number
  npcs: unknown[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function coerceNpc(raw: unknown): Npc | null {
  if (!isRecord(raw) || typeof raw.id !== 'string') return null
  const type = CREATURE_TYPES.includes(raw.type as CreatureType)
    ? (raw.type as CreatureType)
    : 'mortal'
  const rank = clampRank(typeof raw.rank === 'number' ? raw.rank : 1)
  const name = typeof raw.name === 'string' ? raw.name : ''
  return {
    id: raw.id,
    name: name.trim() || 'Unnamed',
    type,
    rank,
    pulse: typeof raw.pulse === 'number' && Number.isFinite(raw.pulse) ? raw.pulse : null,
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
  }
}

let refusePersist = false

function load(): Npc[] {
  const stored = readJson<StoredRoster>(STORAGE_NAME)
  if (!stored || !Array.isArray(stored.npcs)) return []
  if (typeof stored.version === 'number' && stored.version > STORAGE_VERSION) {
    console.warn(`[elegy] stored roster is version ${stored.version}; ignoring newer data`)
    refusePersist = true
    return []
  }
  return stored.npcs.map(coerceNpc).filter((npc): npc is Npc => npc !== null)
}

const state = reactive<{ npcs: Npc[] }>({ npcs: load() })

watch(
  () => state.npcs,
  () => {
    if (refusePersist) {
      console.warn('[elegy] refusing to persist roster: stored data is from a newer version')
      return
    }
    writeJson(STORAGE_NAME, { version: STORAGE_VERSION, npcs: state.npcs })
  },
  { deep: true },
)

export function allNpcs(): Npc[] {
  return state.npcs
}

export function addNpc(input: {
  name: string
  type: CreatureType
  rank: Rank
  pulse: number | null
  notes: string
}): Npc {
  const npc: Npc = {
    id: makeId(),
    name: input.name.trim() || 'Unnamed',
    type: input.type,
    rank: input.rank,
    pulse: input.pulse === null ? null : Math.min(Math.max(0, Math.round(input.pulse)), pulseMax(input.rank)),
    notes: input.notes.trim(),
    createdAt: Date.now(),
  }
  state.npcs.push(npc)
  return npc
}

export function updateNpc(id: string, patch: Partial<Omit<Npc, 'id' | 'createdAt'>>): void {
  const npc = state.npcs.find((entry) => entry.id === id)
  if (!npc) return
  if (patch.name !== undefined) npc.name = patch.name.trim() || 'Unnamed'
  if (patch.type !== undefined) npc.type = patch.type
  if (patch.rank !== undefined) {
    npc.rank = clampRank(patch.rank)
    if (npc.pulse !== null) npc.pulse = Math.min(npc.pulse, pulseMax(npc.rank))
  }
  if (patch.pulse !== undefined) {
    npc.pulse =
      patch.pulse === null
        ? null
        : Math.min(Math.max(0, Math.round(patch.pulse)), pulseMax(npc.rank))
  }
  if (patch.notes !== undefined) npc.notes = patch.notes.trim()
}

export function removeNpc(id: string): void {
  const index = state.npcs.findIndex((entry) => entry.id === id)
  if (index !== -1) state.npcs.splice(index, 1)
}
