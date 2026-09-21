<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import { game } from '@/store'
import ManualRef from '@/components/ManualRef.vue'
import { discardLooseEnd, tieLooseEnd, writeLooseEnd } from './loose-ends'

const openEnds = computed(() => game.lists['loose-ends'] ?? [])
const tiedEnds = computed(() => game.lists['loose-ends-tied'] ?? [])

const question = ref('')
const confirmingId = ref<string | null>(null)
let confirmTimer: number | undefined

function submitQuestion(): void {
  const text = question.value.trim()
  if (!text) return
  writeLooseEnd(text)
  question.value = ''
}

function tie(endId: string): void {
  cancelConfirm()
  tieLooseEnd(endId)
}

function drop(endId: string): void {
  if (confirmingId.value === endId) {
    cancelConfirm()
    discardLooseEnd(endId)
    return
  }
  cancelConfirm()
  confirmingId.value = endId
  confirmTimer = window.setTimeout(() => {
    confirmingId.value = null
  }, 4000)
}

function cancelConfirm(): void {
  window.clearTimeout(confirmTimer)
  confirmingId.value = null
}

onBeforeUnmount(cancelConfirm)
</script>

<template>
  <section aria-labelledby="loose-ends-heading">
    <h2 id="loose-ends-heading">Loose Ends</h2>
    <p class="lede">
      Unresolved threads and questions from play. When you slumber, write a lingering question as a
      Loose End; when you solve it, mark it Tied and gain 1 XP (manual 1147–1155
      <ManualRef ref-key="loose-ends" />). A Loose End usually needs no full Mission — if one does,
      take XP for both.
    </p>

    <form class="write-form" @submit.prevent="submitQuestion">
      <input
        v-model="question"
        type="text"
        maxlength="200"
        placeholder="A question the night left behind"
        aria-label="New loose end"
      />
      <button type="submit" :disabled="!question.trim()">Write it</button>
    </form>
    <p class="write-hint">
      Written when you slumber (manual 1150–1152
      <ManualRef ref-key="loose-end-write" label="Writing a Loose End" />). The night log adds its
      questions here too.
    </p>

    <h3 class="list-title">
      Open <span class="count">{{ openEnds.length }}</span>
    </h3>
    <p v-if="openEnds.length === 0" class="empty">Nothing unresolved. Sleep on it.</p>
    <ul v-else class="end-list">
      <li v-for="end in openEnds" :key="end.id">
        <span class="end-text">{{ end.text }}</span>
        <span class="end-actions">
          <button type="button" @click="tie(end.id)">Tied (+1 XP)</button>
          <button
            type="button"
            class="drop-btn"
            :class="{ confirming: confirmingId === end.id }"
            :aria-label="confirmingId === end.id ? 'Confirm dropping this loose end' : 'Drop this loose end'"
            @click="drop(end.id)"
          >
            {{ confirmingId === end.id ? 'Sure?' : 'Drop' }}
          </button>
        </span>
      </li>
    </ul>

    <details class="tied" :open="tiedEnds.length > 0">
      <summary>Tied loose ends ({{ tiedEnds.length }})</summary>
      <p v-if="tiedEnds.length === 0" class="empty">None yet.</p>
      <ul v-else class="end-list tied-list">
        <li v-for="end in tiedEnds" :key="end.id" class="tied-row">
          <span class="end-text">{{ end.text }}</span>
        </li>
      </ul>
    </details>
  </section>
</template>

<style scoped>
.lede {
  color: var(--pico-muted-color);
  margin-bottom: 1rem;
}

.write-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.write-form input {
  margin-bottom: 0;
  flex: 1 1 14rem;
}

.write-form button {
  margin-bottom: 0;
  white-space: nowrap;
}

.write-hint {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
  margin-bottom: 1.25rem;
}

.list-title {
  font-size: 1rem;
  margin-bottom: 0.6rem;
}

.count {
  color: var(--pico-primary);
}

.empty {
  color: var(--pico-muted-color);
  font-style: italic;
}

.end-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.end-list li {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--pico-muted-border-color);
}

.end-text {
  flex: 1 1 12rem;
  overflow-wrap: anywhere;
}

.end-actions {
  display: flex;
  flex-shrink: 0;
  gap: 0.4rem;
}

.end-actions button {
  margin-bottom: 0;
  padding: 0.35rem 0.7rem;
  font-size: 0.85rem;
  white-space: nowrap;
}

.drop-btn.confirming {
  border-color: var(--pico-danger);
  color: var(--pico-danger);
}

.tied {
  margin-top: 1rem;
}

.tied summary {
  cursor: pointer;
}

.tied-list {
  margin-top: 0.6rem;
}

.tied-row {
  color: var(--pico-muted-color);
}
</style>
