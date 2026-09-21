<script setup lang="ts">
import { computed, ref } from 'vue'

import { rollFor, type RollInspiration } from './rolls'

const props = defineProps<{
  tableId: string
  inspirationOnly?: boolean
  allow?: (text: string) => boolean
}>()

const emit = defineEmits<{ apply: [text: string] }>()

const roll = ref<RollInspiration | null>(null)

function doRoll(): void {
  roll.value = rollFor(props.tableId)
}

const canApply = computed(() =>
  !props.inspirationOnly &&
  (roll.value ? (props.allow?.(roll.value.text) ?? true) : false),
)
</script>

<template>
  <div class="roll-field">
    <button type="button" class="outline roll-btn" @click="doRoll">
      {{ roll ? 'Roll again' : 'Roll for inspiration' }}
    </button>
    <p v-if="roll" class="roll-line" role="status">
      <span class="roll-die">{{ roll.rollLabel }}</span>
      {{ roll.text }}
      <span class="roll-table">({{ roll.tableTitle }})</span>
    </p>
    <button v-if="roll && canApply" type="button" class="apply-btn" @click="emit('apply', roll.text)">
      Use this
    </button>
  </div>
</template>

<style scoped>
.roll-field {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0.35rem 0 0.9rem;
}

.roll-btn,
.apply-btn {
  margin-bottom: 0;
  min-height: 2.6rem;
}

.roll-line {
  margin: 0;
  flex: 1 1 100%;
  font-size: 0.92rem;
}

.roll-die {
  display: inline-block;
  min-width: 2.4rem;
  text-align: center;
  padding: 0.05rem 0.35rem;
  margin-right: 0.35rem;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.4rem;
  font-variant-numeric: tabular-nums;
  font-size: 0.8rem;
}

.roll-table {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
}

.apply-btn {
  background: var(--pico-secondary-background);
  border-color: var(--pico-secondary-background);
  color: var(--pico-secondary-inverse);
}
</style>
