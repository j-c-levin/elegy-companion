<script setup lang="ts">
import { computed, ref } from 'vue'
import ManualRef from '@/components/ManualRef.vue'
import glossary from '@/data/glossary.json'

interface Term {
  term: string
  ref: string
  summary: string
}

const search = ref('')

const filteredTerms = computed<Term[]>(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return glossary.terms
  return glossary.terms.filter(
    (t) => t.term.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q),
  )
})

const groupedTerms = computed<{ letter: string; terms: Term[] }[]>(() => {
  const groups = new Map<string, Term[]>()
  for (const t of filteredTerms.value) {
    const letter = (t.term[0] ?? '#').toUpperCase()
    const list = groups.get(letter)
    if (list) list.push(t)
    else groups.set(letter, [t])
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, terms]) => ({ letter, terms }))
})

function refRange(t: Term): { start: number; end: number } {
  const [start, end] = t.ref.split('-').map(Number)
  return { start, end }
}
</script>

<template>
  <section aria-label="Glossary">
    <header class="section-head">
      <h2>
        Glossary
        <ManualRef ref-key="glossary" />
      </h2>
      <input
        v-model="search"
        type="search"
        autocomplete="off"
        placeholder="Search terms and summaries…"
        aria-label="Search glossary"
      />
      <p class="count">{{ filteredTerms.length }} terms</p>
    </header>
    <p v-if="!groupedTerms.length" class="muted">No terms match.</p>
    <div v-for="group in groupedTerms" :key="group.letter" class="letter-group">
      <h3 class="letter" aria-hidden="true">{{ group.letter }}</h3>
      <ul class="term-list">
        <li v-for="t in group.terms" :key="t.term" class="term-row">
          <div class="term-main">
            <span class="term-name">{{ t.term }}</span>
            <span class="term-summary">{{ t.summary }}</span>
          </div>
          <ManualRef :start="refRange(t).start" :end="refRange(t).end" :label="t.term" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.section-head h2 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.count {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin: 0.4rem 0 0;
}

.muted {
  color: var(--pico-muted-color);
}

.letter-group {
  margin-bottom: 0.75rem;
}

.letter {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--pico-muted-color);
  margin: 0 0 0.15rem;
  padding-left: 0.25rem;
}

.term-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.5rem;
  overflow: hidden;
}

.term-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
  background: var(--pico-card-background-color);
}

.term-row + .term-row {
  border-top: 1px solid var(--pico-muted-border-color);
}

.term-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.term-name {
  font-weight: 600;
}

.term-summary {
  color: var(--pico-muted-color);
  font-size: 0.88rem;
}
</style>
