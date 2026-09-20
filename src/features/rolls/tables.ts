import matchRaw from '@/data/match-tables.json'
import priceRaw from '@/data/pay-the-price.json'
import type { MeterKey } from '@/store'

import type { MatchTableId, TableRow } from './engine'

export type PriceCost = MeterKey | 'pulse' | 'standing' | 'reroll' | 'twice'

export interface PriceRow extends TableRow {
  cost: PriceCost | null
}

export interface MatchTable {
  id: MatchTableId
  title: string
  subtitle: string
  rows: TableRow[]
}

const PRICE_COSTS: PriceCost[] = ['rush', 'clarity', 'blood', 'health', 'pulse', 'standing', 'reroll', 'twice']

function parseRows(value: unknown): TableRow[] {
  if (!Array.isArray(value)) return []
  const rows: TableRow[] = []
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue
    const { range, text } = item as { range?: unknown; text?: unknown }
    if (!Array.isArray(range) || range.length !== 2) continue
    const [min, max] = range as [unknown, unknown]
    if (typeof min !== 'number' || typeof max !== 'number' || typeof text !== 'string') continue
    rows.push({ range: [min, max], text })
  }
  return rows
}

function parsePriceRows(value: unknown): PriceRow[] {
  if (!Array.isArray(value)) return []
  const rows: PriceRow[] = []
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue
    const { range, text, cost } = item as { range?: unknown; text?: unknown; cost?: unknown }
    if (!Array.isArray(range) || range.length !== 2) continue
    const [min, max] = range as [unknown, unknown]
    if (typeof min !== 'number' || typeof max !== 'number' || typeof text !== 'string') continue
    const validCost =
      typeof cost === 'string' && PRICE_COSTS.includes(cost as PriceCost)
        ? (cost as PriceCost)
        : null
    rows.push({ range: [min, max], text, cost: validCost })
  }
  return rows
}

export const PAY_THE_PRICE = {
  title: typeof priceRaw.title === 'string' ? priceRaw.title : 'Pay the Price',
  rows: parsePriceRows(priceRaw.rows),
}

const MATCH_TABLE_IDS: MatchTableId[] = ['twist', 'misfortune', 'impulse']

export const MATCH_TABLES: MatchTable[] = (
  Array.isArray(matchRaw.tables) ? matchRaw.tables : []
)
  .map((value) => {
    const table = (typeof value === 'object' && value !== null ? value : {}) as {
      id?: unknown
      title?: unknown
      subtitle?: unknown
      rows?: unknown
    }
    const id = typeof table.id === 'string' ? table.id : ''
    return {
      id: id as MatchTableId,
      title: typeof table.title === 'string' ? table.title : '',
      subtitle: typeof table.subtitle === 'string' ? table.subtitle : '',
      rows: parseRows(table.rows),
    }
  })
  .filter(
    (table) =>
      MATCH_TABLE_IDS.includes(table.id) && table.rows.length > 0,
  )

export function matchTable(id: MatchTableId): MatchTable | undefined {
  return MATCH_TABLES.find((table) => table.id === id)
}
