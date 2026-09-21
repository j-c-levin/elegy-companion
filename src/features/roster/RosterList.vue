<script setup lang="ts">
import { ref } from 'vue'

import ManualRef from '@/components/ManualRef.vue'

import { allNpcs, removeNpc } from './store'
import {
  CREATURE_TYPE_LABELS,
  rankLabel,
  transformedRank,
  type Npc,
} from './types'

defineEmits<{ edit: [npc: Npc] }>()

const confirmId = ref<string | null>(null)

function requestRemove(id: string): void {
  if (confirmId.value === id) {
    removeNpc(id)
  }
  confirmId.value = confirmId.value === id ? null : id
}
</script>

<template>
  <section>
    <h2>Roster</h2>
    <p v-if="allNpcs().length === 0" class="empty">
      No NPCs or adversaries yet — use the common-rank table or the form above to add your first.
    </p>
    <article v-for="npc in allNpcs()" :key="npc.id" class="npc-card">
      <header class="npc-head">
        <h3>{{ npc.name }}</h3>
        <span class="chip type">{{ CREATURE_TYPE_LABELS[npc.type] }}</span>
        <span class="chip rank">
          Rank {{ npc.rank }}<template v-if="rankLabel(npc.type, npc.rank)"> · {{ rankLabel(npc.type, npc.rank) }}</template>
        </span>
        <span v-if="transformedRank(npc.type, npc.rank) !== npc.rank" class="chip transformed">
          Rank {{ transformedRank(npc.type, npc.rank) }} transformed
          <ManualRef ref-key="npc-ranks" label="Common NPC ranks" />
        </span>
      </header>
      <p v-if="npc.pulse !== null" class="pulse">Pulse {{ npc.pulse }}</p>
      <p v-if="npc.notes" class="notes">{{ npc.notes }}</p>
      <footer class="npc-actions">
        <button type="button" class="small" @click="$emit('edit', npc)">Edit</button>
        <button
          type="button"
          class="small danger"
          @click="requestRemove(npc.id)"
        >
          {{ confirmId === npc.id ? 'Really remove?' : 'Remove' }}
        </button>
      </footer>
    </article>
  </section>
</template>

<style scoped>
.empty {
  color: var(--pico-muted-color);
  font-style: italic;
}

.npc-card {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.6rem;
  padding: 0.75rem 0.9rem;
  margin-bottom: 0.75rem;
}

.npc-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem 0.5rem;
}

.npc-head h3 {
  margin: 0;
  font-size: 1.05rem;
  margin-right: 0.25rem;
  overflow-wrap: anywhere;
}

.chip {
  display: inline-block;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  font-size: 0.8rem;
  color: var(--pico-muted-color);
  white-space: nowrap;
}

.chip.transformed {
  border-color: var(--pico-primary);
  color: var(--pico-primary);
}

.chip.transformed :deep(.manual-ref-btn) {
  width: 1.15rem;
  height: 1.15rem;
  font-size: 0.7rem;
  margin: 0 0 0 0.2rem;
}

.pulse {
  margin: 0.45rem 0 0;
  font-size: 0.92rem;
}

.notes {
  margin: 0.45rem 0 0;
  font-size: 0.95rem;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.npc-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
}

.small {
  padding: 0.35rem 0.8rem;
  font-size: 0.85rem;
  margin: 0;
  min-height: 2.4rem;
}

.danger {
  color: var(--pico-del-color);
  border-color: var(--pico-del-color);
  background: transparent;
}
</style>
