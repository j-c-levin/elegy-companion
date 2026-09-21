<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import {
  excerptForRange,
  readableForRange,
  MANUAL_REFS,
  type ManualExcerpt,
  type ManualRange,
  type ManualReadable,
} from '@/manual/refs'

const props = defineProps<{
  refKey?: string
  label?: string
  start?: number
  end?: number
}>()

interface ResolvedBlock {
  caption: string
  excerpt: ManualExcerpt | undefined
  readable: ManualReadable | undefined
  start: number
  end: number
}

const resolved = computed<{ label: string; ranges: ManualRange[] } | null>(() => {
  if (props.refKey) {
    const entry = MANUAL_REFS[props.refKey]
    if (!entry) return null
    return { label: props.label ?? entry.label, ranges: entry.ranges }
  }
  if (props.start !== undefined && props.end !== undefined) {
    return {
      label: props.label ?? `Manual lines ${props.start}-${props.end}`,
      ranges: [{ start: props.start, end: props.end }],
    }
  }
  return null
})

const open = ref(false)
const loading = ref(false)
const excerptBlocks = ref<ResolvedBlock[]>([])
const closeBtn = ref<HTMLButtonElement | null>(null)
let restoreFocusTo: HTMLElement | null = null
let loadToken = 0

async function loadBlocks(): Promise<void> {
  const target = resolved.value
  if (!target) return
  const token = ++loadToken
  loading.value = true
  const loaded = await Promise.all(
    target.ranges.map(async (range) => ({
      caption: range.label
        ? `${range.label} — lines ${range.start}-${range.end}`
        : `Lines ${range.start}-${range.end}`,
      excerpt: await excerptForRange(range.start, range.end),
      readable: await readableForRange(range.start, range.end),
      start: range.start,
      end: range.end,
    })),
  )
  if (token !== loadToken) return
  excerptBlocks.value = loaded
  loading.value = false
}

function show(): void {
  if (!resolved.value) return
  restoreFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
  open.value = true
  loadBlocks()
}

function hide(): void {
  open.value = false
  loading.value = false
  restoreFocusTo?.focus()
  restoreFocusTo = null
}

watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  closeBtn.value?.focus()
})

function onKeydown(event: KeyboardEvent): void {
  if (!open.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    hide()
    return
  }
  if (event.key === 'Tab') trapFocus(event)
}

