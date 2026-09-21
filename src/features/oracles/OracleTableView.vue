<script setup lang="ts">
import { ref } from 'vue'
import type { WeaponColumnId } from './types'
import { getTable, rollTable, type OracleResult } from './roll'
import OracleResultCard from './OracleResultCard.vue'
import { recordRoll } from './recent'
import ManualRef from '@/components/ManualRef.vue'
import { parseManualSource } from '@/manual/refs'

const props = defineProps<{ tableId: string }>()
defineEmits<{ back: [] }>()

const table = getTable(props.tableId)!
if (!table) throw new Error(`Unknown oracle table: ${props.tableId}`)

const sourceRange = parseManualSource(table.source)

const result = ref<OracleResult | null>(null)
const column = ref<WeaponColumnId | 'random'>('random')

function roll() {
  const options = table.kind === 'weapon' && column.value !== 'random' ? { column: column.value } : {}
  const { result: r } = rollTable(table, options)
  result.value = r
  recordRoll(r)
}

roll()
</script>

<template>
  <section class="table-view">
    <button type="button" class="back" @click="$emit('back')">All oracles</button>
    <header>
      <h2>
        {{ table.title }}
        <ManualRef
          v-if="sourceRange"
          :start="sourceRange.start"
          :end="sourceRange.end"
          :label="table.title"
        />
      </h2>
      <small>{{ table.dice }} · {{ table.rows.length }} entries · {{ table.source }}</small>
    </header>

    <div v-if="table.kind === 'weapon'" class="column-picker" role="group" aria-label="Weapon column">
      <button
        v-for="c in table.columns"
        :key="c.id"
        type="button"
        class="chip"
        :class="{ active: column === c.id }"
        @click="column = c.id"
      >
        {{ c.title }}
      </button>
      <button type="button" class="chip" :class="{ active: column === 'random' }" @click="column = 'random'">
        Random column
      </button>
      <p v-if="column !== 'random'" class="note">{{ table.columns!.find((c) => c.id === column)!.note }}</p>
    </div>

    <button type="button" class="roll-btn" @click="roll">{{ result ? 'Roll again' : 'Roll' }}</button>

    <OracleResultCard v-if="result" :key="result.rollLabel + JSON.stringify(result.parts)" :result="result" />
  </section>
</template>

<style scoped>
.back {
  margin: 0;
  padding: 0.3rem 0.75rem;
  font-size: 0.85rem;
  border-radius: 2rem;
}

header small {
  color: var(--pico-muted-color);
}

.column-picker {
  margin-top: 1rem;
}

.column-picker .chip {
  margin: 0 0.4rem 0.4rem 0;
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  border-radius: 2rem;
  border: 1px solid var(--pico-muted-border-color);
  background: var(--pico-background-color);
  color: var(--pico-primary-inverse);
}

.column-picker .chip.active {
  background: var(--pico-primary-background);
  border-color: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
  font-weight: 600;
}

.column-picker .note {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin: 0;
}

.roll-btn {
  margin-top: 0.75rem;
  width: 100%;
  font-weight: 600;
}

.table-view > .result-card {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.5rem;
}
</style>
