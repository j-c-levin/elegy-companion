<script setup lang="ts">
import { ref } from 'vue'

import { game, type MeterKey } from '@/store'

import { applyDeltas } from './apply'
import { MIN_RUSH, rollOnTable } from './engine'
import { PAY_THE_PRICE, type PriceCost, type PriceRow } from './tables'
import ManualRef from '@/components/ManualRef.vue'

interface PriceRoll {
  die: number
  row: PriceRow
  applied: boolean
}

type MeterCost = Extract<PriceCost, MeterKey>

const METER_COSTS: MeterCost[] = ['health', 'clarity', 'blood', 'rush']

const COST_LABELS: Record<MeterCost, string> = {
  health: 'Health',
  clarity: 'Clarity',
  blood: 'Blood',
  rush: 'Rush',
}

const rolls = ref<PriceRoll[]>([])

function rollOnce(): PriceRoll {
  const rolled = rollOnTable(PAY_THE_PRICE.rows)
  return { die: rolled.die, row: rolled.row as PriceRow, applied: false }
}

function rollPrice(): void {
  const first = rollOnce()
  rolls.value = first.row.cost === 'twice' ? [rollOnce(), rollOnce()] : [first]
}

function isMeterCost(cost: PriceCost | null): cost is MeterCost {
  return cost !== null && METER_COSTS.includes(cost as MeterCost)
}

function costLabel(cost: PriceCost | null): string {
  return isMeterCost(cost) ? COST_LABELS[cost] : ''
}

function costAfter(cost: MeterCost): number {
  const current = game.meters[cost].value
  return cost === 'rush' ? Math.max(current - 1, MIN_RUSH) : current - 1
}

function costUnchanged(roll: PriceRoll): boolean {
  return (
    isMeterCost(roll.row.cost) && costAfter(roll.row.cost) === game.meters[roll.row.cost].value
  )
}

function applyCost(roll: PriceRoll): void {
  if (roll.applied || !isMeterCost(roll.row.cost)) return
  const cost = roll.row.cost
  roll.applied = true
  applyDeltas([{ meter: cost, amount: -1 }])
}
</script>

<template>
  <article class="panel">
    <h2>Pay the Price</h2>
    <p class="cite">Manual 364–412 <ManualRef ref-key="pay-the-price" /></p>
    <p class="intro">
      When a rule tells you to pay the price, choose a fitting consequence from the table below,
      or roll on it to decide at random. If the result doesn't make sense, roll again.
    </p>

    <button class="price-btn" @click="rollPrice">Roll d100</button>

    <div v-for="(roll, index) in rolls" :key="index" class="price-result">
      <p class="range">
        d100: <strong>{{ roll.die }}</strong>
        <span class="range-band">({{ roll.row.range[0] }}–{{ roll.row.range[1] }})</span>
      </p>
      <p class="price-text">{{ roll.row.text }}</p>

      <button
        v-if="isMeterCost(roll.row.cost)"
        type="button"
        class="apply-btn"
        :disabled="roll.applied || costUnchanged(roll)"
        @click="applyCost(roll)"
      >
        <span>{{ roll.applied ? 'Paid — ' : 'Pay: ' }}−1 {{ costLabel(roll.row.cost) }}</span>
        <small>{{ costLabel(roll.row.cost) }} {{ game.meters[roll.row.cost as MeterCost].value }} → {{ costAfter(roll.row.cost as MeterCost) }}</small>
      </button>
      <p v-else-if="roll.row.cost === 'pulse'" class="hint">
        Lose Pulse — track this on the Connection (Phase 2 tooling).
      </p>
      <p v-else-if="roll.row.cost === 'standing'" class="hint">
        Try Your Standing next time you slumber.
      </p>
      <button v-else-if="roll.row.cost === 'reroll'" type="button" class="ghost-btn" @click="rollPrice">
        Roll again
      </button>
    </div>

    <button v-if="rolls.length" type="button" class="ghost-btn again-btn" @click="rollPrice">
      Doesn't make sense? Roll again
    </button>
  </article>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
  margin-bottom: 1rem;
}

.intro {
  font-size: 0.95rem;
  margin-bottom: 0.9rem;
}

.price-btn {
  width: 100%;
  padding-block: 0.9rem;
  font-size: 1.05rem;
  font-weight: 600;
}

.price-result {
  margin-top: 1rem;
  border-top: 1px solid var(--pico-muted-border-color);
  padding-top: 0.9rem;
}

.range {
  color: var(--pico-muted-color);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.range strong {
  font-size: 1.15rem;
  color: var(--pico-color);
}

.range-band {
  margin-left: 0.35rem;
}

.price-text {
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.apply-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.65rem 0.9rem;
  margin-bottom: 0;
}

.apply-btn small {
  display: block;
  color: var(--pico-muted-color);
}

.hint {
  color: var(--pico-muted-color);
  font-size: 0.88rem;
  margin-bottom: 0.6rem;
}

.ghost-btn {
  padding: 0.45rem 0.8rem;
  font-size: 0.9rem;
}

.again-btn {
  margin-top: 0.9rem;
}
</style>
