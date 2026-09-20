<script setup lang="ts">
import { ref } from 'vue'
import type { OracleResult, RollPart } from './roll'
import { getTable, rollTable } from './roll'
import OracleResultCard from './OracleResultCard.vue'

defineProps<{ result: OracleResult; depth?: number }>()

const chainResults = ref<Record<number, OracleResult | null>>({})

function rollChain(index: number, part: Extract<RollPart, { kind: 'chain' }>) {
  const target = getTable(part.table)
  if (!target) return
  const options = part.column ? { column: part.column } : {}
  chainResults.value[index] = rollTable(target, options).result
}

function chainButtonLabel(part: Extract<RollPart, { kind: 'chain' }>): string {
  return `roll for ${part.label}`
}
</script>

<template>
  <div class="result-card" :class="{ nested: depth }">
    <div v-if="result.answer" class="answer-block">
      <span class="verdict" :class="result.answer.toLowerCase()">{{ result.answer }}</span>
      <span class="meta">Rolled {{ result.rollLabel }}<template v-if="result.note"> · {{ result.note }}</template></span>
    </div>

    <div v-else-if="result.factionName" class="faction-block">
      <span class="big">{{ result.factionName }}</span>
      <span class="value">{{ result.factionValue }}</span>
      <span class="meta">{{ result.note }}</span>
    </div>

    <template v-else>
      <span v-if="result.columnTitle" class="meta">{{ result.columnTitle }} · rolled {{ result.rollLabel }}</span>
      <span v-else-if="result.rollLabel" class="meta">Rolled {{ result.rollLabel }}</span>
      <p class="entry">
        <template v-for="(part, i) in result.parts" :key="i">
          <span v-if="part.kind === 'text'">{{ part.text }}</span>
          <button
            v-else
            type="button"
            class="chain-btn"
            @click="rollChain(i, part)"
          >
            {{ chainButtonLabel(part) }}
          </button>
        </template>
      </p>
    </template>

    <template v-for="sub in result.subResults" :key="sub.rollLabel + (sub.factionName ?? sub.parts.map((p) => (p.kind === 'text' ? p.text : '')).join())">
      <div class="sub">
        <span class="meta">Second roll: {{ sub.rollLabel }}</span>
        <OracleResultCard :result="sub" :depth="(depth ?? 0) + 1" />
      </div>
    </template>

    <template v-for="(cr, key) in chainResults" :key="key">
      <div v-if="cr" class="sub">
        <OracleResultCard :result="cr" :depth="(depth ?? 0) + 1" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.result-card.nested {
  border-left: 2px solid var(--pico-muted-border-color);
  padding-left: 0.75rem;
  margin-top: 0.5rem;
}

.entry,
.entry p {
  margin: 0;
}

.entry {
  font-size: 1.15rem;
  line-height: 1.5;
}

.big {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
}

.answer-block .verdict {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
}

.answer-block .verdict.yes {
  color: var(--pico-primary);
}

.answer-block .verdict.no {
  color: var(--pico-muted-color);
}

.faction-block .value {
  display: block;
  font-weight: 600;
}

.chain-btn {
  display: inline;
  width: auto;
  margin: 0 0.15rem;
  padding: 0.1rem 0.55rem;
  font-size: 0.9rem;
  border-radius: 2rem;
  vertical-align: baseline;
}

.meta {
  display: block;
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}

.sub {
  margin-top: 0.5rem;
}
</style>
