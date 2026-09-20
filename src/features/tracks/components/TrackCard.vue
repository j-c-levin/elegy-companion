<script setup lang="ts">
import { computed, ref } from 'vue'

import TrackBoxes from './TrackBoxes.vue'
import CombatBody from './CombatBody.vue'
import ConnectionBody from './ConnectionBody.vue'
import MissionBody from './MissionBody.vue'
import { KIND_LABEL, TOTAL_TICKS, TRACK_BOXES, progressScore } from '../types'
import type { Track } from '../types'
import * as store from '../store'

const props = defineProps<{ track: Track }>()

const editing = ref(false)
const titleDraft = ref('')
const confirmingDelete = ref(false)

const boxesDisabled = computed(() => {
  if (props.track.ticks >= TOTAL_TICKS) return true
  if (props.track.kind === 'connection') return props.track.sealed || props.track.dead
  return false
})

function startEdit(): void {
  titleDraft.value = props.track.title
  editing.value = true
}

function saveTitle(): void {
  store.renameTrack(props.track.id, titleDraft.value)
  editing.value = false
}

function setRank(event: Event): void {
  store.setTrackRank(props.track.id, Number((event.target as HTMLSelectElement).value))
}

function setTicks(ticks: number): void {
  store.setTicks(props.track.id, ticks)
}

function onDelete(): void {
  if (!confirmingDelete.value) {
    confirmingDelete.value = true
    return
  }
  store.removeTrack(props.track.id)
}
</script>

<template>
  <article class="track-card">
    <header class="track-head">
      <span class="kind-tag">{{ KIND_LABEL[track.kind] }}</span>
      <label class="rank-pick">
        Rank
        <select
          :value="track.rank"
          :aria-label="`Rank for ${track.title}`"
          @change="setRank"
        >
          <option v-for="r in 5" :key="r" :value="r">{{ r }}</option>
        </select>
      </label>
      <span class="tick-readout">
        {{ progressScore(track.ticks) }}/{{ TRACK_BOXES }} boxes · {{ track.ticks }}/{{ TOTAL_TICKS }} ticks
      </span>
    </header>

    <div class="title-row">
      <h3 v-if="!editing" class="title" @click="startEdit">{{ track.title }}</h3>
      <input
        v-else
        v-model="titleDraft"
        class="title-input"
        type="text"
        aria-label="Track title"
        @blur="saveTitle"
        @keyup.enter="saveTitle"
      />
      <div class="head-actions">
        <button
          type="button"
          class="ghost-btn small"
          @click="store.setTrackArchived(track.id, true)"
        >
          Archive
        </button>
        <button type="button" class="ghost-btn small danger" @click="onDelete">
          {{ confirmingDelete ? 'Confirm' : 'Delete' }}
        </button>
      </div>
    </div>

    <TrackBoxes :ticks="track.ticks" :disabled="boxesDisabled" @set="setTicks" />

    <MissionBody v-if="track.kind === 'mission'" :track="track" />
    <ConnectionBody v-else-if="track.kind === 'connection'" :track="track" />
    <CombatBody v-else :track="track" />
  </article>
</template>

<style scoped>
.track-card {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.75rem;
  padding: 1rem 1.1rem 1.1rem;
  background: var(--pico-card-background-color);
}

.track-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.kind-tag {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--pico-primary);
}

.rank-pick {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  margin: 0;
}

.rank-pick select {
  width: auto;
  margin-bottom: 0;
  padding: 0.25rem 1.6rem 0.25rem 0.5rem;
  font-size: 0.85rem;
}

.tick-readout {
  margin-left: auto;
  font-size: 0.82rem;
  color: var(--pico-muted-color);
  font-variant-numeric: tabular-nums;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-block: 0.55rem 0.75rem;
}

.title {
  margin: 0;
  cursor: text;
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.title-input {
  flex: 1;
  margin-bottom: 0;
}

.head-actions {
  display: flex;
  gap: 0.4rem;
}

.danger {
  color: var(--pico-danger, #b03a2e);
}
</style>
