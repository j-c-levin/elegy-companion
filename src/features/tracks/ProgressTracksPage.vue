<script setup lang="ts">
import { computed, ref } from 'vue'

import './tracks-shared.css'
import TrackCard from './components/TrackCard.vue'
import { addTrack, archivedTracks, removeTrack, setTrackArchived, tracksByKind } from './store'
import {
  KIND_LABEL,
  PROGRESS_TICKS_PER_MARK,
  RANKS,
  type Rank,
  type TrackKind,
} from './types'
import { game } from '@/store'
import ManualRef from '@/components/ManualRef.vue'

const formKind = ref<TrackKind>('mission')
const formTitle = ref('')
const formRank = ref<Rank>(2)
const formNotes = ref('')
const formHasTrack = ref(true)

const kinds: TrackKind[] = ['mission', 'connection', 'combat']

const missions = computed(() => tracksByKind('mission'))
const connections = computed(() => tracksByKind('connection'))
const adversaries = computed(() => tracksByKind('combat'))
const archived = computed(() => archivedTracks())

function create(): void {
  if (!formTitle.value.trim()) return
  addTrack(
    formKind.value,
    formTitle.value,
    formRank.value,
    formNotes.value.trim(),
    formHasTrack.value,
  )
  formTitle.value = ''
  formNotes.value = ''
  formRank.value = 2
  formHasTrack.value = true
}

function deleteArchived(id: string): void {
  removeTrack(id)
}
</script>

