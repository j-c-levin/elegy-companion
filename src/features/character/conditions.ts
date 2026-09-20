import { BASE_RUSH, MAX_RUSH } from '@/store'

export type ConditionTrack = 'health' | 'clarity' | 'blood' | 'conscience' | 'standing'

export type ConditionSeverity = 'mild' | 'severe' | 'permanent'

export type ResourceMeter = 'health' | 'clarity' | 'blood'

export interface Condition {
  key: string
  track: ConditionTrack
  order: 1 | 2 | 3
  severity: ConditionSeverity
  maxRush: number
  soul: number
  actionPenalty: number
  burden?: string
  text: string
  ref: string
}

export const CONDITIONS: readonly Condition[] = [
  {
    key: 'Wounded',
    track: 'health',
    order: 1,
    severity: 'mild',
    maxRush: -1,
    soul: 0,
    actionPenalty: 0,
    text: 'A fresh wound that slows you down. Reduce max Rush by 1 until you regenerate. When you do, erase the condition.',
    ref: 'manual 700–703',
  },
  {
    key: 'Mangled',
    track: 'health',
    order: 2,
    severity: 'severe',
    maxRush: -1,
    soul: 0,
    actionPenalty: 0,
    text: 'The wound worsens, and will take longer to heal. Reduce max Rush by 1. Create a progress track: when you slumber through the day, roll with Body (disregard the standard action roll results). On a Stylish Success, fill two boxes; on a Flat one, fill one; on a Failure, mark two ticks. When the progress track is complete, the flesh is restored. Erase the condition.',
    ref: 'manual 704–712',
  },
  {
    key: 'Scarred',
    track: 'health',
    order: 3,
    severity: 'permanent',
    maxRush: 0,
    soul: 0,
    actionPenalty: 0,
    burden: 'Scarred',
    text: 'The damage runs so deep it marks you permanently, aching even after the wound heals. Acquire the burden Scarred (its starting ability decreases your base Rush by 1, or max Rush if base is already 0).',
    ref: 'manual 713–715, 3962–3991',
  },
  {
    key: 'In Shock',
    track: 'clarity',
    order: 1,
    severity: 'mild',
    maxRush: -1,
    soul: 0,
    actionPenalty: 0,
    text: 'The experience leaves you shaken and unfocused. Reduce max Rush by 1 until you respite to restore Clarity. When you do, erase the condition.',
    ref: 'manual 728–732',
  },
  {
    key: 'Tormented',
    track: 'clarity',
    order: 2,
    severity: 'severe',
    maxRush: -1,
    soul: 0,
    actionPenalty: 0,
    text: 'The shock triggers a long-term, vivid, recurring vision of a dreaded event coming to pass. Envision that dark future, commit to a Mission of Rank 4 to prevent it, and mark the condition. Reduce max Rush by 1. When you fulfill this Mission, erase the condition.',
    ref: 'manual 733–740',
  },
  {
    key: 'Traumatized',
    track: 'clarity',
    order: 3,
    severity: 'permanent',
    maxRush: 0,
    soul: 0,
    actionPenalty: 0,
    burden: 'Traumatized',
    text: 'These events have carved themselves into your mind permanently, and this scar will never fade from your psyche. Acquire the burden Traumatized (its starting ability decreases your base Rush by 1, or max Rush if base is already 0).',
    ref: 'manual 741–744, 3997–4027',
  },
  {
    key: 'Starving',
    track: 'blood',
    order: 1,
    severity: 'mild',
    maxRush: 0,
    soul: 0,
    actionPenalty: -1,
    text: 'The hunger sharpens into desperation, clouding your judgment. Subtract 1 from every action roll (except if hunting) until you feed. When you do, erase the condition.',
    ref: 'manual 809–813',
  },
  {
    key: 'Enraged',
    track: 'blood',
    order: 2,
    severity: 'severe',
    maxRush: 0,
    soul: 0,
    actionPenalty: 0,
    text: 'Instinct completely overwhelms your thoughts. Create a progress track. While Enraged, you can only act with violence. Mark progress for each action roll result. Stylish Success: fill three boxes; Flat Success: fill two; Failure: fill one. When you fill the track, erase the condition.',
    ref: 'manual 814–822',
  },
  {
    key: 'Torpid',
    track: 'blood',
    order: 3,
    severity: 'permanent',
    maxRush: 0,
    soul: 0,
    actionPenalty: 0,
    burden: 'Torpid',
    text: 'The hunger drains you beyond repair, and your animating power is permanently weakened. Acquire the burden Torpid (its starting ability decreases your base Rush by 1, or max Rush if base is already 0).',
    ref: 'manual 823–825, 3997–4015',
  },
  {
    key: 'Detached',
    track: 'conscience',
    order: 1,
    severity: 'mild',
    maxRush: 0,
    soul: -1,
    actionPenalty: 0,
    text: 'You are more willing to cross your moral boundaries; until the end of next night, treat your Soul as 1 point lower. When next night ends, you recover: erase the condition.',
    ref: 'manual 866–869',
  },
  {
    key: 'Penitent',
    track: 'conscience',
    order: 2,
    severity: 'severe',
    maxRush: -1,
    soul: 0,
    actionPenalty: 0,
    text: 'You are struck by intense guilt and a desire for redemption. Commit to a Mission of Rank 4 to repent in favor of a greater good. Until you fulfill it, reduce your max Rush by 1. When you do, you recover: erase the condition.',
    ref: 'manual 870–874',
  },
  {
    key: 'Blighted',
    track: 'conscience',
    order: 3,
    severity: 'permanent',
    maxRush: 0,
    soul: 0,
    actionPenalty: 0,
    burden: 'a Burden Aspect of your choice (manual 4033+)',
    text: 'Your human essence falters, and vampirism tightens its grip. Mark the condition Blighted, then pick a Burden Aspect representing the weakness you develop.',
    ref: 'manual 876–879, 4033–4034',
  },
  {
    key: 'Cautioned',
    track: 'standing',
    order: 1,
    severity: 'mild',
    maxRush: -1,
    soul: 0,
    actionPenalty: 0,
    text: 'You are told to step in line. Reduce your max Rush by 1 until next time you slumber. When you do, you recover: erase the condition.',
    ref: 'manual 888–890',
  },
  {
    key: 'Discredited',
    track: 'standing',
    order: 2,
    severity: 'severe',
    maxRush: -1,
    soul: 0,
    actionPenalty: 0,
    text: 'Your standing has eroded and you are expected to prove your worth. Reduce max Rush by 1, then create a progress track of Rank 3. When you deliberately act in service of that authority and get any Success, mark progress. When the progress track is complete, your respect is restored. Erase the condition.',
    ref: 'manual 891–897',
  },
  {
    key: 'Branded',
    track: 'standing',
    order: 3,
    severity: 'permanent',
    maxRush: 0,
    soul: 0,
    actionPenalty: 0,
    burden: 'Branded',
    text: 'Your repeated transgressions are brutally punished with a permanent symbol of betrayal. You awake not to a written warning, but to a group of vampires in service of your authority, who then personally brands you with fire. Acquire the burden Branded (its starting ability decreases your base Rush by 1, or max Rush if base is already 0).',
    ref: 'manual 898–903, 3962–3969',
  },
]

