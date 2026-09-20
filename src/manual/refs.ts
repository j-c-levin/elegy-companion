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

export const MANUAL_REF_ENTRIES = refsData as ManualRefDef[]

export const MANUAL_REFS: Readonly<Record<string, ManualRefDef>> = Object.fromEntries(
  MANUAL_REF_ENTRIES.map((entry) => [entry.key, entry]),
)

type ExcerptMap = Record<string, ManualExcerpt>

let excerptsPromise: Promise<ExcerptMap> | null = null

function loadExcerpts(): Promise<ExcerptMap> {
  excerptsPromise ??= import('./excerpts.json').then((m) => m.default as unknown as ExcerptMap)
  return excerptsPromise
}

export async function excerptForRange(start: number, end: number): Promise<ManualExcerpt | undefined> {
  const excerpts = await loadExcerpts()
  return excerpts[`${start}-${end}`]
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
