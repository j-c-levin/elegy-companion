<script setup lang="ts">
import { ref } from 'vue'

import { game, updateGame, type CharacterIdentity } from '@/store'

type TextField = Exclude<keyof CharacterIdentity, 'possessions'>

const fields: { key: TextField; label: string; hint?: string }[] = [
  { key: 'name', label: 'Name', hint: 'The name you answer to in death; it may not be the one you had in life.' },
  { key: 'apparentAge', label: 'Apparent age', hint: 'The age you will look like forever.' },
  { key: 'realAge', label: 'Real age', hint: 'How long have you existed?' },
  { key: 'occupation', label: 'Occupation in life', hint: 'What was your job in life?' },
  { key: 'look', label: 'Look and vibes', hint: 'How you present yourself; first impression you give.' },
  { key: 'progenitor', label: 'Progenitor', hint: 'The vampire who turned you.' },
  { key: 'home', label: 'Home', hint: 'Where you live and sleep by day.' },
]

const newPossession = ref('')

function setField(field: TextField, value: string): void {
  updateGame((draft) => {
    draft.identity[field] = value
  })
}

function addPossession(): void {
  const text = newPossession.value.trim()
  if (!text) return
  updateGame((draft) => {
    draft.identity.possessions.push(text)
  })
  newPossession.value = ''
}

function removePossession(index: number): void {
  updateGame((draft) => {
    draft.identity.possessions.splice(index, 1)
  })
}
</script>

<template>
  <section aria-labelledby="identity-heading">
    <h2 id="identity-heading">Identity</h2>
    <p class="cite">manual 174–190</p>
    <div class="identity-grid">
      <label v-for="field in fields" :key="field.key">
        {{ field.label }}
        <input
          :model-value="game.identity[field.key]"
          type="text"
          :placeholder="field.hint"
          @update:model-value="setField(field.key, $event)"
        />
      </label>
    </div>
    <fieldset>
      <legend>Possessions</legend>
      <ul class="possession-list">
        <li v-for="(possession, index) in game.identity.possessions" :key="possession + index">
          <span>{{ possession }}</span>
          <button type="button" class="outline remove-btn" @click="removePossession(index)">Remove</button>
        </li>
      </ul>
      <form class="possession-add" @submit.prevent="addPossession">
        <input
          v-model="newPossession"
          type="text"
          placeholder="An important thing you own"
          aria-label="New possession"
        />
        <button type="submit">Add</button>
      </form>
    </fieldset>
  </section>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}

.identity-grid {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

@media (min-width: 720px) {
  .identity-grid {
    grid-template-columns: repeat(2, 1fr);
  }
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
</style>
