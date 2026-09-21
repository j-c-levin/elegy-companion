export type CreatureType =
  | 'vampire'
  | 'mortal'
  | 'hunter'
  | 'ghost'
  | 'witch'
  | 'werewolf'
  | 'fey'

export const CREATURE_TYPES: readonly CreatureType[] = [
  'vampire',
  'mortal',
  'hunter',
  'ghost',
  'witch',
  'werewolf',
  'fey',
]

export const CREATURE_TYPE_LABELS: Record<CreatureType, string> = {
  vampire: 'Vampire',
  mortal: 'Mortal',
  hunter: 'Hunter',
  ghost: 'Ghost',
  witch: 'Witch',
  werewolf: 'Werewolf',
  fey: 'Fey',
}

export type Rank = 1 | 2 | 3 | 4 | 5

export const RANKS: readonly Rank[] = [1, 2, 3, 4, 5]

// Manual 986-1008 (repeated at 4311-4333): common rank titles per creature type.
export const COMMON_RANKS: Record<CreatureType, Record<Rank, readonly string[]>> = {
  vampire: { 1: ['Newborn'], 2: ['Young'], 3: ['Mature'], 4: ['Elder'], 5: ['Ancient'] },
  mortal: { 1: ['Common Mortal'], 2: ['Gangster', 'Police Agent', 'Lackey'], 3: [], 4: [], 5: [] },
  hunter: { 1: [], 2: ['Vigilante'], 3: ['Holy Hunter', 'Agent'], 4: [], 5: [] },
  ghost: { 1: ['Recent Ghost'], 2: ['Wraith'], 3: [], 4: [], 5: [] },
  witch: { 1: ['Apprentice'], 2: ['Veteran'], 3: ['Arch'], 4: ['Transcended'], 5: [] },
  werewolf: { 1: [], 2: ['Adolescent'], 3: ['Mature'], 4: ['Elder'], 5: [] },
  fey: { 1: [], 2: ['Refugee'], 3: ['Official'], 4: [], 5: ['High'] },
}

// Manual 1008 / 4333: werewolves are one Rank higher when transformed.
export const TRANSFORMED_TYPES: readonly CreatureType[] = ['werewolf']

export function clampRank(value: number): Rank {
  return (Math.min(5, Math.max(1, Math.round(value))) || 1) as Rank
}

export function transformedRank(type: CreatureType, rank: Rank): Rank {
  if (!TRANSFORMED_TYPES.includes(type)) return rank
  return Math.min(5, rank + 1) as Rank
}

// Manual 1060-1062: Pulse equals Rank + 2.
export function pulseMax(rank: Rank): number {
  return rank + 2
}

export interface Npc {
  id: string
  name: string
  type: CreatureType
  rank: Rank
  pulse: number | null
  notes: string
  createdAt: number
}

export function rankLabel(type: CreatureType, rank: Rank): string {
  return COMMON_RANKS[type][rank].join(' / ')
}
