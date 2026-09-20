import { ref } from 'vue'

import { readJson, writeJson } from '@/store'

const ROLLS_STORAGE_NAME = 'rolls'
const ROLLS_VERSION = 1

interface RollsLocalData {
  version: number
  nextRollBonus: number
}

function loadNextRollBonus(): number {
  const raw = readJson<Partial<RollsLocalData>>(ROLLS_STORAGE_NAME)
  if (raw?.version === ROLLS_VERSION && typeof raw.nextRollBonus === 'number') {
    return raw.nextRollBonus
  }
  return 0
}

export const nextRollBonus = ref(loadNextRollBonus())

export function setNextRollBonus(value: number): void {
  nextRollBonus.value = value
  writeJson(ROLLS_STORAGE_NAME, {
    version: ROLLS_VERSION,
    nextRollBonus: value,
  } satisfies RollsLocalData)
}

export function addNextRollBonus(amount: number): void {
  setNextRollBonus(nextRollBonus.value + amount)
}

export function consumeNextRollBonus(): number {
  const value = nextRollBonus.value
  if (value !== 0) setNextRollBonus(0)
  return value
}
