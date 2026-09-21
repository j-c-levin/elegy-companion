<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

import { addNpc, updateNpc } from './store'
import {
  CREATURE_TYPES,
  CREATURE_TYPE_LABELS,
  pulseMax,
  rankLabel,
  transformedRank,
  type CreatureType,
  type Npc,
  type Rank,
} from './types'

const props = defineProps<{ editing: Npc | null; preset: { type: CreatureType; rank: Rank } }>()

const emit = defineEmits<{ save: []; cancel: [] }>()

const form = reactive<{
  name: string
  type: CreatureType
  rank: Rank
  hasPulse: boolean
  pulse: number
  notes: string
}>({
  name: '',
  type: 'mortal',
  rank: 1,
  hasPulse: false,
  pulse: 3,
  notes: '',
})

function loadFromProps(): void {
  const npc = props.editing
  if (npc) {
    form.name = npc.name
    form.type = npc.type
    form.rank = npc.rank
    form.hasPulse = npc.pulse !== null
    form.pulse = npc.pulse ?? pulseMax(npc.rank)
    form.notes = npc.notes
    return
  }
  form.name = ''
  form.type = props.preset.type
  form.rank = props.preset.rank
  form.hasPulse = false
  form.pulse = pulseMax(props.preset.rank)
  form.notes = ''
}

watch([() => props.editing, () => props.preset], loadFromProps, {
  deep: true,
  immediate: true,
})

const commonTitle = computed(() => rankLabel(form.type, form.rank))
const effectiveRank = computed(() => transformedRank(form.type, form.rank))
const maxPulse = computed(() => pulseMax(form.rank))

function clampPulse(): void {
  form.pulse = Math.min(Math.max(0, Math.round(form.pulse)), maxPulse.value)
}

watch([() => form.rank, () => form.type], () => {
  clampPulse()
})

function submit(): void {
  const payload = {
    name: form.name,
    type: form.type,
    rank: form.rank,
    pulse: form.hasPulse ? form.pulse : null,
    notes: form.notes,
  }
  if (props.editing) {
    updateNpc(props.editing.id, payload)
  } else {
    addNpc(payload)
  }
  loadFromProps()
  emit('save')
}

function cancel(): void {
  emit('cancel')
}
</script>

<template>
  <form class="npc-form" @submit.prevent="submit">
    <label for="npc-name">Name</label>
    <input
      id="npc-name"
      v-model="form.name"
      type="text"
      placeholder="Who are they?"
      autocomplete="off"
    />

    <div class="row">
      <div class="field">
        <label for="npc-type">Creature type</label>
        <select id="npc-type" v-model="form.type">
          <option v-for="type in CREATURE_TYPES" :key="type" :value="type">
            {{ CREATURE_TYPE_LABELS[type] }}
          </option>
        </select>
      </div>
      <div class="row">
        <span class="field-label">Rank</span>
        <div class="stepper">
          <button type="button" aria-label="Decrease Rank" :disabled="form.rank <= 1" @click="form.rank -= 1">−</button>
          <span class="step-value">{{ form.rank }}</span>
          <button type="button" aria-label="Increase Rank" :disabled="form.rank >= 5" @click="form.rank += 1">+</button>
        </div>
      </div>
    </div>

    <p class="hint">
      <template v-if="commonTitle">Common for {{ CREATURE_TYPE_LABELS[form.type] }} Rank {{ form.rank }}: {{ commonTitle }}</template>
      <template v-else>No common-rank title for {{ CREATURE_TYPE_LABELS[form.type] }} Rank {{ form.rank }} — custom is fine (4299–4302)</template>
      <template v-if="effectiveRank !== form.rank">
        — effective Rank {{ effectiveRank }} while transformed (1008)
      </template>
    </p>

    <div class="row pulse-row">
      <label class="toggle">
        <input v-model="form.hasPulse" type="checkbox" role="switch" />
        <span>Track Pulse (Connection NPCs in dangerous missions, 4303–4305)</span>
      </label>
      <div v-if="form.hasPulse" class="stepper">
        <button type="button" aria-label="Decrease Pulse" :disabled="form.pulse <= 0" @click="form.pulse -= 1">−</button>
        <span class="step-value">{{ form.pulse }}</span>
        <button type="button" aria-label="Increase Pulse" :disabled="form.pulse >= maxPulse" @click="form.pulse += 1">+</button>
      </div>
    </div>
    <p v-if="form.hasPulse" class="hint">Pulse starts at Rank + 2 = {{ maxPulse }} (1060–1062).</p>

    <label for="npc-notes">Notes</label>
    <textarea
      id="npc-notes"
      v-model="form.notes"
      rows="3"
      placeholder="Drives, Means, where to find them, which combat track they belong to…"
    ></textarea>

    <div class="actions">
      <button type="submit">{{ editing ? 'Save changes' : 'Add to roster' }}</button>
      <button v-if="editing" type="button" class="ghost" @click="cancel">Cancel</button>
    </div>
  </form>
</template>

<style scoped>
.npc-form label,
.field-label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.row > div:first-child {
  min-width: 12rem;
  flex: 1;
}

.stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.stepper button {
  width: 2.6rem;
  height: 2.6rem;
  padding: 0;
  margin: 0;
  font-size: 1.2rem;
  line-height: 1;
}

.step-value {
  min-width: 1.6rem;
  text-align: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.hint {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin-block: 0.35rem 0.6rem;
}

.pulse-row {
  align-items: center;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 400;
  font-size: 0.95rem;
}

.toggle input {
  margin: 0;
  flex-shrink: 0;
}

textarea {
  resize: vertical;
}

.actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.75rem;
}

.actions button {
  margin: 0;
}

.ghost {
  background: transparent;
  color: var(--pico-muted-color);
  border: 1px solid var(--pico-muted-border-color);
}
</style>
