<script setup lang="ts">
import { computed, ref } from 'vue'
import type { OracleCategory } from './types'
import { ORACLE_CATEGORIES } from './types'
import { ORACLE_TABLES } from '@/data/oracles'
import YesNoOracle from './YesNoOracle.vue'
import OracleTableView from './OracleTableView.vue'
import { recentRolls } from './recent'

const selectedId = ref<string | null>(null)
const search = ref('')
const activeCategory = ref<OracleCategory | 'all'>('all')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return ORACLE_TABLES.filter((t) => {
    if (activeCategory.value !== 'all' && t.category !== activeCategory.value) return false
    if (!q) return true
    return t.title.toLowerCase().includes(q)
  })
})

const recent = recentRolls()

const chips = computed<{ id: OracleCategory | 'all'; label: string }[]>(() => [
  { id: 'all' as const, label: 'All' },
  ...ORACLE_CATEGORIES
])
</script>

<template>
  <OracleTableView v-if="selectedId" :key="selectedId" :table-id="selectedId" @back="selectedId = null" />
  <div v-else class="oracles">
    <YesNoOracle />

    <section v-if="recent.length" class="recent">
      <h2>Recent rolls</h2>
      <ul>
        <li v-for="r in recent" :key="r.id">
          <button type="button" class="recent-row" @click="selectedId = r.tableId">
            <strong>{{ r.tableTitle }}</strong>
            <span>{{ r.summary }}</span>
          </button>
        </li>
      </ul>
    </section>

    <section class="browse">
      <h2>Browse tables</h2>
      <input v-model="search" type="search" placeholder="Filter tables…" aria-label="Filter tables" />
      <div class="chips" role="group" aria-label="Category filter">
        <button
          v-for="c in chips"
          :key="c.id"
          type="button"
          class="chip"
          :class="{ active: activeCategory === c.id }"
          @click="activeCategory = c.id"
        >
          {{ c.label }}
        </button>
      </div>
      <ul class="table-list">
        <li v-for="t in filtered" :key="t.id">
          <button type="button" class="table-row" @click="selectedId = t.id">
            <span class="table-title">{{ t.title }}</span>
            <small>{{ t.dice }} · {{ t.rows.length }}</small>
          </button>
        </li>
      </ul>
      <p v-if="!filtered.length" class="muted">No tables match.</p>
    </section>
  </div>
</template>

<style scoped>
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-block: 0.75rem;
}

.chip {
  margin: 0;
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  border-radius: 2rem;
  border: 1px solid var(--pico-muted-border-color);
  background: var(--pico-background-color);
  color: var(--pico-primary-inverse);
}

.chip.active {
  background: var(--pico-primary-background);
  border-color: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
  font-weight: 600;
}

.table-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.table-list li + li {
  border-top: 1px solid var(--pico-muted-border-color);
}

.table-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  text-align: left;
  background: none;
  border: none;
  box-shadow: none;
  padding: 0.7rem 0.25rem;
  margin: 0;
  color: var(--pico-color);
}

.table-row:hover {
  background: var(--pico-muted-background-color, var(--pico-secondary-background));
  color: var(--pico-secondary-inverse);
}

.table-title {
  font-weight: 500;
}

.table-list small,
.recent small {
  color: var(--pico-muted-color);
  white-space: nowrap;
}

.recent ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recent li + li {
  border-top: 1px solid var(--pico-muted-border-color);
}

.recent-row {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  text-align: left;
  background: none;
  border: none;
  box-shadow: none;
  padding: 0.6rem 0.25rem;
  margin: 0;
  color: var(--pico-color);
}

.recent-row span {
  color: var(--pico-muted-color);
  font-size: 0.9rem;
}

.muted {
  color: var(--pico-muted-color);
}
</style>
