import { createDefaultMeters, readJson, updateGame, writeJson, type Attributes } from '@/store'

export const CREATION_DRAFT_STORAGE_NAME = 'creation-draft'
export const CREATION_DRAFT_VERSION = 1

export const ATTRIBUTE_SPREAD: readonly [number, number, number, number] = [3, 2, 2, 1]

export interface CreationDraft {
  occupation: string
  apparentAge: string
  progenitor: string
  turningReason: string
  gifts: string[]
  mysteries: string[]
  aspects: string[]
  relationships: string[]
  attributes: Attributes
  name: string
  look: string
  possessions: string[]
  home: string
}

export interface CreationDraftStorage {
  version: number
  draft: CreationDraft
}

export function createDefaultDraft(): CreationDraft {
  return {
    occupation: '',
    apparentAge: '',
    progenitor: '',
    turningReason: '',
    gifts: [],
    mysteries: [],
    aspects: [],
    relationships: [],
    attributes: { body: 0, mind: 0, charm: 0, soul: 0 },
    name: '',
    look: '',
    possessions: [],
    home: '',
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function coerceDraft(raw: unknown): CreationDraft {
  const fallback = createDefaultDraft()
  if (!isRecord(raw)) return fallback
  const draft = createDefaultDraft()
  for (const key of ['occupation', 'apparentAge', 'progenitor', 'turningReason', 'name', 'look', 'home'] as const) {
    if (typeof raw[key] === 'string') draft[key] = raw[key]
  }
  for (const key of ['gifts', 'mysteries', 'aspects', 'relationships', 'possessions'] as const) {
    if (Array.isArray(raw[key])) draft[key] = (raw[key] as unknown[]).filter((v): v is string => typeof v === 'string')
  }
  if (isRecord(raw.attributes)) {
    for (const key of ['body', 'mind', 'charm', 'soul'] as const) {
      if (typeof raw.attributes[key] === 'number' && Number.isFinite(raw.attributes[key])) {
        draft.attributes[key] = raw.attributes[key]
      }
    }
  }
  return draft
}

export function loadDraft(): CreationDraft {
  const stored = readJson<{ version?: unknown; draft?: unknown }>(CREATION_DRAFT_STORAGE_NAME)
  if (!stored || typeof stored.version !== 'number' || stored.version > CREATION_DRAFT_VERSION) {
    if (stored && typeof stored.version === 'number' && stored.version > CREATION_DRAFT_VERSION) {
      console.warn(`[elegy] stored creation draft is version ${stored.version}; ignoring newer data`)
    }
    return createDefaultDraft()
  }
  return coerceDraft(stored.draft)
}

export function saveDraft(draft: CreationDraft): void {
  writeJson(CREATION_DRAFT_STORAGE_NAME, { version: CREATION_DRAFT_VERSION, draft })
}

export function clearDraft(): void {
  saveDraft(createDefaultDraft())
}

export function commitDraft(draft: CreationDraft): void {
  updateGame((state) => {
    state.identity.occupation = draft.occupation
    state.identity.apparentAge = draft.apparentAge
    state.identity.progenitor = draft.progenitor
    state.identity.name = draft.name
    state.identity.look = draft.look
    state.identity.home = draft.home
    state.identity.possessions = [...draft.possessions]
    state.attributes.body = draft.attributes.body
    state.attributes.mind = draft.attributes.mind
    state.attributes.charm = draft.attributes.charm
    state.attributes.soul = draft.attributes.soul
    state.meters = createDefaultMeters()
  })
}
