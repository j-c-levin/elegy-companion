<script setup lang="ts">
import { ref } from 'vue'
import { ORACLE_TABLES_BY_ID } from '@/data/oracles'
import { rollYesNo, type OracleResult } from './roll'
import { recordRoll } from './recent'

const table = ORACLE_TABLES_BY_ID['yes-no']
const odds = table.odds!
const result = ref<OracleResult | null>(null)

function roll(oddsId: string) {
  result.value = rollYesNo(table, oddsId)
  recordRoll(result.value)
}
</script>

<template>
  <section class="yesno">
    <h2>Ask the Oracle</h2>
    <div class="odds-grid">
      <button v-for="o in odds" :key="o.id" type="button" @click="roll(o.id)">
        {{ o.label }}
        <small>{{ o.max }} or less</small>
      </button>
    </div>
    <div v-if="result" class="answer" role="status">
      <span class="verdict" :class="result.answer!.toLowerCase()">{{ result.answer }}</span>
      <span class="detail">Rolled {{ result.rollLabel }} · {{ result.note }}</span>
    </div>
  </section>
</template>

<style scoped>
.odds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 0.5rem;
}

.odds-grid button {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding-block: 0.75rem;
  font-weight: 600;
}

.odds-grid small {
  font-weight: 400;
  color: var(--pico-muted-color);
}

.answer {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.5rem;
  text-align: center;
}

.verdict {
  display: block;
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.1;
}

.verdict.yes {
  color: var(--pico-primary);
}

.verdict.no {
  color: var(--pico-muted-color);
}

.answer .detail {
  display: block;
  margin-top: 0.35rem;
  color: var(--pico-muted-color);
  font-size: 0.9rem;
}
</style>
