import { addListItem, game, makeId, readJson, updateGame, writeJson } from '@/store'

const STORAGE_NAME = 'night-log'
const MAX_ENTRIES = 100

export type NightOutcome = 'slumber' | 'stayed-awake'

export interface NightLogEntry {
  id: string
  at: string
  outcome: NightOutcome
  bloodBefore: number
  bloodAfter: number
  bloodLost: number
  clamped: boolean
  rushDelta: number
  standingQueued: boolean
  looseEnd: string
}

export interface NightLogStorage {
  version: 1
  entries: NightLogEntry[]
  slumberCount: number
  awakeCount: number
  totalBloodLost: number
}

export interface NightResult {
  outcome: NightOutcome
  bloodBefore: number
  bloodAfter: number
  bloodLost: number
  clamped: boolean
  rushBefore: number
  rushAfter: number
  standingQueued: boolean
  looseEnd: string
}

function emptyLog(): NightLogStorage {
  return { version: 1, entries: [], slumberCount: 0, awakeCount: 0, totalBloodLost: 0 }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNightOutcome(value: unknown): value is NightOutcome {
  return value === 'slumber' || value === 'stayed-awake'
}

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function coerceEntry(raw: unknown): NightLogEntry | null {
  if (!isRecord(raw)) return null
  if (typeof raw.id !== 'string' || typeof raw.at !== 'string') return null
  if (!isNightOutcome(raw.outcome)) return null
  if (
    !finiteNumber(raw.bloodBefore) ||
    !finiteNumber(raw.bloodAfter) ||
    !finiteNumber(raw.bloodLost) ||
    !finiteNumber(raw.rushDelta)
  ) {
    return null
  }
  if (typeof raw.clamped !== 'boolean' || typeof raw.standingQueued !== 'boolean') return null
  if (typeof raw.looseEnd !== 'string') return null
  return {
    id: raw.id,
    at: raw.at,
    outcome: raw.outcome,
    bloodBefore: raw.bloodBefore,
    bloodAfter: raw.bloodAfter,
    bloodLost: raw.bloodLost,
    clamped: raw.clamped,
    rushDelta: raw.rushDelta,
    standingQueued: raw.standingQueued,
    looseEnd: raw.looseEnd,
  }
}

export function loadLog(): NightLogStorage {
  const raw = readJson<Partial<NightLogStorage>>(STORAGE_NAME)
  if (!raw || raw.version !== 1 || !Array.isArray(raw.entries)) return emptyLog()
  const entries = raw.entries
    .map(coerceEntry)
    .filter((entry): entry is NightLogEntry => entry !== null)
    .slice(0, MAX_ENTRIES)
  return {
    version: 1,
    entries,
    slumberCount: finiteNumber(raw.slumberCount) ? raw.slumberCount : 0,
    awakeCount: finiteNumber(raw.awakeCount) ? raw.awakeCount : 0,
    totalBloodLost: finiteNumber(raw.totalBloodLost) ? raw.totalBloodLost : 0,
  }
}

function record(result: NightResult): void {
  const log = loadLog()
  const entry: NightLogEntry = {
    id: makeId(),
    at: new Date().toISOString(),
    outcome: result.outcome,
    bloodBefore: result.bloodBefore,
    bloodAfter: result.bloodAfter,
    bloodLost: result.bloodLost,
    clamped: result.clamped,
    rushDelta: result.rushAfter - result.rushBefore,
    standingQueued: result.standingQueued,
    looseEnd: result.looseEnd,
  }
  log.entries.unshift(entry)
  log.entries = log.entries.slice(0, MAX_ENTRIES)
  if (result.outcome === 'slumber') log.slumberCount += 1
  else log.awakeCount += 1
  log.totalBloodLost += result.bloodLost
  writeJson(STORAGE_NAME, log)
}

export function slumber(looseEnd: string, standingQueued: boolean): NightResult | null {
  const text = looseEnd.trim()
  if (!text) return null
  const bloodBefore = game.meters.blood.value
  const clamped = bloodBefore <= 0
  const bloodAfter = clamped ? 0 : bloodBefore - 1
  const rush = game.meters.rush
  const rushAfter = Math.min(rush.max, rush.value + 1)
  updateGame((draft) => {
    if (draft.meters.blood.value > 0) draft.meters.blood.value -= 1
    draft.meters.rush.value = Math.min(draft.meters.rush.max, draft.meters.rush.value + 1)
    addListItem(draft, 'loose-ends', text)
  })
  const result: NightResult = {
    outcome: 'slumber',
    bloodBefore,
    bloodAfter,
    bloodLost: bloodBefore - bloodAfter,
    clamped,
    rushBefore: rush.value,
    rushAfter,
    standingQueued,
    looseEnd: text,
  }
  record(result)
  return result
}

export function stayAwake(spendRush: boolean): NightResult {
  const starving = game.activeConditions.includes('Starving')
  const mitigate = spendRush && !starving && game.meters.rush.value > 0
  const cost = mitigate ? 1 : 2
  const bloodBefore = game.meters.blood.value
  const bloodAfter = Math.max(0, bloodBefore - cost)
  const rushBefore = game.meters.rush.value
  const rushAfter = mitigate ? rushBefore - 1 : rushBefore
  updateGame((draft) => {
    draft.meters.blood.value -= Math.min(cost, draft.meters.blood.value)
    if (mitigate) draft.meters.rush.value = Math.max(0, draft.meters.rush.value - 1)
  })
  const result: NightResult = {
    outcome: 'stayed-awake',
    bloodBefore,
    bloodAfter,
    bloodLost: bloodBefore - bloodAfter,
    clamped: bloodBefore <= 0,
    rushBefore,
    rushAfter,
    standingQueued: false,
    looseEnd: '',
  }
  record(result)
  return result
}

export function clearLog(): void {
  writeJson(STORAGE_NAME, emptyLog())
}
