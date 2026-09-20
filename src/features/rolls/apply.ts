import { game, updateGame, type GameState, type MeterKey } from '@/store'

import { MIN_RUSH, METER_LABELS } from './engine'
import type { MeterDelta } from './presets'

export function applyDeltaInPlace(draft: GameState, delta: MeterDelta): void {
  if (delta.meter === 'rush') {
    const rush = draft.meters.rush
    rush.value = Math.min(Math.max(rush.value + delta.amount, MIN_RUSH), rush.max)
    return
  }
  draft.meters[delta.meter].value += delta.amount
}

export function applyDeltas(deltas: MeterDelta[]): void {
  if (deltas.length === 0) return
  updateGame((draft) => {
    for (const delta of deltas) {
      applyDeltaInPlace(draft, delta)
    }
  })
}

export function resetRushToBase(): void {
  updateGame((draft) => {
    draft.meters.rush.value = draft.meters.rush.base
  })
}

export function meterValue(meter: MeterKey): number {
  return game.meters[meter].value
}

export function deltaLabel(delta: MeterDelta): string {
  const current = meterValue(delta.meter)
  if (delta.meter === 'rush') {
    const next = Math.min(Math.max(current + delta.amount, MIN_RUSH), game.meters.rush.max)
    if (next === current) return `Rush unchanged (${current})`
    return `Rush ${current} → ${next}`
  }
  return `${METER_LABELS[delta.meter]} ${current} → ${current + delta.amount}`
}
