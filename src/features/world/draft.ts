import { reactive } from 'vue'

import {
  createDefaultWorld,
  loadWorld,
  saveWorld,
  setTruth,
  type CityState,
  type FirstMissionState,
  type TruthId,
  type WorldState,
} from './world'
import truthsData from '@/data/truths.json'

const state = reactive<WorldState>(loadWorld())

export function worldDraft(): WorldState {
  return state
}

export function chooseTruth(id: TruthId, choice: string): void {
  setTruth(state, id, choice)
}

export function setCustomTruth(id: TruthId, text: string): void {
  const trimmed = text.trim()
  setTruth(state, id, trimmed ? `custom:${trimmed}` : '')
}

export function customTruthText(id: TruthId): string {
  const choice = state.truths[id]
  return choice.startsWith('custom:') ? choice.slice('custom:'.length) : ''
}

export function setCityField<K extends keyof CityState>(key: K, value: CityState[K]): void {
  state.city[key] = value
  saveWorld(state)
}

export function setMissionField<K extends keyof FirstMissionState>(key: K, value: FirstMissionState[K]): void {
  state.firstMission[key] = value
  saveWorld(state)
}

export function resetWorldDraft(): void {
  Object.assign(state, createDefaultWorld())
  saveWorld(state)
}

export interface TruthOption {
  id: string
  label: string
  summary: string
}

export interface TruthCategory {
  id: TruthId
  title: string
  prompt: string
  options: TruthOption[]
}

const CATEGORIES = (truthsData as { categories: TruthCategory[] }).categories

export function truthCategory(id: TruthId): TruthCategory | undefined {
  const found = CATEGORIES.find((category) => category.id === id)
  return found ? { ...found, id } : undefined
}

export function truthChoiceLabel(id: TruthId): string {
  const choice = state.truths[id]
  if (!choice) return ''
  if (choice.startsWith('custom:')) return choice.slice('custom:'.length)
  return truthCategory(id)?.options.find((option) => option.id === choice)?.label ?? choice
}

export type { CityState, FirstMissionState, TruthId, WorldState }
