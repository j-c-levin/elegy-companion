import raw from '@/data/basic-actions.json'
import { ATTRIBUTE_KEYS, type AttributeKey } from '@/store'

import type { MeterKey, Verdict } from './engine'

export interface MeterDelta {
  meter: MeterKey
  amount: number
}

export interface EffectOption {
  label: string
  deltas: MeterDelta[]
  nextRoll?: number
}

export interface ActionResultText {
  text: string
  options: EffectOption[]
}

export interface BasicAction {
  id: string
  title: string
  ref: string
  intro: string
  attributes: { key: AttributeKey; guidance: string }[]
  bonusHint?: string
  results: Record<Verdict, ActionResultText>
}

const METER_KEYS: MeterKey[] = ['health', 'clarity', 'blood', 'rush']
const VERDICTS: Verdict[] = ['stylish', 'flat', 'failure']

function parseDeltas(value: unknown): MeterDelta[] {
  if (!Array.isArray(value)) return []
  const deltas: MeterDelta[] = []
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue
    const { meter, amount } = item as { meter?: unknown; amount?: unknown }
    if (
      typeof meter === 'string' &&
      METER_KEYS.includes(meter as MeterKey) &&
      typeof amount === 'number'
    ) {
      deltas.push({ meter: meter as MeterKey, amount })
    }
  }
  return deltas
}

function parseOptions(value: unknown): EffectOption[] {
  if (!Array.isArray(value)) return []
  const options: EffectOption[] = []
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue
    const { label, deltas, nextRoll } = item as {
      label?: unknown
      deltas?: unknown
      nextRoll?: unknown
    }
    if (typeof label !== 'string') continue
    options.push({
      label,
      deltas: parseDeltas(deltas),
      nextRoll: typeof nextRoll === 'number' ? nextRoll : undefined,
    })
  }
  return options
}

function parseResult(value: unknown): ActionResultText {
  const source = (typeof value === 'object' && value !== null ? value : {}) as {
    text?: unknown
    options?: unknown
  }
  return {
    text: typeof source.text === 'string' ? source.text : '',
    options: parseOptions(source.options),
  }
}

function parseAttribute(value: unknown): { key: AttributeKey; guidance: string } | null {
  if (typeof value !== 'object' || value === null) return null
  const { key, guidance } = value as { key?: unknown; guidance?: unknown }
  if (typeof key !== 'string' || !ATTRIBUTE_KEYS.includes(key as AttributeKey)) return null
  return { key: key as AttributeKey, guidance: typeof guidance === 'string' ? guidance : '' }
}

function parseAction(value: unknown): BasicAction | null {
  if (typeof value !== 'object' || value === null) return null
  const source = value as Record<string, unknown>
  if (typeof source.id !== 'string' || typeof source.title !== 'string') return null
  const attributes: BasicAction['attributes'] = []
  for (const item of Array.isArray(source.attributes) ? source.attributes : []) {
    const parsed = parseAttribute(item)
    if (parsed) attributes.push(parsed)
  }
  if (attributes.length === 0) return null
  const rawResults =
    typeof source.results === 'object' && source.results !== null
      ? (source.results as Record<string, unknown>)
      : {}
  const results = {} as Record<Verdict, ActionResultText>
  for (const verdict of VERDICTS) {
    results[verdict] = parseResult(rawResults[verdict])
  }
  return {
    id: source.id,
    title: source.title,
    ref: typeof source.ref === 'string' ? source.ref : '',
    intro: typeof source.intro === 'string' ? source.intro : '',
    attributes,
    bonusHint: typeof source.bonusHint === 'string' ? source.bonusHint : undefined,
    results,
  }
}

export const BASIC_ACTIONS: BasicAction[] = raw.actions
  .map(parseAction)
  .filter((action): action is BasicAction => action !== null)

export const GENERIC_ACTION_ID = 'generic'
