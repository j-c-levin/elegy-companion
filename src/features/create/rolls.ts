import { getTable, rollTable, type OracleResult } from '@/features/oracles/roll'

export interface RollInspiration {
  tableId: string
  tableTitle: string
  rollLabel: string
  text: string
}

function flatten(result: OracleResult, depth: number): string {
  const segments = result.parts.map((part) => {
    if (part.kind === 'text') return part.text
    if (depth >= 3) return part.label
    const table = getTable(part.table)
    if (!table) return part.label
    return flatten(rollTable(table).result, depth + 1)
  })
  const text = segments.join(' ').replace(/\s+/g, ' ').trim()
  if (!result.subResults?.length) return text
  const subs = result.subResults.map((sub) => flatten(sub, depth + 1)).join(' / ')
  return `${text} — ${subs}`
}

export function rollFor(tableId: string): RollInspiration | null {
  const table = getTable(tableId)
  if (!table) return null
  const { result } = rollTable(table)
  return {
    tableId,
    tableTitle: table.title,
    rollLabel: result.rollLabel,
    text: flatten(result, 0),
  }
}