<template>
  <section class="tracks-page">
    <header class="page-head">
      <div>
        <h1>Progress Tracks</h1>
        <p class="tagline">
          Missions, connections and adversaries on ten-box tracks (manual 911–932
          <ManualRef ref-key="progress-tracks" />).
        </p>
      </div>
      <div class="meter-chips">
        <span class="chip">XP {{ game.xp }}</span>
        <span class="chip">Rush {{ game.meters.rush.value }}</span>
      </div>
    </header>

    <form class="new-track" @submit.prevent="create">
      <div class="kind-picker" role="radiogroup" aria-label="Track type">
        <button
          v-for="kind in kinds"
          :key="kind"
          type="button"
          class="kind-btn"
          :class="{ active: formKind === kind }"
          @click="formKind = kind"
        >
          {{ KIND_LABEL[kind] }}
        </button>
      </div>
      <div class="new-row">
        <input
          v-model="formTitle"
          type="text"
          :placeholder="formKind === 'combat' ? 'Adversary name' : formKind === 'connection' ? 'Their name' : 'Mission goal'"
          aria-label="Track title"
        />
        <button type="submit" :disabled="!formTitle.trim()">Commit to track</button>
      </div>
      <div class="rank-picker">
        <span class="rank-label">Rank</span>
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
        <span class="rank-hint">
          {{ formRank === 1 ? 'a few scenes' : formRank === 2 ? 'one night or a bit more' : formRank === 3 ? 'a few nights' : formRank === 4 ? 'many nights, about a week' : 'more than a week' }}
          — a mark is worth {{ PROGRESS_TICKS_PER_MARK[formRank] }} ticks
        </span>
      </div>
      <label v-if="formKind === 'combat'" class="flag combat-track">
        <input v-model="formHasTrack" type="checkbox" />
        <span>Has a progress track (uncheck for regular mortals: one hit takes them down)</span>
      </label>
    </form>

    <section class="group">
      <h2>Missions <span class="count">{{ missions.length }}</span></h2>
      <p v-if="missions.length === 0" class="empty">
        No active Missions. Commit to a goal, debt, favor, or duty above.
      </p>
      <TrackCard v-for="track in missions" :key="track.id" :track="track" />
    </section>

    <section class="group">
      <h2>Connections <span class="count">{{ connections.length }}</span></h2>
      <p v-if="connections.length === 0" class="empty">
        No active Connections. Create one for a useful or important character.
      </p>
      <TrackCard v-for="track in connections" :key="track.id" :track="track" />
    </section>

    <section class="group">
      <h2>Adversaries <span class="count">{{ adversaries.length }}</span></h2>
      <p v-if="adversaries.length === 0" class="empty">
        No adversaries in play. Assign a Rank when you engage them.
      </p>
      <TrackCard v-for="track in adversaries" :key="track.id" :track="track" />
    </section>

    <section class="group archived">
      <h2>Archived <span class="count">{{ archived.length }}</span></h2>
      <p v-if="archived.length === 0" class="empty">Fulfilled Missions, Sealed Connections and downed adversaries land here.</p>
      <div v-for="track in archived" :key="track.id" class="archived-row">
        <span class="kind-tag">{{ KIND_LABEL[track.kind] }}</span>
        <span class="archived-title">{{ track.title }}</span>
        <span class="archived-meta">Rank {{ track.rank }} · {{ track.ticks }}/40</span>
        <span class="archived-actions">
          <button type="button" class="ghost-btn small" @click="setTrackArchived(track.id, false)">
            Restore
          </button>
          <button type="button" class="ghost-btn small danger" @click="deleteArchived(track.id)">
            Delete
          </button>
        </span>
      </div>
    </section>

    <details class="reference">
      <summary>
        Rank reference
        <ManualRef ref-key="track-ranks" label="Rank reference tables" />
      </summary>
      <div class="ref-grid">
        <div>
          <h4>Mission effort (per Rank)</h4>
          <table>
            <thead>
              <tr><th>Rank</th><th>Effort</th><th>Steps</th><th>Mark</th></tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>A few scenes or one night</td><td>3 to 4</td><td>3 boxes</td></tr>
              <tr><td>2</td><td>One night or a bit more</td><td>5</td><td>2 boxes</td></tr>
              <tr><td>3</td><td>A few nights</td><td>10</td><td>1 box</td></tr>
              <tr><td>4</td><td>Many nights or about a week</td><td>20</td><td>half a box</td></tr>
              <tr><td>5</td><td>More than a week</td><td>40</td><td>a quarter box</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <h4>Common NPC ranks</h4>
          <table>
            <thead>
              <tr><th>Type</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>
            </thead>
            <tbody>
              <tr><td>Vampire</td><td>Newborn</td><td>Young</td><td>Mature</td><td>Elder</td><td>Ancient</td></tr>
              <tr><td>Mortal</td><td>Common</td><td>Lackey</td><td>—</td><td>—</td><td>—</td></tr>
              <tr><td>Hunter</td><td>—</td><td>Vigilante</td><td>Agent</td><td>—</td><td>—</td></tr>
              <tr><td>Ghost</td><td>Recent</td><td>Wraith</td><td>—</td><td>—</td><td>—</td></tr>
              <tr><td>Witch</td><td>Apprentice</td><td>Veteran</td><td>Arch</td><td>Transcended</td><td>—</td></tr>
              <tr><td>Werewolf</td><td>—</td><td>Adolescent</td><td>Mature</td><td>Elder</td><td>—</td></tr>
              <tr><td>Fey</td><td>—</td><td>Refugee</td><td>Official</td><td>—</td><td>High</td></tr>
            </tbody>
          </table>
          <p class="ref-note">Werewolves are one Rank higher when transformed.</p>
        </div>
        <div>
          <h4>XP per Rank (fulfill / seal / down)</h4>
          <table>
            <thead>
              <tr><th>Rank</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>
            </thead>
            <tbody>
              <tr><td>XP</td><td>1</td><td>2</td><td>5</td><td>10</td><td>20</td></tr>
            </tbody>
          </table>
          <p class="ref-note">
            Missions grant this on fulfillment; Connections on sealing; combat grants Rush equal
            to the adversary's Rank.
          </p>
        </div>
      </div>
    </details>
  </section>
</template>

<style scoped>
.tracks-page {
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

.meter-chips {
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

.new-track {
  margin-top: 1.25rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.75rem;
  background: var(--pico-card-background-color);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.kind-picker,
.rank-picker {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
}

.kind-btn,
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

.kind-btn.active,
.rank-btn.active {
  border-color: var(--pico-primary);
  color: var(--pico-primary);
  font-weight: 600;
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

.rank-label {
  font-size: 0.85rem;
  color: var(--pico-muted-color);
}

.rank-hint {
  font-size: 0.8rem;
  color: var(--pico-muted-color);
}

.combat-track {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin: 0;
}

.combat-track span {
  flex: 1;
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

.archived-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.5rem;
  flex-wrap: wrap;
}

.archived-title {
  font-weight: 600;
  flex: 1;
  min-width: 8rem;
}

.archived-meta {
  font-size: 0.82rem;
  color: var(--pico-muted-color);
}

.archived-actions {
  display: flex;
  gap: 0.4rem;
}

.danger {
  color: var(--pico-danger, #b03a2e);
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
