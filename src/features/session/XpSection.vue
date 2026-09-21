<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import ManualRef from '@/components/ManualRef.vue'
import { game } from '@/store'

import { awardXp, spendXp } from './xp'

const xp = computed(() => game.xp)
const fullUnits = computed(() => Math.floor(xp.value / 5))
const remainder = computed(() => xp.value % 5)
const showPartial = computed(() => remainder.value > 0 || fullUnits.value === 0)

const tallyLabel = computed(() => {
  const units = fullUnits.value
  const ticks = remainder.value
  const parts = [`${xp.value} XP`, `${units} full ${units === 1 ? 'unit' : 'units'}`]
  if (ticks > 0) parts.push(`${ticks} extra ${ticks === 1 ? 'tick' : 'ticks'}`)
  return parts.join(' — ')
})

const armedCost = ref<0 | 10 | 15>(0)
let disarmTimer: number | undefined

const armedUnits = computed(() =>
  armedCost.value > 0 && xp.value >= armedCost.value ? armedCost.value / 5 : 0,
)

function isCrossed(unitIndex: number): boolean {
  return armedUnits.value > 0 && unitIndex >= fullUnits.value - armedUnits.value
}

function toggleSpend(cost: 10 | 15): void {
  if (xp.value < cost) return
  window.clearTimeout(disarmTimer)
  if (armedCost.value === cost) {
    armedCost.value = 0
    spendXp(cost)
    return
  }
  armedCost.value = cost
  disarmTimer = window.setTimeout(() => {
    armedCost.value = 0
  }, 4000)
}

onUnmounted(() => window.clearTimeout(disarmTimer))
</script>

<template>
  <section aria-labelledby="session-xp-heading">
    <h2 id="session-xp-heading">XP economy</h2>
    <p class="cite">
      Failures grant 1 XP, or 3 on a match; spend 10 XP to upgrade an Aspect or 15 to acquire one
      (manual 1122–1160 <ManualRef ref-key="xp" />).
    </p>

    <article class="xp-card">
      <h3>
        XP tally
        <span class="xp-count">{{ xp }}</span>
      </h3>
      <div class="tally" role="img" :aria-label="tallyLabel">
        <span
          v-for="unit in fullUnits"
          :key="unit"
          class="tally-unit"
          :class="{ crossed: isCrossed(unit - 1) }"
        >
          <span v-for="tick in 4" :key="tick" class="tick" />
          <span class="tick-fifth" aria-hidden="true" />
        </span>
        <span v-if="showPartial" class="tally-unit">
          <template v-for="slot in 5" :key="slot">
            <span v-if="slot <= remainder" class="tick" />
            <span v-else class="tick empty" />
          </template>
        </span>
      </div>
      <p class="tally-hint">
        1 tick = 1 XP, grouped into 5-mark units; spending crosses out whole units — 2 to upgrade,
        3 to acquire (manual 1161–1187 <ManualRef ref-key="xp-tallies" />).
      </p>
      <div class="button-row" role="group" aria-label="Gain XP">
        <button type="button" class="outline" @click="awardXp(1)">+1 XP — Failure</button>
        <button type="button" class="outline" @click="awardXp(3)">+3 XP — Failure with a match</button>
      </div>
      <div class="button-row" role="group" aria-label="Spend XP">
        <button
          type="button"
          class="spend-btn"
          :class="{ armed: armedCost === 10 }"
          :disabled="xp < 10"
          @click="toggleSpend(10)"
        >
          {{ armedCost === 10 ? 'Cross out 2 units?' : 'Spend 10 XP: upgrade an Aspect' }}
        </button>
        <button
          type="button"
          class="spend-btn"
          :class="{ armed: armedCost === 15 }"
          :disabled="xp < 15"
          @click="toggleSpend(15)"
        >
          {{ armedCost === 15 ? 'Cross out 3 units?' : 'Spend 15 XP: acquire an Aspect' }}
        </button>
      </div>
      <p class="xp-note">
        XP for completed Missions and Sealed Connections is granted by the
        <RouterLink to="/tracks">Progress Tracks</RouterLink> tool — this page only displays and
        spends the shared total. Tying a Loose End grants 1 XP in the
        <RouterLink to="/session?view=loose-ends">Loose Ends</RouterLink> tab.
      </p>
    </article>

    <article class="acquire-card">
      <h3>Upgrading and acquiring Aspects</h3>
      <p class="cite">
        What each cost buys and which steps precede the slumber (manual 1128–1149
        <ManualRef ref-key="xp-acquire" />; Edge/Expertise 1150–1152, Connections/Burdens 1153–1155).
      </p>
      <h4>Upgrade — 10 XP</h4>
      <p>
        Pick a new Ability for an Aspect you already own, spend 10 XP above, then slumber. If the
        Aspect is a Mystery, follow the acquiring steps for Mysteries instead.
      </p>
      <h4>Acquire — 15 XP</h4>
      <ul class="acquire-list">
        <li>
          <strong>Gift, innate:</strong> one of your three innate Gifts — just slumber.
        </li>
        <li>
          <strong>Gift, learned:</strong> find a Connection who has that Gift and convince them to
          teach you — commit to a Mission in their favor at one Rank below theirs (minimum Rank 1)
          and complete it, envision a scene where they teach you, then slumber. Once a Connection
          has agreed to teach you, you never need to convince them again for Gifts they know.
        </li>
        <li>
          <strong>Mystery:</strong> convince a Connection who knows the Mystery to teach you —
          commit to a Mission in their favor as above.
        </li>
        <li>
          <strong>Edge or Expertise:</strong> consider the narrative circumstances that justify
          acquiring it, then slumber.
        </li>
      </ul>
      <p class="xp-note">
        Pick the teacher among your <RouterLink to="/connections">Connections</RouterLink> and run
        their favor Mission on <RouterLink to="/tracks">Progress Tracks</RouterLink>. Connections
        and Burdens are never acquired with XP.
      </p>
    </article>
  </section>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}

