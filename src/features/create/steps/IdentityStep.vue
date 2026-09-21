<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

import ManualRef from '@/components/ManualRef.vue'

import DraftField from '../DraftField.vue'
import RollField from '../RollField.vue'
import type { StepEmits, StepProps } from '../steps'

const props = defineProps<StepProps>()
const emit = defineEmits<StepEmits>()

function setName(value: string): void {
  emit('patch', { name: value })
}

function setLook(value: string): void {
  emit('patch', { look: value })
}

function setHome(value: string): void {
  emit('patch', { home: value })
}

function setRelationship(index: number, value: string): void {
  const relationships = [...props.draft.relationships]
  while (relationships.length < 2) relationships.push('')
  relationships[index] = value
  emit('patch', { relationships })
}

const newPossession = ref('')

function addPossession(): void {
  const text = newPossession.value.trim()
  if (!text) return
  emit('patch', { possessions: [...props.draft.possessions, text] })
  newPossession.value = ''
}

function removePossession(index: number): void {
  emit('patch', { possessions: props.draft.possessions.filter((_, i) => i !== index) })
}
</script>

<template>
  <section aria-labelledby="step-identity">
    <h2 id="step-identity">
      Identity and Finishing Touches
      <ManualRef ref-key="creation-identity" />
    </h2>
    <p class="cite">
      Fill in looks and vibe, possessions, name and home (manual 1966–1979
      <ManualRef ref-key="creation-identity" />).
    </p>

    <DraftField
      label="Name"
      placeholder="The name you go by in death"
      :model-value="draft.name"
      @update="setName"
    />
    <DraftField
      label="Looks and vibe"
      placeholder="Appearance, demeanor, first impression"
      :model-value="draft.look"
      @update="setLook"
    />
    <DraftField
      label="Home"
      placeholder="Where you sleep, safe from the sun"
      :model-value="draft.home"
      @update="setHome"
    />
    <RollField table-id="vampire-home" @apply="setHome" />

    <fieldset>
      <legend>Possessions</legend>
      <ul class="possession-list">
        <li v-for="(possession, index) in draft.possessions" :key="possession + index">
          <span>{{ possession }}</span>
          <button type="button" class="outline remove-btn" @click="removePossession(index)">Remove</button>
        </li>
      </ul>
      <form class="possession-add" @submit.prevent="addPossession">
        <input v-model="newPossession" type="text" placeholder="An important thing you own" aria-label="New possession" />
        <button type="submit">Add</button>
      </form>
    </fieldset>

    <fieldset>
      <legend>
        Relationships
        <ManualRef ref-key="creation-relationships" />
      </legend>
      <p class="hint">
        You begin with two Connections; one must be your mentor, likely your progenitor (manual
        1880–1900). Rank them when you add them to the
        <RouterLink to="/connections">Connections</RouterLink> tool after committing.
      </p>
      <DraftField
        label="Connection 1 — mentor or progenitor"
        placeholder="Name and who they are"
        :model-value="draft.relationships[0] ?? ''"
        @update="(value: string) => setRelationship(0, value)"
      />
      <DraftField
        label="Connection 2"
        placeholder="A valued relationship"
        :model-value="draft.relationships[1] ?? ''"
        @update="(value: string) => setRelationship(1, value)"
      />
    </fieldset>

    <article class="finishing-card">
      <h3>
        Finishing touches
        <ManualRef ref-key="creation-finishing" />
      </h3>
      <p>
        Set at commit: Max Rush 10, Base and current Rush 2, Health and Clarity 5, Blood 4 (manual
        2047–2055 <ManualRef ref-key="creation-finishing" />).
      </p>
      <p>
        XP lives in the <RouterLink to="/session?view=xp">Session</RouterLink> tool: tally in
        5-mark units, spend 10 to upgrade or 15 to acquire an Aspect (manual 1161–1187
        <ManualRef ref-key="xp-tallies" />).
      </p>
    </article>
  </section>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}

.hint {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}

.possession-list {
  list-style: none;
  padding: 0;
  margin: 0 0 0.6rem;
}

.possession-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 0;
  border-bottom: 1px solid var(--pico-muted-border-color);
}

.remove-btn {
  flex-shrink: 0;
}

.possession-add {
  display: flex;
  gap: 0.6rem;
}

.possession-add input {
  margin-bottom: 0;
  flex: 1;
}

.possession-add button {
  margin-bottom: 0;
  white-space: nowrap;
}

.finishing-card {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  margin-top: 1.1rem;
  background: var(--pico-card-background-color);
}

.finishing-card h3 {
  font-size: 1rem;
  margin-bottom: 0.4rem;
}

.finishing-card p {
  margin-bottom: 0.5rem;
  font-size: 0.92rem;
}

.finishing-card p:last-child {
  margin-bottom: 0;
}
</style>
