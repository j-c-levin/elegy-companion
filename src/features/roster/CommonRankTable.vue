<script setup lang="ts">
import ManualRef from '@/components/ManualRef.vue'

import {
  COMMON_RANKS,
  CREATURE_TYPES,
  CREATURE_TYPE_LABELS,
  RANKS,
  TRANSFORMED_TYPES,
  type CreatureType,
  type Rank,
} from './types'

defineEmits<{ pick: [type: CreatureType, rank: Rank] }>()
</script>

<template>
  <section class="rank-table-block">
    <h2>Common NPC ranks</h2>
    <p class="cite">
      Manual 986–1008, repeated for the statblocks at 4311–4333
      <ManualRef ref-key="npc-ranks" label="Common NPC ranks" />. Pick a cell to start a new
      entry with that creature type and Rank.
    </p>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col">Type</th>
            <th v-for="rank in RANKS" :key="rank" scope="col">Rank {{ rank }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="type in CREATURE_TYPES" :key="type">
            <th scope="row">{{ CREATURE_TYPE_LABELS[type] }}</th>
            <td v-for="rank in RANKS" :key="rank">
              <button
                v-if="COMMON_RANKS[type][rank].length"
                type="button"
                class="rank-cell"
                @click="$emit('pick', type, rank)"
              >
                {{ COMMON_RANKS[type][rank].join(' / ') }}
                <span v-if="TRANSFORMED_TYPES.includes(type)" class="star" aria-hidden="true">*</span>
              </button>
              <span v-else class="empty">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="footnote">
      * Werewolves are one Rank higher when transformed (manual 1008; statblocks at 4573, 4587,
      4589).
    </p>
  </section>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.table-scroll {
  overflow-x: auto;
}

table {
  margin-bottom: 0.5rem;
}

th,
td {
  padding: 0.45rem 0.55rem;
  text-align: left;
  vertical-align: top;
  white-space: nowrap;
}

tbody th {
  font-weight: 600;
}

.rank-cell {
  display: inline-block;
  padding: 0.35rem 0.6rem;
  margin: 0;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.45rem;
  background: transparent;
  color: var(--pico-contrast, var(--pico-color));
  font-size: 0.9rem;
  font-weight: 400;
  min-height: 2.2rem;
  cursor: pointer;
}

.rank-cell:hover {
  border-color: var(--pico-primary);
  color: var(--pico-primary);
}

.star {
  margin-left: 0.15rem;
  font-weight: 700;
}

.empty {
  color: var(--pico-muted-color);
}

.footnote {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin-bottom: 0;
}
</style>
