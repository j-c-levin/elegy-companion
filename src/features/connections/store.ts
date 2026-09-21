import { reactive, watch } from 'vue'

import { awardXp } from '@/features/session/xp'
import { game, makeId, readJson, updateGame, writeJson } from '@/store'

import {
  clampRank,
  pulseMax,
  XP_PER_RANK,
  type Connection,
  type DestroyOutcome,
  type HealOutcome,
  type Rank,
} from './types'

const STORAGE_NAME = 'connections'
const STORAGE_VERSION = 1

interface StoredConnections {
  version: number
  connections: unknown[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function coerceConnection(raw: unknown): Connection | null {
  if (!isRecord(raw) || typeof raw.id !== 'string') return null
  const rank = clampRank(typeof raw.rank === 'number' ? raw.rank : 1)
  const pulse = typeof raw.pulse === 'number' && Number.isFinite(raw.pulse) ? raw.pulse : pulseMax(rank)
  return {
    id: raw.id,
    name: typeof raw.name === 'string' ? raw.name : 'Unnamed',
    rank,
    mortal: raw.mortal === true,
    pulse: Math.min(pulseMax(rank), Math.max(0, Math.round(pulse))),
    sealed: raw.sealed === true,
    bloodiedByYou: raw.bloodiedByYou === true,
    bloodiedByThem: raw.bloodiedByThem === true,
    boundAgainstWill: raw.boundAgainstWill === true,
    loyaltyDemand: raw.loyaltyDemand === true,
    outOfAction: raw.outOfAction === true,
    dead: raw.dead === true,
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    trackNote: typeof raw.trackNote === 'string' ? raw.trackNote : '',
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
  }
}

let refusePersist = false

function load(): Connection[] {
  const stored = readJson<StoredConnections>(STORAGE_NAME)
  if (!stored || !Array.isArray(stored.connections)) return []
  if (typeof stored.version === 'number' && stored.version > STORAGE_VERSION) {
    console.warn(`[elegy] stored connections are version ${stored.version}; ignoring newer data`)
    refusePersist = true
    return []
  }
  return stored.connections.map(coerceConnection).filter((c): c is Connection => c !== null)
}

const state = reactive<{ list: Connection[] }>({ list: load() })

watch(
  () => state.list,
  () => {
    if (refusePersist) {
      console.warn('[elegy] refusing to persist connections: stored data is from a newer version')
      return
    }
    writeJson(STORAGE_NAME, { version: STORAGE_VERSION, connections: state.list })
  },
  { deep: true },
)

function find(id: string): Connection | undefined {
  return state.list.find((connection) => connection.id === id)
}

export function allConnections(): Connection[] {
  return state.list
}

export function addConnection(name: string, rank: Rank, mortal: boolean, notes = ''): Connection {
  const connection: Connection = {
    id: makeId(),
    name: name.trim() || 'Unnamed',
    rank,
    mortal,
    pulse: pulseMax(rank),
    sealed: false,
    bloodiedByYou: false,
    bloodiedByThem: false,
    boundAgainstWill: false,
    loyaltyDemand: false,
    outOfAction: false,
    dead: false,
    notes: notes.trim(),
    trackNote: '',
    createdAt: Date.now(),
  }
  state.list.push(connection)
  return connection
}

export function removeConnection(id: string): void {
  const index = state.list.findIndex((connection) => connection.id === id)
  if (index !== -1) state.list.splice(index, 1)
}

export function renameConnection(id: string, name: string): void {
  const connection = find(id)
  if (connection && name.trim()) connection.name = name.trim()
}

export function setRank(id: string, rank: number): void {
  const connection = find(id)
  if (!connection) return
  connection.rank = clampRank(rank)
  connection.pulse = Math.min(connection.pulse, pulseMax(connection.rank))
}

export function setMortal(id: string, mortal: boolean): void {
  const connection = find(id)
  if (connection) connection.mortal = mortal
}

export function setNotes(id: string, notes: string): void {
  const connection = find(id)
  if (connection) connection.notes = notes
}

export function setTrackNote(id: string, note: string): void {
  const connection = find(id)
  if (connection) connection.trackNote = note
}

// Manual 1014–1016: sealing grants experience per the Rank of the Connection.
export function seal(id: string): number {
  const connection = find(id)
  if (!connection || connection.sealed) return 0
  connection.sealed = true
  connection.outOfAction = false
  const xp = XP_PER_RANK[connection.rank]
  awardXp(xp)
  return xp
}

// For seals already claimed on the Connection's track in Progress Tracks.
export function markSealed(id: string): void {
  const connection = find(id)
  if (!connection) return
  connection.sealed = true
  connection.outOfAction = false
}

// Manual 1017–1019: progress on a Sealed Connection gains +2 Rush instead.
export function sealedProgressRush(): void {
  updateGame((draft) => {
    draft.meters.rush.value = Math.min(draft.meters.rush.max, draft.meters.rush.value + 2)
  })
}

export function loseRush(amount = 1): void {
  updateGame((draft) => {
    draft.meters.rush.value = Math.max(0, draft.meters.rush.value - amount)
  })
}

export function setBloodied(id: string, byYou: boolean, byThem: boolean): void {
  const connection = find(id)
  if (!connection) return
  connection.bloodiedByYou = byYou
  if (!byThem) connection.boundAgainstWill = false
  connection.bloodiedByThem = byThem
}

export function setBoundAgainstWill(id: string, value: boolean): void {
  const connection = find(id)
  if (connection) connection.boundAgainstWill = value
}

export function setLoyaltyDemand(id: string, value: boolean): void {
  const connection = find(id)
  if (connection) connection.loyaltyDemand = value
}

export function damagePulse(id: string, amount: number): void {
  const connection = find(id)
  if (!connection) return
  connection.pulse = Math.max(0, connection.pulse - amount)
}

export function healPulse(id: string, amount: number): void {
  const connection = find(id)
  if (!connection) return
  connection.pulse = Math.min(pulseMax(connection.rank), connection.pulse + amount)
  if (connection.pulse > 0) connection.outOfAction = false
}

// Manual 1061–1062: when you slumber, Connections recover Pulse equal to their Rank.
export function slumberHeal(id: string): void {
  const connection = find(id)
  if (!connection || connection.dead) return
  healPulse(id, connection.rank)
}

export function slumberHealAll(): number {
  let healed = 0
  for (const connection of state.list) {
    if (connection.dead || connection.pulse >= pulseMax(connection.rank)) continue
    slumberHeal(connection.id)
    healed++
  }
  return healed
}

// Manual 1063–1066: giving your blood restores 1-3 Pulse at the same Blood cost
// and marks the Connection as Bloodied by you.
export function giveBlood(id: string, amount: number): boolean {
  const connection = find(id)
  if (!connection || connection.dead || amount <= 0) return false
  if (game.meters.blood.value < amount) return false
  const cost = Math.min(amount, 3)
  updateGame((draft) => {
    draft.meters.blood.value = draft.meters.blood.value - cost
  })
  connection.bloodiedByYou = true
  healPulse(id, cost)
  return true
}

// Manual 1072–1077: letting them heal, rolled with dice + Rank instead of an Attribute.
export function letThemHeal(id: string, outcome: HealOutcome): void {
  const connection = find(id)
  if (!connection) return
  if (outcome === 'stylish') {
    healPulse(id, connection.rank)
  } else if (outcome === 'flat') {
    healPulse(id, Math.ceil(connection.rank / 2))
  } else {
    healPulse(id, Math.floor(connection.rank / 2))
  }
}

// Manual 1071–1079: at 0 Pulse and losing more, they avoid destruction.
export function resolveAvoidDestruction(id: string, outcome: DestroyOutcome): void {
  const connection = find(id)
  if (!connection) return
  if (outcome === 'stylish') {
    healPulse(id, 1)
  } else if (outcome === 'flat') {
    healPulse(id, 1)
    loseRush(1)
  } else if (outcome === 'failure') {
    connection.outOfAction = true
  } else {
    connection.dead = true
    connection.outOfAction = true
  }
}
