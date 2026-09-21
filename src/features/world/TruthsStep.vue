<script setup lang="ts">
import { computed, ref } from 'vue'

import ManualRef from '@/components/ManualRef.vue'

import truthsData from '@/data/truths.json'
import {
  chooseTruth,
  customTruthText,
  setCustomTruth,
  worldDraft,
} from './draft'
import { TRUTH_IDS, type TruthId } from './world'

interface TruthOption {
  id: string
  label: string
  summary: string
}

interface TruthCategory {
  id: TruthId
  title: string
  prompt: string
  options: TruthOption[]
}

interface RawTruthCategory {
  id: string
  title: string
  prompt: string
  options: TruthOption[]
}

const RAW_CATEGORIES = (truthsData as { categories: RawTruthCategory[] }).categories

const CATEGORIES: TruthCategory[] = TRUTH_IDS.flatMap((id) => {
  const raw = RAW_CATEGORIES.find((category) => category.id === id)
  return raw ? [{ ...raw, id }] : []
})

const TRUTH_REF_KEYS: Record<TruthId, string> = {
  'origins': 'truths-origins',
  'innate-powers': 'truths-innate-powers',
  'population': 'truths-population',
  'political-landscape': 'truths-political-landscape',
  'loyalty': 'truths-loyalty',
  'hunting-territory': 'truths-hunting-territory',
  'sunlight': 'truths-sunlight',
  'district-access': 'truths-district-access',
  'witches': 'truths-witches',
  'hunters': 'truths-hunters',
  'werewolves': 'truths-werewolves',
  'fey': 'truths-fey',
}

const world = worldDraft()

const customOpen = ref<Record<string, boolean>>({})

const chosenCount = computed(() => TRUTH_IDS.filter((id) => world.truths[id] !== '').length)

function isCustomActive(id: TruthId): boolean {
  return world.truths[id].startsWith('custom:') || !!customOpen.value[id]
}

function selectOption(category: TruthCategory, option: TruthOption): void {
  customOpen.value[category.id] = false
  chooseTruth(category.id, world.truths[category.id] === option.id ? '' : option.id)
}

function openCustom(category: TruthCategory): void {
  if (!world.truths[category.id].startsWith('custom:')) chooseTruth(category.id, '')
  customOpen.value[category.id] = true
}

function onCustomInput(id: TruthId, event: Event): void {
  setCustomTruth(id, (event.target as HTMLInputElement).value)
}

function customSlotValue(id: TruthId): string {
  return customTruthText(id)
}
</script>

<template>
  <section aria-labelledby="truths-heading">
    <div class="step-head">
      <h2 id="truths-heading">Truths</h2>
      <span class="progress">{{ chosenCount }} / {{ TRUTH_IDS.length }} chosen</span>
    </div>
    <p class="lede">
      Pick one option per category to make it true in your vampire world; your choices set the
      background and tone of your stories. If none fit, use “Other” to create your own (manual
      1491–1627).
    </p>

    <article v-for="category in CATEGORIES" :key="category.id" class="truth-card">
      <header class="truth-head">
        <h3>{{ category.title }} <ManualRef :ref-key="TRUTH_REF_KEYS[category.id]" /></h3>
        <p class="prompt">{{ category.prompt }}</p>
      </header>
      <div class="options" role="group" :aria-label="category.title">
        <button
          v-for="option in category.options"
          :key="option.id"
          type="button"
          class="option"
          :class="{ selected: !isCustomActive(category.id) && world.truths[category.id] === option.id }"
          :aria-pressed="!isCustomActive(category.id) && world.truths[category.id] === option.id"
          @click="selectOption(category, option)"
        >
          <span class="option-label">{{ option.label }}</span>
          <span class="option-summary">{{ option.summary }}</span>
        </button>
        <button
          type="button"
          class="option other"
          :class="{ selected: isCustomActive(category.id) }"
          :aria-pressed="isCustomActive(category.id)"
          @click="openCustom(category)"
        >
          <span class="option-label">Other — create your own</span>
          <span v-if="customTruthText(category.id) && !isCustomActive(category.id)" class="option-summary">
            {{ customTruthText(category.id) }}
          </span>
        </button>
      </div>
      <div v-if="isCustomActive(category.id)" class="custom-slot">
        <label :for="`custom-${category.id}`">Your truth for {{ category.title }}</label>
        <input
          :id="`custom-${category.id}`"
          type="text"
          :value="customSlotValue(category.id)"
          placeholder="Write your own truth"
          autocomplete="off"
          @input="onCustomInput(category.id, $event)"
        />
      </div>
    </article>
  </section>
</template>

<style scoped>
.step-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.progress {
  color: var(--pico-muted-color);
  font-size: 0.9rem;
}

.lede {
  color: var(--pico-muted-color);
  margin-bottom: 1.25rem;
}

.truth-card {
  margin-bottom: 1.1rem;
}

.truth-head h3 {
  margin-bottom: 0.2rem;
}

.prompt {
  color: var(--pico-muted-color);
  margin: 0 0 0.7rem;
  font-size: 0.95rem;
}

.options {
  display: grid;
  gap: 0.55rem;
}

@media (min-width: 720px) {
  .options {
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  }
}

.option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  margin: 0;
  padding: 0.7rem 0.85rem;
  min-height: 2.9rem;
  text-align: left;
  font-weight: 400;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.6rem;
  background: var(--pico-card-background-color);
  cursor: pointer;
}

.option:hover {
  border-color: var(--pico-primary);
}

.option.selected {
  border-color: var(--pico-primary);
  background: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
}

.option.selected .option-summary {
  color: var(--pico-primary-inverse);
  opacity: 0.85;
}

.option.other {
  border-style: dashed;
}

.option-label {
  font-weight: 600;
}

.option-summary {
  color: var(--pico-muted-color);
  font-size: 0.82rem;
  line-height: 1.4;
}

.custom-slot {
  margin-top: 0.6rem;
}

.custom-slot label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}
</style>