function trapFocus(event: KeyboardEvent): void {
  const panel = document.getElementById('manual-ref-panel')
  if (!panel) return
  const focusables = Array.from(
    panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  )
  if (focusables.length === 0) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  const active = document.activeElement
  if (event.shiftKey && (active === first || active === panel)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(open, (isOpen) => {
  if (isOpen) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  loadToken++
})

const heading = computed(() => `Manual reference: ${resolved.value?.label ?? ''}`)
</script>

<template>
  <button
    v-if="resolved"
    type="button"
    class="manual-ref-btn"
    :aria-label="`${heading} — open manual excerpt`"
    :title="heading"
    @click.stop="show"
  >
    <span aria-hidden="true">i</span>
  </button>
  <Teleport to="body">
    <div v-if="open" class="manual-ref-overlay" @click.self="hide">
      <div
        id="manual-ref-panel"
        class="manual-ref-panel"
        role="dialog"
        aria-modal="true"
        :aria-label="heading"
      >
        <header class="panel-head">
          <div class="panel-titles">
            <p class="panel-label">{{ heading }}</p>
            <p class="panel-source">Elegy 4e manual — readable text with source lines</p>
          </div>
          <button ref="closeBtn" type="button" class="panel-close" aria-label="Close manual excerpt" @click="hide">
            Close
          </button>
        </header>
        <div class="panel-body">
          <p class="panel-note">
            Manual text reflowed for reading (two PDF columns separated, hyphenation joined).
            Cited lines are shown in full; line numbers are preserved for citation.
          </p>
          <p v-if="loading" class="panel-loading" role="status">Loading excerpt…</p>
          <section v-for="block in excerptBlocks" :key="block.caption" class="excerpt-block" :aria-label="block.caption">
            <h3 class="excerpt-caption">{{ block.caption }}</h3>
            <p v-if="!block.excerpt && !block.readable" class="excerpt-missing">
              No excerpt bundled for lines {{ block.start }}-{{ block.end }}. Add it to
              src/manual/refs.json and run <code>npm run manual:build</code>.
            </p>
            <div v-else-if="block.readable" class="readable-blocks">
              <template v-for="(item, index) in block.readable.blocks" :key="index">
                <h4 v-if="item.k === 'h'" :class="item.lvl === 2 ? 'readable-h2' : 'readable-h1'">
                  {{ item.t }}
                </h4>
                <p v-else-if="item.k === 'p'" class="readable-p">{{ item.t }}</p>
                <ul v-else-if="item.k === 'list'" class="readable-list">
                  <li v-for="(entry, entryIndex) in item.items" :key="entryIndex">
                    {{ entry.t }}
                  </li>
                </ul>
                <div v-else class="readable-table-wrap">
                  <table class="readable-table">
                    <thead v-if="item.cols">
                      <tr>
                        <th v-for="(col, colIndex) in item.cols" :key="colIndex" scope="col">
                          {{ col }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, rowIndex) in item.rows" :key="rowIndex">
                        <td v-for="(cell, cellIndex) in row.c" :key="cellIndex">
                          {{ cell }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <p class="readable-source">
                Source: reference/elegy-4e-beta-v3.txt:{{ block.readable.start }}-{{
                  block.readable.end
                }}
              </p>
            </div>
            <div v-else class="excerpt-lines">
              <span
                v-for="line in block.excerpt!.lines"
                :key="line.n"
                class="excerpt-line"
                :class="{ cited: line.n >= block.start && line.n <= block.end }"
              >
                <span class="line-no" aria-hidden="true">{{ line.n }}</span>
                <span class="line-text">{{ line.text }}</span>
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.manual-ref-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.45rem;
  height: 1.45rem;
  padding: 0;
  margin: 0 0.15rem;
  border-radius: 999px;
  border: 1px solid var(--pico-primary);
  color: var(--pico-primary);
  background: transparent;
  font-size: 0.85rem;
  font-weight: 700;
  font-style: italic;
  line-height: 1;
  vertical-align: baseline;
  flex-shrink: 0;
}

.manual-ref-btn:hover {
  background: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
}

.manual-ref-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgb(0 0 0 / 55%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}

@media (min-width: 720px) {
  .manual-ref-overlay {
    align-items: center;
    padding: 2rem;
  }
}

.manual-ref-panel {
  background: var(--pico-background-color);
  color: var(--pico-color);
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.75rem 0.75rem 0 0;
  width: 100%;
  max-width: 50rem;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
}

@media (min-width: 720px) {
  .manual-ref-panel {
    border-radius: 0.75rem;
    max-height: 85vh;
  }
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem 0.7rem;
  border-bottom: 1px solid var(--pico-muted-border-color);
}

.panel-titles {
  min-width: 0;
}

.panel-label {
  font-weight: 700;
  margin: 0;
  overflow-wrap: anywhere;
}

.panel-source {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
  margin: 0.15rem 0 0;
}

.panel-close {
  flex-shrink: 0;
  min-width: 4.5rem;
  min-height: 2.9rem;
  margin: 0;
  font-weight: 700;
}

.panel-body {
  overflow-y: auto;
  padding: 0.75rem 1rem 1.25rem;
}

.panel-note {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
  margin-bottom: 0.9rem;
}

.panel-loading {
  color: var(--pico-muted-color);
  font-size: 0.9rem;
}

.excerpt-block {
  margin-bottom: 1rem;
}

.excerpt-block:last-child {
  margin-bottom: 0;
}

.excerpt-caption {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0 0 0.4rem;
}

.excerpt-missing {
  color: var(--pico-muted-color);
  font-size: 0.9rem;
}

.readable-blocks {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.5rem;
  background: var(--pico-card-background-color);
  padding: 0.75rem 0.85rem;
}

.readable-h1 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0.35rem 0 0;
}

.readable-h1:first-child,
.readable-h2:first-child {
  margin-top: 0;
}

.readable-h2 {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--pico-muted-color);
  margin: 0.5rem 0 0;
}

.readable-p {
  font-size: 0.92rem;
  line-height: 1.55;
  margin: 0;
}

.readable-list {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.9rem;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.readable-table-wrap {
  overflow-x: auto;
  margin: 0 -0.2rem;
  padding: 0 0.2rem;
}

.readable-table {
  width: 100%;
  margin: 0;
  font-size: 0.85rem;
}

.readable-table th,
.readable-table td {
  padding: 0.4rem 0.5rem;
  vertical-align: top;
}

.readable-source {
  color: var(--pico-muted-color);
  font-size: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  margin: 0.25rem 0 0;
}

.excerpt-lines {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.5rem;
  background: var(--pico-card-background-color);
  overflow-x: auto;
  display: flex;
  flex-direction: column;
}

.excerpt-line {
  display: flex;
  gap: 0.6rem;
  padding: 0.05rem 0.6rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.72rem;
  line-height: 1.45;
  white-space: pre;
}

.excerpt-line.cited {
  background: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
}

.excerpt-line.cited .line-no {
  color: inherit;
}

.line-no {
  flex-shrink: 0;
  width: 3.2rem;
  text-align: right;
  color: var(--pico-muted-color);
  user-select: none;
  font-variant-numeric: tabular-nums;
}

.line-text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
