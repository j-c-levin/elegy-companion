<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import ManualRef from '@/components/ManualRef.vue'
import aspectsData from '@/data/aspects.json'

type AspectType = 'expertise' | 'gift' | 'mystery' | 'edge' | 'connection' | 'burden'

interface AspectTypeMeta {
  aspectType: AspectType
  label: string
  ref: string
  refKey: string
  summary: string
  acquire: string
}

interface AspectEntry {
  id: string
  type: AspectType
  name: string
  ref: string
  summary: string
  tag?: string
}

const KNOWN_TYPES: readonly AspectType[] = [
  'expertise',
  'gift',
  'mystery',
  'edge',
  'connection',
  'burden',
]

function isAspectType(value: string): value is AspectType {
  return (KNOWN_TYPES as readonly string[]).includes(value)
}

function isAspectTypeMeta(value: unknown): value is AspectTypeMeta {
  if (typeof value !== 'object' || value === null) return false
  const t = value as Record<string, unknown>
  return (
    typeof t.aspectType === 'string' &&
    isAspectType(t.aspectType) &&
    typeof t.label === 'string' &&
    typeof t.ref === 'string' &&
    typeof t.refKey === 'string' &&
    typeof t.summary === 'string' &&
    typeof t.acquire === 'string'
  )
}

function isAspectEntry(value: unknown): value is AspectEntry {
  if (typeof value !== 'object' || value === null) return false
  const e = value as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.type === 'string' &&
    isAspectType(e.type) &&
    typeof e.name === 'string' &&
    typeof e.ref === 'string' &&
    typeof e.summary === 'string' &&
    (e.tag === undefined || typeof e.tag === 'string')
  )
}

const TYPES: AspectTypeMeta[] = aspectsData.types.filter(isAspectTypeMeta)
const ASPECTS: AspectEntry[] = aspectsData.aspects.filter(isAspectEntry)

const TYPES_BY_ID: Partial<Record<AspectType, AspectTypeMeta>> = {}
for (const t of TYPES) TYPES_BY_ID[t.aspectType] = t

const activeType = ref<AspectType | 'all'>('all')
const search = ref('')

const chips = computed(() => [
  { id: 'all' as const, label: 'All' },
  ...TYPES.map((t) => ({ id: t.aspectType, label: t.label })),
])

const shownTypes = computed(() =>
  activeType.value === 'all'
    ? TYPES
    : TYPES.filter((t) => t.aspectType === activeType.value),
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return ASPECTS.filter((a) => {
    if (activeType.value !== 'all' && a.type !== activeType.value) return false
    if (!q) return true
    return a.name.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)
  })
})

const cards = computed(() =>
  filtered.value.flatMap((entry) => {
    const meta = metaOf(entry)
    return meta ? [{ entry, meta }] : []
  }),
)

function metaOf(entry: AspectEntry): AspectTypeMeta | undefined {
  return TYPES_BY_ID[entry.type]
}

function pluralLabel(t: AspectTypeMeta): string {
  return t.aspectType === 'mystery' ? 'Mysteries' : `${t.label}s`
}
</script>

