<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import {
  excerptForRange,
  MANUAL_REFS,
  type ManualExcerpt,
  type ManualRange,
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
            <p class="panel-source">Elegy 4e manual — raw text, lines as extracted</p>
          </div>
          <button ref="closeBtn" type="button" class="panel-close" aria-label="Close manual excerpt" @click="hide">
            Close
          </button>
        </header>
        <div class="panel-body">
          <p class="panel-note">
            Raw manual text (two PDF columns share each line, so a line may mix columns). Cited
            lines are highlighted.
          </p>
          <p v-if="loading" class="panel-loading" role="status">Loading excerpt…</p>
          <section v-for="block in excerptBlocks" :key="block.caption" class="excerpt-block" :aria-label="block.caption">
            <h3 class="excerpt-caption">{{ block.caption }}</h3>
            <p v-if="!block.excerpt" class="excerpt-missing">
              No excerpt bundled for lines {{ block.start }}-{{ block.end }}. Add it to
              src/manual/refs.json and run <code>npm run manual:build</code>.
            </p>
            <div v-else class="excerpt-lines">
              <span
                v-for="line in block.excerpt.lines"
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
  color: var(--pico-danger);
  font-size: 0.9rem;
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
