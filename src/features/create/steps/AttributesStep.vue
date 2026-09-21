<script setup lang="ts">
import { computed } from 'vue'

import ManualRef from '@/components/ManualRef.vue'
import { ATTRIBUTE_KEYS, type AttributeKey } from '@/store'
import { ATTRIBUTE_SPREAD, hasValidAttributeSpread } from '../draft'
import type { StepEmits, StepProps } from '../steps'

const props = defineProps<StepProps>()
const emit = defineEmits<StepEmits>()

const INFO: Record<AttributeKey, string> = {
  body: 'Strength, endurance, agility; combat and resisting harm.',
  mind: 'Intelligence, perception, resolve; research and resisting despair.',
  charm: 'Charisma, composure, persuasion; influencing others.',
  soul: 'Empathy and remaining humanity; resisting impulses.',
}

function assign(key: AttributeKey, value: number): void {
  emit('patch', { attributes: { ...props.draft.attributes, [key]: value } })
}

const pool = computed<number[]>(() => {
  const remaining = [...ATTRIBUTE_SPREAD]
  for (const key of ATTRIBUTE_KEYS) {
    const value = props.draft.attributes[key]
    if (value > 0) {
      const at = remaining.indexOf(value)
      if (at !== -1) remaining.splice(at, 1)
    }
  }
  return remaining.sort((a, b) => b - a)
})

const placedCount = computed(() => ATTRIBUTE_SPREAD.length - pool.value.length)
const valid = computed(() => hasValidAttributeSpread(props.draft.attributes))
</script>

<template>
  <section aria-labelledby="step-attributes">
    <h2 id="step-attributes">
      Attributes
      <ManualRef ref-key="creation-attributes" />
    </h2>
    <p class="cite">
      Distribute +3, +2, +2, +1 across Body, Mind, Charm and Soul; the higher the score, the more
      likely you succeed in related actions (manual 1942–1946
      <ManualRef ref-key="attributes-create" />).
    </p>

    <p class="pool" role="status">
      <template v-if="valid">Spread set: +3/+2/+2/+1</template>
      <template v-else-if="pool.length">
        Still to place: {{ pool.join(', ') }} ({{ placedCount }} of 4 placed)
      </template>
    </p>

    <div v-for="key in ATTRIBUTE_KEYS" :key="key" class="attr-row">
      <div class="attr-head">
        <h3>{{ key[0].toUpperCase() + key.slice(1) }}</h3>
        <span class="attr-value" :class="{ unset: props.draft.attributes[key] === 0 }">
          {{ props.draft.attributes[key] === 0 ? '—' : `+${props.draft.attributes[key]}` }}
        </span>
      </div>
      <p class="attr-info">{{ INFO[key] }}</p>
      <select
        :value="props.draft.attributes[key]"
        :aria-label="`Value for ${key}`"
        @change="assign(key, Number(($event.target as HTMLSelectElement).value))"
      >
        <option :value="0">Not set</option>
        <option :value="3" :disabled="!pool.includes(3) && props.draft.attributes[key] !== 3">+3</option>
        <option :value="2" :disabled="!pool.includes(2) && props.draft.attributes[key] !== 2">+2</option>
        <option :value="1" :disabled="!pool.includes(1) && props.draft.attributes[key] !== 1">+1</option>
      </select>
    </div>
  </section>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}

.pool {
  font-weight: 600;
  font-size: 0.9rem;
}

.attr-row {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  margin-bottom: 0.9rem;
}

.attr-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.attr-head h3 {
  margin: 0;
  font-size: 1rem;
}

.attr-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--pico-primary);
  font-variant-numeric: tabular-nums;
}

.attr-value.unset {
  color: var(--pico-muted-color);
  font-weight: 400;
}

.attr-row p {
  margin-bottom: 0.5rem;
}

.attr-info {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}

.attr-row select {
  width: 100%;
}
</style>