.xp-card,
.acquire-card {
  margin-bottom: 1rem;
  padding: 1rem 1.1rem;
}

.xp-count {
  float: right;
  font-size: 1.2rem;
  color: var(--pico-primary);
  font-variant-numeric: tabular-nums;
}

.tally {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  min-height: 1.6rem;
  margin-bottom: 0.6rem;
}

.tally-unit {
  position: relative;
  display: inline-flex;
  gap: 0.2rem;
  padding: 0.15rem 0.35rem;
}

.tick {
  width: 0.14rem;
  height: 1.2rem;
  border-radius: 1px;
  background: var(--pico-primary);
}

.tick.empty {
  background: var(--pico-muted-border-color);
}

.tick-fifth {
  position: absolute;
  left: 0.1rem;
  right: 0.1rem;
  top: 50%;
  height: 0.14rem;
  border-radius: 1px;
  background: var(--pico-primary);
  transform: rotate(-16deg);
}

.tally-unit.crossed {
  opacity: 0.4;
}

.tally-unit.crossed::after {
  content: '';
  position: absolute;
  left: -0.2rem;
  right: -0.2rem;
  top: 50%;
  height: 0.14rem;
  border-radius: 1px;
  background: var(--pico-danger);
  transform: rotate(-4deg);
}

.tally-hint {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
  margin-bottom: 0.9rem;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.button-row button {
  margin-bottom: 0;
  min-height: 2.6rem;
}

.spend-btn.armed {
  background: var(--pico-primary-background);
  border-color: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
  font-weight: 600;
}

.xp-note {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin-bottom: 0;
}

.acquire-card h4 {
  margin-bottom: 0.3rem;
}

.acquire-card p {
  margin-bottom: 0.75rem;
}

.acquire-list {
  margin-bottom: 0.75rem;
}

.acquire-list li + li {
  margin-top: 0.35rem;
}

.acquire-list strong {
  font-weight: 600;
}

.button-row button {
  flex: 1 1 auto;
}

@media (min-width: 720px) {
  .button-row button {
    flex: 0 1 auto;
  }
}
</style>
