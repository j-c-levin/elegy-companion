<script setup lang="ts">
import { computed } from 'vue'

import { BASE_RUSH, game, MAX_RUSH } from '@/store'
import {
  conditionsForTrack,
  MITIGATION,
  type ResourceMeter,
} from './conditions'
import {
  adjustMeter,
  loseResource,
  loseRush,
  mitigateNext,
} from './sheet'
import MeterPips from './MeterPips.vue'

const resourceMeters: ResourceMeter[] = ['health', 'clarity', 'blood']

const meterLabels: Record<ResourceMeter, string> = {
  health: 'Health',
  clarity: 'Clarity',
  blood: 'Blood',
}

function mitigationEligible(meter: ResourceMeter): boolean {
  return !game.activeConditions.includes(MITIGATION[meter].conditionKey)
}

const rush = computed(() => game.meters.rush)
const maxRushModified = computed(() => rush.value.max !== MAX_RUSH)
const baseRushModified = computed(() => rush.value.base !== BASE_RUSH)

const trackChips = computed(() =>
  resourceMeters.map((meter) => ({
    meter,
    chips: conditionsForTrack(meter).map((c) => ({
      key: c.key,
      marked: game.activeConditions.includes(c.key),
    })),
  })),
)
</script>

<template>
  <section aria-labelledby="meters-heading">
    <h2 id="meters-heading">Meters</h2>
    <p class="cite">Health 681–722, Clarity 723–761, Blood 762–805, Rush 363–375 and 806–845.</p>
    <div class="meter-grid">
      <article v-for="meter in resourceMeters" :key="meter" class="meter-card">
        <header class="meter-header">
          <h3>{{ meterLabels[meter] }}</h3>
          <span class="meter-readout">{{ game.meters[meter].value }} / {{ game.meters[meter].max }}</span>
        </header>
        <MeterPips :value="game.meters[meter].value" :max="game.meters[meter].max" big />
        <div class="chips" aria-label="Cascade conditions">
          <template v-for="group in trackChips.filter((t) => t.meter === meter)" :key="group.meter">
            <span
              v-for="chip in group.chips"
              :key="chip.key"
              class="chip"
              :class="{ marked: chip.marked }"
            >
              {{ chip.key }}
            </span>
          </template>
        </div>
        <div class="button-rows">
          <div class="button-row" role="group" :aria-label="`Lose ${meterLabels[meter]}`">
            <span class="row-label">Lose</span>
            <button type="button" class="outline" @click="loseResource(meter, 1)">1</button>
            <button type="button" class="outline" @click="loseResource(meter, 2)">2</button>
            <button type="button" class="outline" @click="loseResource(meter, 3)">3</button>
          </div>
          <div class="button-row" role="group" :aria-label="`Gain ${meterLabels[meter]}`">
            <span class="row-label">Gain</span>
            <button type="button" @click="adjustMeter(meter, 1)">1</button>
            <button type="button" @click="adjustMeter(meter, 2)">2</button>
            <button type="button" @click="adjustMeter(meter, 3)">3</button>
          </div>
        </div>
        <label v-if="mitigationEligible(meter)" class="mitigate">
          <input v-model="mitigateNext[meter]" type="checkbox" />
          <span>
            Spend 1 Rush to lose 1 less ({{ MITIGATION[meter].caveat }},
            {{ MITIGATION[meter].ref }})
          </span>
        </label>
      </article>

      <article class="meter-card rush-card">
        <header class="meter-header">
          <h3>Rush</h3>
          <span class="meter-readout">{{ rush.value }}</span>
        </header>
        <MeterPips :value="rush.value" :max="rush.max" big />
        <p class="rush-caps">
          base {{ rush.base }}
          <span v-if="baseRushModified" class="modified">(reduced by Burdens)</span>,
          max {{ rush.max }}
          <span v-if="maxRushModified" class="modified">(conditions)</span>
          — manual 2046–2052, 702–705, 729, 738, 873, 889–897, 3965–3967
        </p>
        <div class="button-rows">
          <div class="button-row" role="group" aria-label="Lose Rush">
            <span class="row-label">Lose</span>
            <button type="button" class="outline" @click="loseRush(1)">1</button>
            <button type="button" class="outline" @click="loseRush(2)">2</button>
            <button type="button" class="outline" @click="loseRush(3)">3</button>
          </div>
          <div class="button-row" role="group" aria-label="Gain Rush">
            <span class="row-label">Gain</span>
            <button type="button" @click="adjustMeter('rush', 1)">+1</button>
          </div>
        </div>
        <p class="rush-note">
          Range −6 to +10 (manual 363–375). Cool your Rush from the Roll Engine after a roll.
        </p>
        <p v-if="rush.value <= 0" class="rush-warning">
          At 0 Rush, losing more means choosing a steeper cost (manual 823–833). The sheet will ask.
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}

.meter-grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 720px) {
  .meter-grid {
    grid-template-columns: repeat(2, 1fr);
    align-items: start;
  }
}

.meter-card {
  padding: 1rem 1.1rem;
  margin-bottom: 0;
}

.meter-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.meter-header h3 {
  margin: 0;
}

.meter-readout {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--pico-primary);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0.6rem 0 0.2rem;
}

.chip {
  font-size: 0.75rem;
  padding: 0.1rem 0.5rem;
  border-radius: 1rem;
  border: 1px solid var(--pico-muted-border-color);
  color: var(--pico-muted-color);
}

.chip.marked {
  background: var(--pico-primary-background);
  border-color: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
  font-weight: 600;
}

.button-rows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.button-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.row-label {
  width: 2.6rem;
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}

.button-row button {
  min-width: 3rem;
  min-height: 2.6rem;
  margin-bottom: 0;
  font-weight: 600;
}

.button-row button:not(.outline) {
  padding-inline: 1rem;
}

.mitigate {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: var(--pico-muted-color);
}

.mitigate input {
  margin-top: 0.2rem;
}

.rush-caps {
  font-size: 0.85rem;
  color: var(--pico-muted-color);
  margin: 0.5rem 0 0;
}

.modified {
  color: var(--pico-danger);
}

.rush-note,
.rush-warning {
  font-size: 0.85rem;
  margin: 0.6rem 0 0;
}

.rush-warning {
  color: var(--pico-danger);
  font-weight: 600;
}
</style>
