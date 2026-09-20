export const TRACK_BOXES = 10
export const TICKS_PER_BOX = 4
export const TOTAL_TICKS = TRACK_BOXES * TICKS_PER_BOX

export type TrackKind = 'mission' | 'connection' | 'combat'

export type Rank = 1 | 2 | 3 | 4 | 5

export const RANKS: readonly Rank[] = [1, 2, 3, 4, 5]

// Manual 924–927 + mission rank table 942–950: a track has ten boxes of four
// ticks (ticks appear at 709–710); filling takes 3-4/5/10/20/40 marks for
// Ranks 1–5, so one mark is worth 12/8/4/2/1 ticks.
export const PROGRESS_TICKS_PER_MARK: Record<Rank, number> = {
  1: 12,
  2: 8,
  3: 4,
  4: 2,
  5: 1,
}

// Manual 1136–1140.
export const XP_PER_RANK: Record<Rank, number> = { 1: 1, 2: 2, 3: 5, 4: 10, 5: 20 }

export interface MissionStep {
  id: string
  text: string
  done: boolean
}

export interface Track {
  id: string
  kind: TrackKind
  title: string
  rank: Rank
  ticks: number
  archived: boolean
  createdAt: number
  notes: string
  steps: MissionStep[]
  sealed: boolean
  pulse: number | null
  bloodiedByYou: boolean
  bloodiedByThem: boolean
  outOfAction: boolean
  dead: boolean
  hasTrack: boolean
}

export const KIND_LABEL: Record<TrackKind, string> = {
  mission: 'Mission',
  connection: 'Connection',
  combat: 'Adversary',
}

export function progressScore(ticks: number): number {
  return Math.floor(ticks / TICKS_PER_BOX)
}

export function pulseMax(rank: Rank): number {
  return rank + 2
}

export function clampRank(value: number): Rank {
  return (Math.min(5, Math.max(1, Math.round(value))) || 1) as Rank
}
