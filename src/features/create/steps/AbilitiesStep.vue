<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import ManualRef from '@/components/ManualRef.vue'
import { getTable } from '@/features/oracles/roll'
import type { OracleRow } from '@/features/oracles/types'

import RollField from '../RollField.vue'
import type { StepEmits, StepProps } from '../steps'

const props = defineProps<StepProps>()
const emit = defineEmits<StepEmits>()

const ASPECT_TABLE = 'expertises-edges'
const EXPERTISE_RANGE_MAX = 85

type AspectType = 'Expertise' | 'Edge'

interface AspectOption {
  name: string
  type: AspectType
}

const allAspects: AspectOption[] = (getTable(ASPECT_TABLE)?.rows ?? []).map((row: OracleRow) => ({
  name: row.label,
  type: row.min <= EXPERTISE_RANGE_MAX ? 'Expertise' : 'Edge',
}))

const typeByName = new Map(allAspects.map((aspect) => [aspect.name, aspect.type]))

interface SlotDef {
  title: string
  hint: string
  allowed: AspectType[]
}

const SLOT_DEFS: SlotDef[] = [
  {
    title: 'Main talent in life',
    hint: 'One Expertise, likely fundamental to her career',
    allowed: ['Expertise'],
  },
  {
    title: 'Served her well in life',
    hint: 'One Expertise or Edge that remains very useful in undeath',
    allowed: ['Expertise', 'Edge'],
  },
  {
    title: 'Survival in undeath',
    hint: 'One Expertise or Edge compensating for her shortcomings',
    allowed: ['Expertise', 'Edge'],
  },
]

const slots = computed(() =>
  SLOT_DEFS.map((def, index) => ({
    ...def,
    index,
    value: props.draft.aspects[index] ?? '',
  })),
)

function setValue(index: number, value: string): void {
  const aspects = [...props.draft.aspects]
  while (aspects.length < SLOT_DEFS.length) aspects.push('')
  aspects[index] = value
  emit('patch', { aspects })
}

function takenNames(index: number): string[] {
  return props.draft.aspects.filter((_, i) => i !== index)
}

function optionsFor(index: number): AspectOption[] {
  const taken = new Set(takenNames(index))
  const allowedType = SLOT_DEFS[index]!.allowed
  return allAspects.filter((aspect) => allowedType.includes(aspect.type) && !taken.has(aspect.name))
}

function allowAllowedType(index: number): (name: string) => boolean {
  const allowedType = SLOT_DEFS[index]!.allowed
  const taken = new Set(takenNames(index))
  return (name: string) => {
    const type = typeByName.get(name)
    return type !== undefined && allowedType.includes(type) && !taken.has(name)
  }
}
</script>

<template>
  <section aria-labelledby="step-abilities">
    <h2 id="step-abilities">
      Starting Abilities
      <ManualRef ref-key="creation-skills" />
    </h2>
    <p class="cite">
      Pick three Aspects: an Expertise main talent, then two more Expertises or Edges (manual
      1825–1844 <ManualRef ref-key="creation-skills" />). Ability text lives in the
      <RouterLink to="/aspects">Aspect Database</RouterLink> — note each Aspect's starting
      ability on your sheet (manual 2052, 2090–2107 <ManualRef ref-key="starting-abilities" />).
    </p>

    <div v-for="slot in slots" :key="slot.index" class="ability-slot">
      <h3>{{ slot.title }}</h3>
      <p class="hint">{{ slot.hint }}</p>
      <select
        :value="slot.value"
        :aria-label="slot.title"
        @change="setValue(slot.index, ($event.target as HTMLSelectElement).value)"
      >
        <option value="">Choose an Aspect…</option>
        <option v-for="option in optionsFor(slot.index)" :key="option.name" :value="option.name">
          {{ option.name }} — {{ option.type }}
        </option>
      </select>
      <RollField :table-id="ASPECT_TABLE" :allow="allowAllowedType(slot.index)" @apply="setValue(slot.index, $event)" />
    </div>
  </section>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}

.ability-slot {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  margin-bottom: 0.9rem;
}

.ability-slot h3 {
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.hint {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.ability-slot select {
  width: 100%;
}
</style>
