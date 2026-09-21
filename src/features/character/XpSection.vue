<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { game } from '@/store'
import { addXp, spendXp } from './sheet'
import ConfirmButton from './ConfirmButton.vue'
import ManualRef from '@/components/ManualRef.vue'

const xp = computed(() => game.xp)
const fullUnits = computed(() => Math.floor(xp.value / 5))
const remainder = computed(() => xp.value % 5)
</script>

<template>
  <section aria-labelledby="xp-heading">
    <h2 id="xp-heading">Experience</h2>
    <p class="cite">
      Failures grant 1 XP, or 3 on a match; Loose Ends grant 1 XP when tied; spend 10 XP to upgrade
      an Aspect or 15 to acquire one (manual 1122–1155 <ManualRef ref-key="xp" />, tallies 1161–1187
      <ManualRef ref-key="xp-tallies" />).
    </p>
    <article class="xp-card">
      <h3>XP tally <span class="xp-count">{{ xp }}</span></h3>
      <div class="tally" role="img" :aria-label="`${xp} experience points`">
        <span v-for="unit in fullUnits" :key="unit" class="tally-unit">
          <span v-for="tick in 5" :key="tick" class="tick" />
        </span>
        <span v-if="remainder > 0 || fullUnits === 0" class="tally-unit">
          <span v-for="tick in remainder" :key="tick" class="tick" />
        </span>
      </div>
      <div class="button-row">
        <button type="button" class="outline" @click="addXp(1)">+1 XP (Failure)</button>
        <button type="button" class="outline" @click="addXp(3)">+3 XP (Failure with match)</button>
      </div>
      <div class="button-row">
        <ConfirmButton
          label="Spend 10 XP: upgrade an Aspect"
          confirm-label="Cross out 2 units?"
          :disabled="xp < 10"
          @confirm="spendXp(10)"
        />
        <ConfirmButton
          label="Spend 15 XP: acquire an Aspect"
          confirm-label="Cross out 3 units?"
          :disabled="xp < 15"
          @confirm="spendXp(15)"
        />
      </div>
      <p class="xp-note">
        Upgrading takes effect when you slumber; acquiring Gifts or Mysteries needs a Connection to
        teach you (manual 1128–1149 <ManualRef ref-key="xp-acquire" />). Missions and Connections
        award XP from the Progress Tracks tool. Loose Ends are tracked on the
        <RouterLink to="/session?view=loose-ends">Session</RouterLink> page.
      </p>
    </article>
  </section>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}

article {
  margin-bottom: 1rem;
  padding: 1rem 1.1rem;
}

.xp-count {
  float: right;
  font-size: 1.2rem;
  color: var(--pico-primary);
}

.tally {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-bottom: 0.9rem;
  min-height: 1.4rem;
}

.tally-unit {
  display: flex;
  gap: 0.25rem;
  align-items: flex-end;
}

.tick {
  width: 0.22rem;
  height: 1.2rem;
  background: var(--pico-primary);
  border-radius: 1px;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.button-row button {
  margin-bottom: 0;
  font-size: 0.85rem;
}

.xp-note {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin-bottom: 0;
}
</style>
