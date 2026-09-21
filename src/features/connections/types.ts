export type Rank = 1 | 2 | 3 | 4 | 5

export const RANKS: readonly Rank[] = [1, 2, 3, 4, 5]

export function pulseMax(rank: Rank): number {
  return rank + 2
}

// Manual 1136–1140: sealing a Connection grants XP per its Rank.
export const XP_PER_RANK: Record<Rank, number> = { 1: 1, 2: 2, 3: 5, 4: 10, 5: 20 }

// Manual 924–927 + 942–950: filling a ten-box track takes 3–4 / 5 / 10 / 20 / 40 marks.
export const MARKS_TO_FILL: Record<Rank, string> = {
  1: '3–4',
  2: '5',
  3: '10',
  4: '20',
  5: '40',
}

export interface Connection {
  id: string
  name: string
  rank: Rank
  mortal: boolean
  pulse: number
  sealed: boolean
  bloodiedByYou: boolean
  bloodiedByThem: boolean
  boundAgainstWill: boolean
  loyaltyDemand: boolean
  outOfAction: boolean
  dead: boolean
  notes: string
  trackNote: string
  createdAt: number
}

export type TestOutcome = 'stylish' | 'flat' | 'failure'

export type DestroyOutcome = 'stylish' | 'flat' | 'failure' | 'match'

export type HealOutcome = 'stylish' | 'flat' | 'failure'

export function clampRank(value: number): Rank {
  return (Math.min(5, Math.max(1, Math.round(value))) || 1) as Rank
}
