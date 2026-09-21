<script setup lang="ts">
import { computed, ref } from 'vue'

import './connections-shared.css'
import ConnectionCard from './components/ConnectionCard.vue'
import { addConnection, allConnections, slumberHealAll } from './store'
import { MARKS_TO_FILL, RANKS, XP_PER_RANK, type Rank } from './types'
import { game } from '@/store'
import ManualRef from '@/components/ManualRef.vue'

const formName = ref('')
const formRank = ref<Rank>(2)
const formMortal = ref(false)
const batchFlash = ref('')

const roster = computed(() => allConnections())
const inPlay = computed(() => roster.value.filter((connection) => !connection.dead))

function create(): void {
  if (!formName.value.trim()) return
  addConnection(formName.value, formRank.value, formMortal.value)
  formName.value = ''
  formRank.value = 2
  formMortal.value = false
}

function healAllFromSlumber(): void {
  const healed = slumberHealAll()
  batchFlash.value =
    healed === 0
      ? 'No Connections needed slumber healing.'
      : `You slumbered: ${healed} Connection${healed === 1 ? '' : 's'} recovered Pulse equal to their Rank (manual 1074–1076).`
}
</script>

<template>
  <section class="connections-page">
    <header class="page-head">
      <div>
        <h1>Connections</h1>
        <p class="tagline">
          Relationships as Aspects: Rank, Pulse, Sealed and Bloodied states (manual 979–1084
          <ManualRef ref-key="connections" />).
        </p>
      </div>
      <div class="chips">
        <span class="chip">XP {{ game.xp }}</span>
        <span class="chip">Rush {{ game.meters.rush.value }}</span>
      </div>
    </header>

    <form class="new-connection" @submit.prevent="create">
      <div class="new-row">
        <input
          v-model="formName"
          type="text"
          placeholder="Their name"
          aria-label="Connection name"
        />
        <button type="submit" :disabled="!formName.trim()">Create Connection</button>
      </div>
      <div class="rank-picker">
        <span class="picker-label">Rank</span>
        <button
          v-for="rank in RANKS"
          :key="rank"
          type="button"
          class="rank-btn"
          :class="{ active: formRank === rank }"
          @click="formRank = rank"
        >
          {{ rank }}
        </button>
        <span class="picker-hint">
          max Pulse {{ formRank + 2 }} · sealing grants +{{ XP_PER_RANK[formRank] }} XP
        </span>
      </div>
      <label class="flag">
        <input v-model="formMortal" type="checkbox" />
        <span>Mortal (tests roll with Soul instead of Charm)</span>
      </label>
      <p class="picker-hint">
        Connections are Aspects and can be upgraded with XP (manual 984).
      </p>
    </form>

    <div class="batch-row">
      <button type="button" class="ghost-btn" @click="healAllFromSlumber">
        You slumbered — heal every Connection +Rank Pulse
      </button>
      <ManualRef ref-key="pulse" label="Healing your Connection" />
      <p v-if="batchFlash" class="batch-flash" role="status">{{ batchFlash }}</p>
    </div>

    <section class="group" aria-labelledby="roster-heading">
      <h2 id="roster-heading">
        Your Connections <span class="count">{{ inPlay.length }}</span>
      </h2>
      <p v-if="inPlay.length === 0" class="empty">
        No Connections yet. Create one when a relationship becomes useful or important, or when you
        let someone drink from your veins (manual 980–985, 1032–1037).
      </p>
      <ConnectionCard v-for="connection in roster" :key="connection.id" :connection="connection" />
    </section>

    <details class="reference">
      <summary>
        Rank reference
        <ManualRef ref-key="track-ranks" label="Rank reference tables" />
      </summary>
      <div class="ref-grid">
        <div>
          <h4>Connections per Rank</h4>
          <table>
            <thead>
              <tr><th>Rank</th><th>Marks to fill</th><th>Max Pulse</th><th>XP on sealing</th></tr>
            </thead>
            <tbody>
              <tr v-for="rank in RANKS" :key="rank">
                <td>{{ rank }}</td>
                <td>{{ MARKS_TO_FILL[rank] }}</td>
                <td>{{ rank + 2 }}</td>
                <td>{{ XP_PER_RANK[rank] }}</td>
              </tr>
            </tbody>
          </table>
          <p class="ref-note">
            A mark is worth 3 / 2 / 1 / ½ / ¼ boxes (progress per Rank, manual 924–927); the marks
            themselves happen on the Connection's track in the Progress Tracks tool.
          </p>
        </div>
        <div>
          <h4>Choosing a Rank</h4>
          <p class="ref-note">
            Give an appropriate Rank when the relationship starts — see the common NPC ranks
            (manual 986–1008 <ManualRef ref-key="npc-ranks" />). Vampires: Newborn, Young, Mature,
            Elder, Ancient.
          </p>
        </div>
      </div>
    </details>
  </section>
</template>

<style scoped>
.connections-page {
  max-width: 48rem;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.tagline {
  color: var(--pico-muted-color);
  margin-bottom: 0;
}

.chips {
  display: flex;
  gap: 0.5rem;
}

.chip {
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: var(--pico-secondary-background);
  font-size: 0.85rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.new-connection {
  margin-top: 1.25rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.75rem;
  background: var(--pico-card-background-color);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.new-row {
  display: flex;
  gap: 0.5rem;
}

.new-row input {
  margin-bottom: 0;
  flex: 1;
}

.new-row button {
  margin-bottom: 0;
  white-space: nowrap;
}

.rank-picker {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
}

.rank-btn {
  appearance: none;
  border: 1px solid var(--pico-muted-border-color);
  background: var(--pico-secondary-background);
  color: var(--pico-color);
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.rank-btn.active {
  border-color: var(--pico-primary);
  color: var(--pico-primary);
  font-weight: 600;
}

.picker-label {
  font-size: 0.85rem;
  color: var(--pico-muted-color);
}

.picker-hint {
  font-size: 0.8rem;
  color: var(--pico-muted-color);
}

.flag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin: 0;
}

.batch-row {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.batch-flash {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--pico-primary);
  flex: 1;
  min-width: 12rem;
}

.group {
  margin-top: 1.75rem;
}

.group h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.count {
  font-size: 0.85rem;
  color: var(--pico-muted-color);
  font-weight: 400;
}

.group > * + * {
  margin-top: 0.75rem;
}

.empty {
  color: var(--pico-muted-color);
  font-size: 0.92rem;
}

.reference {
  margin-top: 2rem;
  font-size: 0.92rem;
}

.reference summary {
  cursor: pointer;
  font-weight: 600;
}

.ref-grid {
  display: grid;
  gap: 1.25rem;
  margin-top: 0.75rem;
}

@media (min-width: 720px) {
  .ref-grid {
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  }
}

.ref-grid table {
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
}

.ref-grid td,
.ref-grid th {
  padding: 0.3rem 0.45rem;
}

.ref-note {
  font-size: 0.82rem;
  color: var(--pico-muted-color);
  margin: 0;
}
</style>
