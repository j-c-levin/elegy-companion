<script setup lang="ts">
import { VERDICT_LABELS } from './engine'
import { rollHistory, type RollHistoryEntry } from './history'

function time(at: number): string {
  return new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function entryText(entry: RollHistoryEntry): string {
  const base = `${entry.action}: ${entry.parts} vs ${entry.challenge[0]}, ${entry.challenge[1]}`
  const cooled =
    entry.cooledFrom !== undefined ? ` (cooled: ${entry.cooledFrom} → ${entry.score})` : ''
  const match = entry.matchRoll
    ? ` — ${entry.matchRoll.table} (d10 ${entry.matchRoll.die}): ${entry.matchRoll.text}`
    : entry.match
      ? ' — match'
      : ''
  return base + cooled + match
}
</script>

<template>
  <section>
    <h2>Recent rolls</h2>
    <p v-if="rollHistory.length === 0" class="hint">No rolls yet this session.</p>
    <ol v-else class="history-list">
      <li v-for="entry in rollHistory" :key="entry.id">
        <span class="verdict-tag" :class="entry.verdict">{{ VERDICT_LABELS[entry.verdict] }}</span>
        <span class="entry-text">{{ entryText(entry) }}</span>
        <time>{{ time(entry.at) }}</time>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.hint {
  color: var(--pico-muted-color);
}

.history-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.history-list li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  padding-block: 0.55rem;
  border-bottom: 1px solid var(--pico-muted-border-color);
  font-size: 0.92rem;
}

.verdict-tag {
  flex-shrink: 0;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.15rem 0.55rem;
  border: 1px solid;
  border-radius: 999px;
}

.verdict-tag.stylish {
  color: var(--pico-ins-color);
  border-color: var(--pico-ins-color);
}

.verdict-tag.flat {
  color: var(--pico-primary);
  border-color: var(--pico-primary);
}

.verdict-tag.failure {
  color: var(--pico-del-color);
  border-color: var(--pico-del-color);
}

.entry-text {
  flex: 1;
  min-width: 12rem;
}

time {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
}
</style>
