<script setup lang="ts">
import { computed, ref } from 'vue'

import { game } from '@/store'
import { addLooseEnd, addXp, discardLooseEnd, spendXp, tieLooseEnd } from './sheet'
import ConfirmButton from './ConfirmButton.vue'

const xp = computed(() => game.xp)
const fullUnits = computed(() => Math.floor(xp.value / 5))
const remainder = computed(() => xp.value % 5)

const looseEnds = computed(() => game.lists['loose-ends'] ?? [])
const tiedEnds = computed(() => game.lists['loose-ends-tied'] ?? [])

const newEnd = ref('')

function addEnd(): void {
  const text = newEnd.value.trim()
  if (!text) return
  addLooseEnd(text)
  newEnd.value = ''
}
</script>

<template>
  <section aria-labelledby="xp-heading">
    <h2 id="xp-heading">Experience</h2>
    <p class="cite">
      Failures grant 1 XP, or 3 on a match; Loose Ends grant 1 XP when tied; spend 10 XP to upgrade
      an Aspect or 15 to acquire one (manual 1122–1155, tallies 1161–1187).
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
        teach you (manual 1128–1149). Missions and Connections award XP from the Progress Tracks
        tool.
      </p>
    </article>
    <article class="loose-ends-card">
      <h3>Loose Ends</h3>
      <p class="cite">Lingering questions written when you slumber; mark Tied to gain 1 XP (manual 1147–1155).</p>
      <form class="loose-end-form" @submit.prevent="addEnd">
        <input
          v-model="newEnd"
          type="text"
          placeholder="A question you want to answer"
          aria-label="New loose end"
        />
        <button type="submit">Write it</button>
      </form>
      <ul class="end-list">
        <li v-for="end in looseEnds" :key="end.id">
          <span class="end-text">{{ end.text }}</span>
          <span class="end-actions">
            <button type="button" @click="tieLooseEnd(end.id)">Tied (+1 XP)</button>
            <ConfirmButton small label="Drop" confirm-label="Sure?" @confirm="discardLooseEnd(end.id)" />
          </span>
        </li>
      </ul>
      <details v-if="tiedEnds.length" class="tied">
        <summary>Tied loose ends ({{ tiedEnds.length }})</summary>
        <ul class="end-list">
          <li v-for="end in tiedEnds" :key="end.id" class="tied-row">
            <span class="end-text">{{ end.text }}</span>
          </li>
        </ul>
      </details>
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

.loose-end-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.loose-end-form input {
  margin-bottom: 0;
  flex: 1;
}

.loose-end-form button {
  margin-bottom: 0;
  white-space: nowrap;
}

.end-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.4rem;
}

.end-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 0;
  border-bottom: 1px solid var(--pico-muted-border-color);
}

.end-actions {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

.end-actions button {
  margin-bottom: 0;
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  --pico-font-size: 0.8rem;
}

.tied {
  margin-top: 0.75rem;
}

.tied-row {
  color: var(--pico-muted-color);
}
</style>
