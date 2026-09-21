import refsData from './refs.json'

export interface ManualRange {
  start: number
  end: number
  label?: string
}

export interface ManualRefDef {
  key: string
  label: string
  section?: string
  ranges: ManualRange[]
}

export interface ManualLine {
  n: number
  text: string
}

export interface ManualExcerpt {
  start: number
  end: number
  lines: ManualLine[]
}

export interface ManualReadableHeading {
  k: 'h'
  lvl: 1 | 2
  t: string
  s: [number, number]
}

export interface ManualReadablePara {
  k: 'p'
  t: string
  s: [number, number]
}

export interface ManualReadableList {
  k: 'list'
  ordered?: boolean
  items: { t: string; s: [number, number] }[]
  s: [number, number]
}

export interface ManualReadableTable {
  k: 'table'
  cols?: string[]
  rows: { c: string[]; s: [number, number] }[]
  s: [number, number]
}

export type ManualReadableBlock =
  | ManualReadableHeading
  | ManualReadablePara
  | ManualReadableList
  | ManualReadableTable

export interface ManualReadable {
  start: number
  end: number
  blocks: ManualReadableBlock[]
}

export const MANUAL_REF_ENTRIES = refsData as ManualRefDef[]

export const MANUAL_REFS: Readonly<Record<string, ManualRefDef>> = Object.fromEntries(
  MANUAL_REF_ENTRIES.map((entry) => [entry.key, entry]),
)

type ExcerptMap = Record<string, ManualExcerpt>
type ReadableMap = Record<string, ManualReadable>

let excerptsPromise: Promise<ExcerptMap> | null = null
let readablePromise: Promise<ReadableMap> | null = null

function loadExcerpts(): Promise<ExcerptMap> {
  excerptsPromise ??= import('./excerpts.json').then((m) => m.default as unknown as ExcerptMap)
  return excerptsPromise
}

function loadReadable(): Promise<ReadableMap> {
  readablePromise ??= import('./readable.json').then((m) => m.default as unknown as ReadableMap)
  return readablePromise
}

export async function excerptForRange(start: number, end: number): Promise<ManualExcerpt | undefined> {
  const excerpts = await loadExcerpts()
  return excerpts[`${start}-${end}`]
}

export async function readableForRange(
  start: number,
  end: number,
): Promise<ManualReadable | undefined> {
  const readable = await loadReadable()
  return readable[`${start}-${end}`]
}

export function parseManualSource(source: string): { start: number; end: number } | null {
  const match = /:(\d+)-(\d+)$/.exec(source)
  if (!match) return null
  return { start: Number(match[1]), end: Number(match[2]) }
}

export function conditionRefKey(conditionKey: string): string {
  return `cond-${conditionKey.toLowerCase().replace(/\s+/g, '-')}`
}

export function mitigationRefKey(meter: 'health' | 'clarity' | 'blood'): string {
  return `mitigate-${meter}`
}

export function endRefKey(track: 'health' | 'clarity' | 'blood' | 'conscience' | 'standing'): string {
  return `end-${track}`
}