export const CONDITION_TRACKS: readonly ConditionTrack[] = [
  'health',
  'clarity',
  'blood',
  'conscience',
  'standing',
]

export const TRACK_LABEL: Record<ConditionTrack, string> = {
  health: 'Health',
  clarity: 'Clarity',
  blood: 'Blood',
  conscience: 'Conscience',
  standing: 'Standing',
}

export const TRACK_END_TEXT: Record<ConditionTrack, string> = {
  health: 'Your corpse crumbles.',
  clarity: 'Your psyche falls apart; you descend into confusion.',
  blood: 'Your corpse loses its animating power and is destroyed when the sun rises.',
  conscience: 'You are completely dominated by your instincts.',
  standing: 'You are captured by dusk, forced into an open space, and left to die when the sun comes up.',
}

export const THE_END_TEXT =
  'When your story ends, in your last moments, the memory of a meaningful event from your life crosses your mind for the first and only time since your death: Ask the Oracle for a Theme and envision what you remember.'

export interface MitigationInfo {
  conditionKey: string
  caveat: string
  ref: string
}

export const MITIGATION: Record<ResourceMeter, MitigationInfo> = {
  health: {
    conditionKey: 'Wounded',
    caveat: 'only if you can safely stay put for a couple of minutes',
    ref: 'manual 708–712',
  },
  clarity: {
    conditionKey: 'In Shock',
    caveat: 'only if you can safely distract yourself for a few minutes',
    ref: 'manual 741–744',
  },
  blood: {
    conditionKey: 'Starving',
    caveat: 'only if you can safely remain still for a few seconds',
    ref: 'manual 779–783',
  },
}

export function conditionByKey(key: string): Condition | undefined {
  return CONDITIONS.find((c) => c.key === key)
}

export function conditionsForTrack(track: ConditionTrack): Condition[] {
  return CONDITIONS.filter((c) => c.track === track)
}

export function firstUnmarkedForTrack(
  track: ConditionTrack,
  active: readonly string[],
): Condition | undefined {
  return conditionsForTrack(track).find((c) => !active.includes(c.key))
}

export function trackIsComplete(track: ConditionTrack, active: readonly string[]): boolean {
  return conditionsForTrack(track).every((c) => active.includes(c.key))
}

export function maxRushModifier(active: readonly string[]): number {
  return active.reduce((sum, key) => sum + (conditionByKey(key)?.maxRush ?? 0), 0)
}

export function soulModifier(active: readonly string[]): number {
  return active.reduce((sum, key) => sum + (conditionByKey(key)?.soul ?? 0), 0)
}

export function actionPenalty(active: readonly string[]): number {
  return active.reduce((sum, key) => sum + (conditionByKey(key)?.actionPenalty ?? 0), 0)
}

export function burdenCount(active: readonly string[]): number {
  return active.filter((key) => conditionByKey(key)?.severity === 'permanent').length
}

export function rushCaps(active: readonly string[]): { base: number; max: number } {
  const burdens = burdenCount(active)
  const base = Math.max(0, BASE_RUSH - burdens)
  const overflow = burdens - (BASE_RUSH - base)
  const max = Math.max(0, MAX_RUSH + maxRushModifier(active) - overflow)
  return { base, max }
}