<template>
  <section class="aspects">
    <header class="page-head">
      <h1>Aspect Database</h1>
      <p class="tagline">
        How Aspects work and how each type is acquired (manual 2893–2959
        <ManualRef ref-key="aspects-how-they-work" />), with every Expertise, Gift, Mystery, Edge,
        Burden and Connection ability from Chapter 4.
      </p>
    </header>

    <section class="acquisition" aria-labelledby="acquire-heading">
      <h2 id="acquire-heading">Acquisition</h2>
      <div class="acquire-grid" :class="{ single: shownTypes.length === 1 }">
        <article v-for="t in shownTypes" :key="t.aspectType" class="acquire-card">
          <h3>{{ t.label }}</h3>
          <p class="acquire-summary">{{ t.summary }}</p>
          <p class="acquire-rule">
            <strong>Acquire:</strong> {{ t.acquire }}
            <ManualRef :ref-key="t.refKey" :label="`Acquiring ${pluralLabel(t)}`" />
          </p>
        </article>
      </div>
    </section>

    <section class="browse" aria-labelledby="browse-heading">
      <h2 id="browse-heading">
        Browse <span class="count">{{ filtered.length }} / {{ ASPECTS.length }}</span>
      </h2>
      <input
        v-model="search"
        type="search"
        placeholder="Filter by name or summary…"
        aria-label="Filter Aspects by name or summary"
      />
      <div class="chips" role="group" aria-label="Filter by aspect type">
        <button
          v-for="c in chips"
          :key="c.id"
          type="button"
          class="chip"
          :class="{ active: activeType === c.id }"
          :aria-pressed="activeType === c.id"
          @click="activeType = c.id"
        >
          {{ c.label }}
        </button>
      </div>
      <ul class="grid">
        <li v-for="{ entry, meta } in cards" :key="entry.id" class="card">
          <div class="card-head">
            <h3>{{ entry.name }}</h3>
            <ManualRef :ref-key="meta.refKey" :label="`${entry.name} — ${meta.label}`" />
          </div>
          <p class="tags">
            <span class="chip small">{{ meta.label }}</span>
            <span v-if="entry.tag" class="chip small tag">{{ entry.tag }}</span>
          </p>
          <p class="summary">{{ entry.summary }}</p>
          <p class="acquire-rule"><strong>Acquire:</strong> {{ meta.acquire }}</p>
        </li>
      </ul>
      <p v-if="!filtered.length" class="muted">No Aspects match.</p>
    </section>

    <p class="crosslink">
      Starting Aspects are picked in the
      <RouterLink to="/create">Character Creation wizard</RouterLink>, which links here for full
      ability text instead of repeating it. Ability descriptions live in the manual: open the
      <em>i</em> buttons for the cited lines.
    </p>
  </section>
</template>

<style scoped>
.page-head h1 {
  margin-bottom: 0.3rem;
}

.tagline {
  color: var(--pico-muted-color);
  max-width: 46rem;
}

.acquire-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.acquire-grid.single {
  grid-template-columns: 1fr;
  max-width: 46rem;
}

.acquire-card {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.6rem;
  padding: 0.75rem 0.9rem;
  margin: 0;
}

.acquire-card h3 {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.acquire-summary {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
}

.acquire-rule {
  font-size: 0.85rem;
  margin: 0;
}

.acquire-rule strong {
  color: var(--pico-muted-color);
}

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
  background: var(--pico-card-background-color);
  color: var(--pico-contrast);
}

button.chip {
  min-height: 2.75rem;
}

.chip.active {
  background: var(--pico-primary-background);
  border-color: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
  font-weight: 600;
}

.chip.small {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  font-size: 0.72rem;
}

.chip.tag {
  border-color: var(--pico-secondary-background);
  background: var(--pico-secondary-background);
  color: var(--pico-secondary-inverse);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 0.75rem;
  padding: 0;
  margin: 0.5rem 0 0;
  list-style: none;
}

.card {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.6rem;
  padding: 0.75rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-head h3 {
  margin: 0;
  font-size: 1.05rem;
}

.tags {
  margin: 0;
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.summary {
  margin: 0;
  font-size: 0.9rem;
  flex-grow: 1;
}

.card .acquire-rule {
  border-top: 1px solid var(--pico-muted-border-color);
  padding-top: 0.4rem;
  color: var(--pico-muted-color);
}

.count {
  color: var(--pico-muted-color);
  font-weight: 400;
  font-size: 0.85em;
}

.muted {
  color: var(--pico-muted-color);
}

.crosslink {
  color: var(--pico-muted-color);
  font-size: 0.9rem;
  max-width: 46rem;
}

@media (max-width: 719px) {
  .chips {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 0.3rem;
  }

  .chips .chip {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .grid,
  .acquire-grid {
    grid-template-columns: 1fr;
  }
}
</style>
