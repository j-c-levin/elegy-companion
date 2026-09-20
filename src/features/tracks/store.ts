import { reactive, watch } from 'vue'

import { game, makeId, readJson, updateGame, writeJson } from '@/store'

import {
  PROGRESS_TICKS_PER_MARK,
  TOTAL_TICKS,
  XP_PER_RANK,
  clampRank,
  pulseMax,
  type MissionStep,
  type Rank,
  type Track,
  type TrackKind,
} from './types'

const STORAGE_NAME = 'progress-tracks'
const STORAGE_VERSION = 1

interface StoredTracks {
  version: number
  tracks: unknown[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function coerceTrack(raw: unknown): Track | null {
  if (!isRecord(raw) || typeof raw.id !== 'string') return null
  const kind = raw.kind
  if (kind !== 'mission' && kind !== 'connection' && kind !== 'combat') return null
  const rank = clampRank(typeof raw.rank === 'number' ? raw.rank : 1)
  const steps: MissionStep[] = Array.isArray(raw.steps)
    ? raw.steps
        .filter(
          (step): step is { id: string; text: string; done?: unknown } =>
            isRecord(step) && typeof step.id === 'string' && typeof step.text === 'string',
        )
        .map((step) => ({ id: step.id, text: step.text, done: step.done === true }))
    : []
  const pulse = typeof raw.pulse === 'number' && Number.isFinite(raw.pulse) ? raw.pulse : null
  const track: Track = {
    id: raw.id,
    kind,
    title: typeof raw.title === 'string' ? raw.title : 'Untitled',
    rank,
    ticks: Math.min(TOTAL_TICKS, Math.max(0, Number(raw.ticks) || 0)),
    archived: raw.archived === true,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    steps,
    sealed: raw.sealed === true,
    pulse,
    bloodiedByYou: raw.bloodiedByYou === true,
    bloodiedByThem: raw.bloodiedByThem === true,
    outOfAction: raw.outOfAction === true,
    dead: raw.dead === true,
    hasTrack: raw.hasTrack !== false,
  }
  return track
}

let refusePersist = false

function load(): Track[] {
  const stored = readJson<StoredTracks>(STORAGE_NAME)
  if (!stored || !Array.isArray(stored.tracks)) return []
  if (typeof stored.version === 'number' && stored.version > STORAGE_VERSION) {
    console.warn(`[elegy] stored tracks are version ${stored.version}; ignoring newer data`)
    refusePersist = true
    return []
  }
  return stored.tracks.map(coerceTrack).filter((track): track is Track => track !== null)
}

const state = reactive<{ tracks: Track[] }>({ tracks: load() })

watch(
  () => state.tracks,
  () => {
    if (refusePersist) {
      console.warn('[elegy] refusing to persist tracks: stored data is from a newer version')
      return
    }
    writeJson(STORAGE_NAME, { version: STORAGE_VERSION, tracks: state.tracks })
  },
  { deep: true },
)

function findTrack(id: string): Track | undefined {
  return state.tracks.find((track) => track.id === id)
}

export function tracksByKind(kind: TrackKind): Track[] {
  return state.tracks.filter((track) => track.kind === kind && !track.archived)
}

export function archivedTracks(): Track[] {
  return state.tracks.filter((track) => track.archived)
}

export function addTrack(
  kind: TrackKind,
  title: string,
  rank: Rank,
  notes = '',
  hasTrack = true,
): Track {
  const track: Track = {
    id: makeId(),
    kind,
    title: title.trim() || 'Untitled',
    rank,
    ticks: 0,
    archived: false,
    createdAt: Date.now(),
    notes,
    steps: [],
    sealed: false,
    pulse: kind === 'connection' ? rank + 2 : null,
    bloodiedByYou: false,
    bloodiedByThem: false,
    outOfAction: false,
    dead: false,
    hasTrack: kind === 'combat' ? hasTrack : true,
  }
  state.tracks.push(track)
  return track
}

export function removeTrack(id: string): void {
  const index = state.tracks.findIndex((track) => track.id === id)
  if (index !== -1) state.tracks.splice(index, 1)
}

export function renameTrack(id: string, title: string): void {
  const track = findTrack(id)
  if (track && title.trim()) track.title = title.trim()
}

export function setTrackRank(id: string, rank: number): void {
  const track = findTrack(id)
  if (!track) return
  track.rank = clampRank(rank)
  if (track.kind === 'connection' && track.pulse !== null) {
    track.pulse = Math.min(track.pulse, pulseMax(track.rank))
  }
}

export function setTrackNotes(id: string, notes: string): void {
  const track = findTrack(id)
  if (track) track.notes = notes
}

export function setTrackArchived(id: string, archived: boolean): void {
  const track = findTrack(id)
  if (track) track.archived = archived
}

export function setHasTrack(id: string, hasTrack: boolean): void {
  const track = findTrack(id)
  if (!track || track.kind !== 'combat') return
  track.hasTrack = hasTrack
}

export function setTicks(id: string, ticks: number): void {
  const track = findTrack(id)
  if (track) track.ticks = Math.min(TOTAL_TICKS, Math.max(0, Math.round(ticks)))
}

export function markProgress(id: string): void {
  const track = findTrack(id)
  if (!track || track.ticks >= TOTAL_TICKS) return
  track.ticks = Math.min(TOTAL_TICKS, track.ticks + PROGRESS_TICKS_PER_MARK[track.rank])
}

export function undoProgress(id: string): void {
  const track = findTrack(id)
  if (!track) return
  track.ticks = Math.max(0, track.ticks - PROGRESS_TICKS_PER_MARK[track.rank])
}

export function clearBoxes(id: string, boxes: number): void {
  const track = findTrack(id)
  if (!track) return
  track.ticks = Math.max(0, track.ticks - boxes * 4)
}

export function addStep(id: string, text: string): void {
  const track = findTrack(id)
  if (!track || !text.trim()) return
  track.steps.push({ id: makeId(), text: text.trim(), done: false })
}

export function toggleStep(id: string, stepId: string): void {
  const step = findTrack(id)?.steps.find((entry) => entry.id === stepId)
  if (step) step.done = !step.done
}

export function removeStep(id: string, stepId: string): void {
  const track = findTrack(id)
  if (!track) return
  track.steps = track.steps.filter((step) => step.id !== stepId)
}

// Manual 1132–1140: completing a Mission grants XP per its Rank.
export function grantXp(amount: number): void {
  updateGame((draft) => {
    draft.xp += amount
  })
}

export function grantMissionXp(id: string): number {
  const track = findTrack(id)
  if (!track) return 0
  const xp = XP_PER_RANK[track.rank]
  grantXp(xp)
  return xp
}

export function loseClarity(amount = 1): void {
  updateGame((draft) => {
    draft.meters.clarity.value = Math.max(0, draft.meters.clarity.value - amount)
  })
}

export function loseRush(amount = 1): void {
  updateGame((draft) => {
    draft.meters.rush.value = Math.max(0, draft.meters.rush.value - amount)
  })
}

// Manual 1011–1019: filling a Connection's track Seals it and grants XP per Rank.
export function sealConnection(id: string): number {
  const track = findTrack(id)
  if (!track || track.sealed) return 0
  track.sealed = true
  const xp = XP_PER_RANK[track.rank]
  grantXp(xp)
  return xp
}

// Manual 1017–1019: progress on a Sealed Connection becomes +2 Rush.
export function grantSealedProgress(): void {
  updateGame((draft) => {
    draft.meters.rush.value = Math.min(draft.meters.rush.max, draft.meters.rush.value + 2)
  })
}

export function applyPulseDamage(id: string, amount: number): void {
  const track = findTrack(id)
  if (!track || track.pulse === null) return
  track.pulse = Math.max(0, track.pulse - amount)
}

export function applyPulseHeal(id: string, amount: number): void {
  const track = findTrack(id)
  if (!track || track.pulse === null) return
  track.pulse = Math.min(pulseMax(track.rank), track.pulse + amount)
  if (track.pulse > 0) track.outOfAction = false
}

// Manual 1063–1066: give blood restores Pulse 1-3, costs the same Blood,
// and Bloodies the Connection by you.
export function giveBlood(id: string, amount: number): void {
  const track = findTrack(id)
  if (!track || track.pulse === null) return
  updateGame((draft) => {
    draft.meters.blood.value = Math.max(0, draft.meters.blood.value - amount)
  })
  track.bloodiedByYou = true
  applyPulseHeal(id, amount)
}

export function slumberHeal(id: string): void {
  const track = findTrack(id)
  if (!track) return
  applyPulseHeal(id, track.rank)
}

export type HealOutcome = 'stylish' | 'flat' | 'failure'

// Manual 1067–1078: letting a Connection heal is rolled with dice + Rank.
export function letThemHeal(id: string, outcome: HealOutcome): void {
  const track = findTrack(id)
  if (!track) return
  if (outcome === 'stylish') {
    applyPulseHeal(id, track.rank)
  } else if (outcome === 'flat') {
    applyPulseHeal(id, Math.ceil(track.rank / 2))
  } else {
    applyPulseHeal(id, Math.floor(track.rank / 2))
  }
}

export type DestroyOutcome = 'stylish' | 'flat' | 'failure' | 'match'

// Manual 1071–1079: at 0 Pulse and losing more, they avoid destruction.
export function resolveAvoidDestruction(id: string, outcome: DestroyOutcome): void {
  const track = findTrack(id)
  if (!track) return
  if (outcome === 'stylish') {
    applyPulseHeal(id, 1)
  } else if (outcome === 'flat') {
    applyPulseHeal(id, 1)
    updateGame((draft) => {
      draft.meters.rush.value = Math.max(0, draft.meters.rush.value - 1)
    })
  } else if (outcome === 'failure') {
    track.outOfAction = true
  } else {
    track.dead = true
    track.outOfAction = true
  }
}

export function setBloodied(id: string, byYou: boolean, byThem: boolean): void {
  const track = findTrack(id)
  if (!track) return
  track.bloodiedByYou = byYou
  track.bloodiedByThem = byThem
}

export interface AttackInput {
  weapons: boolean
  supportRank: Rank | null
}

// Manual 1095–1107: one mark per hit, weapons/fangs mark once more,
// Connection support multiplies progress by their Rank.
export function attackTicks(rank: Rank, input: AttackInput): number {
  const marks = (1 + (input.weapons ? 1 : 0)) * (input.supportRank ?? 1)
  return PROGRESS_TICKS_PER_MARK[rank] * marks
}

export function applyAttack(id: string, input: AttackInput): void {
  const track = findTrack(id)
  if (!track) return
  track.ticks = Math.min(TOTAL_TICKS, track.ticks + attackTicks(track.rank, input))
}

// Manual 1108–1112: a downed adversary grants Rush equal to their Rank.
export function collectCombatRush(id: string): number {
  const track = findTrack(id)
  if (!track) return 0
  const rush = track.rank
  updateGame((draft) => {
    draft.meters.rush.value = Math.min(draft.meters.rush.max, draft.meters.rush.value + rush)
  })
  return rush
}

// Manual 955–958: recommit — take the lower challenge die, clear that many
// boxes, raise Rank by 1 unless already 5.
export function recommitMission(id: string, lowerDie: number): void {
  const track = findTrack(id)
  if (!track) return
  clearBoxes(id, lowerDie)
  if (track.rank < 5) setTrackRank(id, track.rank + 1)
}

export function trackById(id: string): Track | undefined {
  return findTrack(id)
}

export function readCharacterXp(): number {
  return game.xp
}
