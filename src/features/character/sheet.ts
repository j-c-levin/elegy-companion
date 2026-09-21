import { reactive, ref } from 'vue'

import {
  addListItem,
  game,
  readJson,
  updateGame,
  writeJson,
  type GameState,
} from '@/store'
import {
  firstUnmarkedForTrack,
  MITIGATION,
  rushCaps,
  type ResourceMeter,
} from './conditions'

export const RUSH_MIN = -6

export type AnyMeter = ResourceMeter | 'rush'

export function syncRushCaps(draft: GameState): void {
  const caps = rushCaps(draft.activeConditions)
  draft.meters.rush.base = caps.base
  draft.meters.rush.max = caps.max
}

export function markCondition(key: string): void {
  updateGame((draft) => {
    if (draft.activeConditions.includes(key)) return
    draft.activeConditions.push(key)
    syncRushCaps(draft)
  })
}

export function eraseCondition(key: string): void {
  updateGame((draft) => {
    const index = draft.activeConditions.indexOf(key)
    if (index === -1) return
    draft.activeConditions.splice(index, 1)
    syncRushCaps(draft)
  })
}

export function adjustMeter(meter: AnyMeter, delta: number): void {
  updateGame((draft) => {
    if (meter === 'rush') {
      const rush = draft.meters.rush
      rush.value = Math.max(RUSH_MIN, Math.min(rush.max, rush.value + delta))
    } else {
      const m = draft.meters[meter]
      m.value = Math.max(0, Math.min(m.max, m.value + delta))
    }
  })
}

export const mitigateNext = reactive<Record<ResourceMeter, boolean>>({
  health: false,
  clarity: false,
  blood: false,
})

export const pendingLoss = ref<{ meter: ResourceMeter; amount: number } | null>(null)
export const pendingRushLoss = ref<number | null>(null)

export function loseResource(meter: ResourceMeter, amount: number): void {
  if (game.meters[meter].value <= 0) {
    pendingLoss.value = { meter, amount }
    return
  }
  let loss = amount
  if (mitigateNext[meter] && !game.activeConditions.includes(MITIGATION[meter].conditionKey)) {
    mitigateNext[meter] = false
    loss -= 1
    updateGame((draft) => {
      draft.meters.rush.value = Math.max(RUSH_MIN, draft.meters.rush.value - 1)
    })
  }
  if (loss > 0) {
    updateGame((draft) => {
      draft.meters[meter].value = Math.max(0, draft.meters[meter].value - loss)
    })
  }
}

export function resolvePendingLoss(mark: boolean): void {
  const loss = pendingLoss.value
  pendingLoss.value = null
  if (!loss || !mark) return
  const next = firstUnmarkedForTrack(loss.meter, game.activeConditions)
  if (next) markCondition(next.key)
}

export function loseRush(amount: number): void {
  if (game.meters.rush.value <= 0) {
    pendingRushLoss.value = amount
    return
  }
  updateGame((draft) => {
    draft.meters.rush.value = Math.max(RUSH_MIN, draft.meters.rush.value - amount)
  })
}

export function convertRushLoss(meter: ResourceMeter): void {
  const amount = pendingRushLoss.value
  pendingRushLoss.value = null
  if (amount) loseResource(meter, amount)
}

export function dismissRushLoss(): void {
  pendingRushLoss.value = null
}

export function addXp(amount: number): void {
  updateGame((draft) => {
    draft.xp += amount
  })
}

export function spendXp(amount: number): void {
  updateGame((draft) => {
    draft.xp = Math.max(0, draft.xp - amount)
  })
}

export function addLooseEnd(text: string): void {
  updateGame((draft) => {
    addListItem(draft, 'loose-ends', text)
  })
}

export function slumber(): void {
  if (game.meters.blood.value <= 0) {
    pendingLoss.value = { meter: 'blood', amount: 1 }
  }
  updateGame((draft) => {
    if (draft.meters.blood.value > 0) {
      draft.meters.blood.value -= 1
    }
    draft.meters.rush.value = Math.min(draft.meters.rush.max, draft.meters.rush.value + 1)
    const index = draft.activeConditions.indexOf('Cautioned')
    if (index !== -1) draft.activeConditions.splice(index, 1)
    syncRushCaps(draft)
  })
}

export type RecoveryResult = 'stylish' | 'flat' | 'failure'

