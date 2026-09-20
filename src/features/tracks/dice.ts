export function rollDie(sides = 10): number {
  return 1 + Math.floor(Math.random() * sides)
}

export function rollChallengePair(): [number, number] {
  return [rollDie(), rollDie()]
}

export type RollVerdict = 'stylish' | 'flat' | 'failure'

// Manual 934–938: progress counts as the action score against two challenge dice.
export function compareRoll(score: number, dice: [number, number]): RollVerdict {
  const beats = dice.filter((die) => score > die).length
  if (beats === 2) return 'stylish'
  if (beats === 1) return 'flat'
  return 'failure'
}

export const VERDICT_LABEL: Record<RollVerdict, string> = {
  stylish: 'Stylish Success',
  flat: 'Flat Success',
  failure: 'Failure',
}
