<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

import ManualRef from '@/components/ManualRef.vue'
import { getTable } from '@/features/oracles/roll'
import { loadWorld } from '@/features/world/world'
import truthsData from '@/data/truths.json'

import RollField from '../RollField.vue'
import type { StepEmits, StepProps } from '../steps'

const props = defineProps<StepProps>()
const emit = defineEmits<StepEmits>()

const GIFT_TABLE = 'vampire-power'
const MYSTERY_TABLE = 'mystery'
const MAX_POWERS = 3

type PowerKind = 'gift' | 'mystery'

interface PowerSlot {
  kind: PowerKind
  value: string
}

const truthCategory = truthsData.categories.find((category) => category.id === 'innate-powers')
const truthId = loadWorld().truths['innate-powers']
const chosenTruth = truthCategory?.options.find((option) => option.id === truthId) ?? null

function buildSlots(): PowerSlot[] {
  const list: PowerSlot[] = props.draft.mysteries.map((value) => ({ kind: 'mystery', value }))
  for (const value of props.draft.gifts) list.push({ kind: 'gift', value })
  while (list.length < MAX_POWERS) list.push({ kind: 'gift', value: '' })
  return list.slice(0, MAX_POWERS)
}

const slots = ref<PowerSlot[]>(buildSlots())

function write(): void {
  emit('patch', {
    gifts: slots.value.filter((slot) => slot.kind === 'gift').map((slot) => slot.value),
    mysteries: slots.value.filter((slot) => slot.kind === 'mystery').map((slot) => slot.value),
  })
}

function setValue(index: number, value: string): void {
  slots.value = slots.value.map((slot, i) => (i === index ? { ...slot, value } : slot))
  write()
}

function exchange(index: number): void {
  slots.value = slots.value.map((slot, i) =>
    i === index ? { kind: slot.kind === 'gift' ? 'mystery' : 'gift', value: '' } : slot,
  )
  write()
}

function takenNames(index: number): string[] {
  return slots.value
    .filter((slot, i) => i !== index && slot.value)
    .map((slot) => slot.value)
}

function optionsFor(slot: PowerSlot, index: number): { name: string; disabled: boolean }[] {
  const names = slot.kind === 'gift'
    ? getTable(GIFT_TABLE)?.rows.map((row) => row.label) ?? []
    : getTable(MYSTERY_TABLE)?.rows.map((row) => row.label) ?? []
  const taken = new Set(takenNames(index))
  return names.map((name) => ({ name, disabled: taken.has(name) }))
}

function allowFresh(index: number): (name: string) => boolean {
  const taken = new Set(takenNames(index))
  return (name: string) => !taken.has(name)
}
</script>

<template>
  <section aria-labelledby="step-gifts">
    <h2 id="step-gifts">
      Innate Gifts
      <ManualRef ref-key="creation-gifts" />
    </h2>
    <p class="cite">
      Three innate Gifts helped you survive and thrive: pick them, roll for them, or both (manual
      1787–1794 <ManualRef ref-key="creation-gifts" />).
    </p>

    <article class="truth-card">
      <h3>
        Your powers and blight follow your Truth
        <ManualRef ref-key="truths-innate-powers" />
      </h3>
      <template v-if="chosenTruth">
        <p class="truth-label">{{ chosenTruth.label }}</p>
        <p class="truth-summary">{{ chosenTruth.summary }}</p>
      </template>
      <p v-else>
        No innate-powers Truth is set in your world yet. Choose your Truths in
        <RouterLink to="/world">World Creation</RouterLink> first — this step prefill follows
        that Truth (manual 1492–1510).
      </p>
      <p class="truth-note">
        Blights are abnormal vampiric weaknesses developed through inhuman deeds (manual
        1449–1455).
      </p>
    </article>

    <div v-for="(slot, index) in slots" :key="index" class="power-slot">
      <h3>
        Power {{ index + 1 }}
        <span class="kind">{{ slot.kind === 'gift' ? 'Gift' : 'Mystery' }}</span>
      </h3>
      <select
        :value="slot.value"
        :aria-label="`Power ${index + 1}: ${slot.kind === 'gift' ? 'Gift' : 'Mystery'}`"
        @change="setValue(index, ($event.target as HTMLSelectElement).value)"
      >
        <option value="">Choose a {{ slot.kind }}…</option>
        <option
          v-for="option in optionsFor(slot, index)"
          :key="option.name"
          :value="option.name"
          :disabled="option.disabled"
        >
          {{ option.name }}
        </option>
      </select>
      <RollField
        :table-id="slot.kind === 'gift' ? GIFT_TABLE : MYSTERY_TABLE"
        :allow="allowFresh(index)"
        @apply="setValue(index, $event)"
      />
      <button type="button" class="outline exchange-btn" @click="exchange(index)">
        {{ slot.kind === 'gift' ? 'Exchange for a Mystery' : 'Restore as a Gift' }}
      </button>
    </div>

    <p class="magic-note">
      Optional magic: exchange any innate Gift for a Mystery, one for one, up to 3 (manual
      1880–1887 <ManualRef ref-key="creation-magic" />). Replaced Gifts stay dormant and can be
      awakened later with XP.
    </p>
  </section>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}

.truth-card {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  margin-bottom: 1.1rem;
  background: var(--pico-card-background-color);
}

.truth-card h3 {
  font-size: 1rem;
  margin-bottom: 0.4rem;
}

.truth-card p {
  margin-bottom: 0.4rem;
}

.truth-label {
  font-weight: 600;
}

.truth-summary {
  font-size: 0.92rem;
}

.truth-note {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin-bottom: 0;
}

.power-slot {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  margin-bottom: 0.9rem;
}

.power-slot h3 {
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.kind {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
  font-weight: 400;
}

.power-slot select {
  width: 100%;
}

.exchange-btn {
  min-height: 2.6rem;
  width: 100%;
  font-size: 0.9rem;
}

.magic-note {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}
</style>
