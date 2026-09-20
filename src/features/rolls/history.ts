import { ref } from 'vue'

import { makeId, type AttributeKey } from '@/store'

import type { Verdict } from './engine'

export interface RollHistoryEntry {
  id: string
  at: number
  action: string
  attribute: AttributeKey
  parts: string
  score: number
  cooledFrom?: number
  challenge: [number, number]
  verdict: Verdict
  match: boolean
  matchRoll?: { table: string; die: number; text: string }
}

const HISTORY_LIMIT = 20

export const rollHistory = ref<RollHistoryEntry[]>([])

export function recordRoll(entry: Omit<RollHistoryEntry, 'id' | 'at'>): RollHistoryEntry {
  const full: RollHistoryEntry = { ...entry, id: makeId(), at: Date.now() }
  rollHistory.value.unshift(full)
  if (rollHistory.value.length > HISTORY_LIMIT) {
    rollHistory.value.length = HISTORY_LIMIT
  }
  return full
}

export function patchRoll(id: string, patch: Partial<Omit<RollHistoryEntry, 'id'>>): void {
  const index = rollHistory.value.findIndex((entry) => entry.id === id)
  if (index === -1) return
  rollHistory.value[index] = { ...rollHistory.value[index], ...patch }
}
