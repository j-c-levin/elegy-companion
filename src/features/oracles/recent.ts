import { ref } from 'vue'
import type { OracleResult } from './roll'
import { summarize } from './roll'

export interface RecentRoll {
  id: number
  tableId: string
  tableTitle: string
  summary: string
  at: number
}

const recent = ref<RecentRoll[]>([])
let nextId = 1

export function recordRoll(result: OracleResult): void {
  recent.value.unshift({
    id: nextId++,
    tableId: result.tableId,
    tableTitle: result.tableTitle,
    summary: summarize(result),
    at: Date.now()
  })
  if (recent.value.length > 10) recent.value.length = 10
}

export function recentRolls(): RecentRoll[] {
  return recent.value
}
