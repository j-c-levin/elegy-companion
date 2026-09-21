export function rollActionDie(): number {
  return 1 + Math.floor(Math.random() * 6)
}

export function rollChallengePair(): [number, number] {
  return [1 + Math.floor(Math.random() * 10), 1 + Math.floor(Math.random() * 10)]
}

export type Verdict = 'stylish' | 'flat' | 'failure'

export function compareRoll(score: number, dice: [number, number]): Verdict {
  const beats = dice.filter((die) => score > die).length
  if (beats === 2) return 'stylish'
  if (beats === 1) return 'flat'
  return 'failure'
}

export function isChallengeMatch([a, b]: [number, number]): boolean {
  return a === b
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  stylish: 'Stylish Success',
  flat: 'Flat Success',
  failure: 'Failure',
}