export function regenerate(result: RecoveryResult, failureChoice: 'blood' | 'rush'): void {
  const wounded = game.activeConditions.includes('Wounded')
  const gain = wounded ? 2 : 3
  updateGame((draft) => {
    const index = draft.activeConditions.indexOf('Wounded')
    if (index !== -1) draft.activeConditions.splice(index, 1)
    syncRushCaps(draft)
    const health = draft.meters.health
    health.value = Math.min(health.max, health.value + gain)
  })
  if (result === 'flat' || (result === 'failure' && !wounded)) {
    loseResource('blood', 1)
  } else if (result === 'failure') {
    loseResource('blood', 1)
    if (failureChoice === 'blood') loseResource('blood', 1)
    else loseRush(2)
  }
}

export function respite(result: RecoveryResult, failureChoice: 'rush' | 'clarity'): void {
  const inShock = game.activeConditions.includes('In Shock')
  let gain = inShock ? 1 : 2
  if (result === 'failure' && failureChoice === 'clarity') gain -= 1
  updateGame((draft) => {
    const index = draft.activeConditions.indexOf('In Shock')
    if (index !== -1) draft.activeConditions.splice(index, 1)
    syncRushCaps(draft)
    const clarity = draft.meters.clarity
    clarity.value = Math.min(clarity.max, clarity.value + gain)
  })
  if (result !== 'stylish') loseRush(1)
  if (result === 'failure' && failureChoice === 'rush') loseRush(1)
}

export interface FeedSource {
  animal: boolean
  preserved: boolean
}

export function feed(result: RecoveryResult, source: FeedSource): void {
  const starving = game.activeConditions.includes('Starving')
  const voracious = result === 'failure' && starving && !source.preserved
  if (voracious) {
    updateGame((draft) => {
      draft.meters.blood.value = draft.meters.blood.max
      const index = draft.activeConditions.indexOf('Starving')
      if (index !== -1) draft.activeConditions.splice(index, 1)
    })
    setConscienceTest({ reason: 'Fed from a victim who did not resist', selfDefense: false })
    return
  }
  let gain = starving ? 2 : 3
  if (source.animal) gain -= 1
  if (result === 'failure' && source.preserved) gain -= 1
  gain = Math.max(0, gain)
  updateGame((draft) => {
    const blood = draft.meters.blood
    blood.value = Math.min(blood.max, blood.value + gain)
    if (result !== 'failure' && gain > 0 && starving) {
      const index = draft.activeConditions.indexOf('Starving')
      if (index !== -1) draft.activeConditions.splice(index, 1)
    }
  })
  if (result === 'flat' || result === 'failure') loseRush(1)
}

export interface TenetPending {
  reason: string
  selfDefense: boolean
}

const TENETS_STORAGE_NAME = 'character-tenets'

interface TenetsStorage {
  version: 1
  conscience: TenetPending | null
  standing: TenetPending | null
}

function loadTenets(): TenetsStorage {
  return readJson<TenetsStorage>(TENETS_STORAGE_NAME) ?? { version: 1, conscience: null, standing: null }
}

function persistTenets(): void {
  writeJson(TENETS_STORAGE_NAME, {
    version: 1,
    conscience: conscienceTest.value,
    standing: standingTest.value,
  } satisfies TenetsStorage)
}

const loadedTenets = loadTenets()

export const conscienceTest = ref<TenetPending | null>(loadedTenets.conscience)
export const standingTest = ref<TenetPending | null>(loadedTenets.standing)

export function setConscienceTest(pending: TenetPending | null): void {
  conscienceTest.value = pending
  persistTenets()
}

export function setStandingTest(pending: TenetPending | null): void {
  standingTest.value = pending
  persistTenets()
}

export function resolveConscience(result: RecoveryResult): void {
  const pending = conscienceTest.value
  conscienceTest.value = null
  persistTenets()
  if (!pending) return
  const treated = result === 'failure' && pending.selfDefense ? 'flat' : result
  if (treated === 'flat') {
    adjustMeter('rush', 1)
    loseResource('clarity', 1)
  } else if (treated === 'stylish') {
    adjustMeter('rush', 1)
  } else {
    const next = firstUnmarkedForTrack('conscience', game.activeConditions)
    if (next) markCondition(next.key)
  }
}

export function resolveStanding(result: RecoveryResult): void {
  const pending = standingTest.value
  standingTest.value = null
  persistTenets()
  if (!pending) return
  if (result === 'stylish') {
    adjustMeter('rush', 1)
  } else if (result === 'failure') {
    const next = firstUnmarkedForTrack('standing', game.activeConditions)
    if (next) markCondition(next.key)
  }
}
