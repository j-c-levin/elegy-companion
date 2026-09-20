import type { AttributeKey, MeterKey } from '@/store'

export type Verdict = 'stylish' | 'flat' | 'failure'

export type MatchTableId = 'twist' | 'misfortune' | 'impulse'

export interface ChallengeDice {
  first: number
  second: number
}

export interface ActionRollResult {
  actionDie: number
  attribute: AttributeKey
  attributeValue: number
  bonuses: number
  actionScore: number
  challenge: ChallengeDice
  beats: [boolean, boolean]
  verdict: Verdict
  match: boolean
}

export const MIN_RUSH = -6

export interface TableRow {
  range: [number, number]
  text: string
}

export function rollDie(sides: number): number {
  return 1 + Math.floor(Math.random() * sides)
}

export function scoreAction(actionDie: number, attributeValue: number, bonuses: number): number {
  return actionDie + attributeValue + bonuses
}

export function judge(
  score: number,
  challenge: ChallengeDice,
): { beats: [boolean, boolean]; verdict: Verdict; match: boolean } {
  const beats: [boolean, boolean] = [score > challenge.first, score > challenge.second]
  const beaten = Number(beats[0]) + Number(beats[1])
  return {
    beats,
    verdict: beaten === 2 ? 'stylish' : beaten === 1 ? 'flat' : 'failure',
    match: challenge.first === challenge.second,
  }
}

export function rollAction(
  attribute: AttributeKey,
  attributeValue: number,
  bonuses: number,
): ActionRollResult {
  const actionDie = rollDie(6)
  const challenge: ChallengeDice = { first: rollDie(10), second: rollDie(10) }
  const actionScore = scoreAction(actionDie, attributeValue, bonuses)
  const { beats, verdict, match } = judge(actionScore, challenge)
  return {
    actionDie,
    attribute,
    attributeValue,
    bonuses,
    actionScore,
    challenge,
    beats,
    verdict,
    match,
  }
}

export function rejudge(
  result: ActionRollResult,
  score: number,
): ActionRollResult {
  const { beats, verdict, match } = judge(score, result.challenge)
  return { ...result, actionScore: score, beats, verdict, match }
}

export function matchTableFor(
  result: Pick<ActionRollResult, 'match' | 'verdict' | 'actionDie'>,
  blood: number,
): MatchTableId | null {
  if (!result.match) return null
  if (result.verdict === 'stylish') return 'twist'
  if (result.verdict === 'failure') {
    return result.actionDie > blood ? 'impulse' : 'misfortune'
  }
  return null
}

export function rollOnTable(rows: TableRow[]): { die: number; row: TableRow } {
  const max = rows.length > 0 ? rows[rows.length - 1].range[1] : 0
  const die = rollDie(max)
  const row = rows.find((r) => die >= r.range[0] && die <= r.range[1]) ?? rows[rows.length - 1]
  return { die, row }
}

export const METER_LABELS: Record<MeterKey, string> = {
  health: 'Health',
  clarity: 'Clarity',
  blood: 'Blood',
  rush: 'Rush',
}

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  body: 'Body',
  mind: 'Mind',
  charm: 'Charm',
  soul: 'Soul',
}

export const VERDICT_LABELS: Record<Verdict, string> = {
  stylish: 'Stylish Success',
  flat: 'Flat Success',
  failure: 'Failure',
}
