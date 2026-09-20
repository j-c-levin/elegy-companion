import type { OracleRow, OracleTable, WeaponColumn, WeaponColumnId } from './types'
import { ORACLE_TABLES_BY_ID } from '@/data/oracles'

export type RollPart =
  | { kind: 'text'; text: string }
  | { kind: 'chain'; label: string; table: string; column?: WeaponColumnId }

export interface OracleResult {
  tableId: string
  tableTitle: string
  rollLabel: string
  answer?: 'Yes' | 'No'
  note?: string
  parts: RollPart[]
  subResults?: OracleResult[]
  factionName?: string
  factionValue?: string
  columnTitle?: string
}

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

function dieLabel(v: number, sides: number): string {
  if (sides === 100 && v === 100) return '00'
  if (sides === 10 && v === 10) return '0'
  return String(v)
}

function maxSides(table: OracleTable): number {
  const m = table.dice.match(/d(\d+)/)
  return m ? parseInt(m[1], 10) : 100
}

export function findRow(table: OracleTable, value: number): OracleRow | undefined {
  return table.rows.find((r) => value >= r.min && value <= r.max)
}

export function randomColumn(columns: WeaponColumn[]): WeaponColumn {
  return columns[rollDie(columns.length) - 1]
}

export interface TableRollOptions {
  column?: WeaponColumnId
}

function buildParts(table: OracleTable, row: OracleRow, cellText?: string): { parts: RollPart[]; subResults?: OracleResult[] } {
  const label = cellText ?? row.label
  const segments = label.split(/\((roll for[^)]*)\)/)
  const chains = row.chained ?? []
  const parts: RollPart[] = []
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (i % 2 === 0) {
      if (seg.trim()) parts.push({ kind: 'text', text: seg.trim() })
    } else {
      const chain = chains[(i - 1) / 2]
      if (chain) {
        parts.push({ kind: 'chain', label: seg.replace(/^roll for /, '').trim(), table: chain.table, column: chain.column })
      } else {
        parts.push({ kind: 'text', text: `(${seg.trim()})` })
      }
    }
  }
  if (row.rollTwice) {
    const sides = maxSides(table)
    const subResults = [rollDie(sides), rollDie(sides)].map((value) => {
      const subRow = findRow(table, value)!
      const sub = buildParts(table, subRow)
      const subResult: OracleResult = {
        tableId: table.id,
        tableTitle: table.title,
        rollLabel: dieLabel(value, sides),
        parts: sub.parts
      }
      if (sub.subResults) subResult.subResults = sub.subResults
      return subResult
    })
    return { parts, subResults }
  }
  return { parts }
}

export function rollTable(table: OracleTable, options: TableRollOptions = {}): { result: OracleResult; row: OracleRow } {
  const sides = maxSides(table)

  if (table.kind === 'weapon') {
    const column = options.column ? table.columns!.find((c) => c.id === options.column)! : randomColumn(table.columns!)
    const value = rollDie(sides)
    const row = findRow(table, value)!
    const cell = row.cells?.[column.id] ?? ''
    const { parts } = buildParts(table, row, cell)
    return {
      result: {
        tableId: table.id,
        tableTitle: table.title,
        rollLabel: dieLabel(value, sides),
        parts,
        columnTitle: column.title
      },
      row
    }
  }

  if (table.kind === 'duo') {
    const a = rollDie(sides)
    const b = rollDie(sides)
    const row = findRow(table, a)!
    const rowB = findRow(table, b)!
    return {
      result: {
        tableId: table.id,
        tableTitle: table.title,
        rollLabel: `${dieLabel(a, sides)} + ${dieLabel(b, sides)}`,
        parts: [{ kind: 'text', text: `${row.label} ${rowB.situation ?? ''}`.trim() }]
      },
      row
    }
  }

  if (table.kind === 'faction') {
    const value = rollDie(100)
    const row = findRow(table, value)!
    const n1 = row.names1?.[rollDie(row.names1.length) - 1] ?? ''
    const n2 = row.names2?.[rollDie(row.names2.length) - 1] ?? ''
    return {
      result: {
        tableId: table.id,
        tableTitle: table.title,
        rollLabel: dieLabel(value, 100),
        parts: [],
        note: row.detail,
        factionName: `${n1} ${n2}`.trim(),
        factionValue: row.label
      },
      row
    }
  }

  const value = rollDie(sides)
  const row = findRow(table, value)!
  const { parts, subResults } = buildParts(table, row)
  return {
    result: {
      tableId: table.id,
      tableTitle: table.title,
      rollLabel: dieLabel(value, sides),
      parts,
      subResults
    },
    row
  }
}

export function rollYesNo(table: OracleTable, oddsId: string): OracleResult {
  const odds = table.odds?.find((o) => o.id === oddsId) ?? table.odds![table.odds!.length - 1]
  const value = rollDie(100)
  const answer: 'Yes' | 'No' = value <= odds.max ? 'Yes' : 'No'
  return {
    tableId: table.id,
    tableTitle: table.title,
    rollLabel: dieLabel(value, 100),
    answer,
    note: odds.label,
    parts: []
  }
}

export function getTable(id: string): OracleTable | undefined {
  return ORACLE_TABLES_BY_ID[id]
}

export function summarize(result: OracleResult): string {
  if (result.answer) return `${result.answer} (${result.rollLabel})`
  if (result.factionName) return `${result.factionName} — ${result.factionValue}`
  return result.parts
    .map((p) => (p.kind === 'text' ? p.text : `[${p.label}]`))
    .join(' ')
    .trim()
}
