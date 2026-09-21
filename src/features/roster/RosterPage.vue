<script setup lang="ts">
import ManualRef from '@/components/ManualRef.vue'
</script>

<template>
  <section aria-labelledby="roster-heading">
    <h1 id="roster-heading">NPC &amp; Adversary Roster</h1>
    <p class="cite">
      Rank, Pulse and notes for every NPC and adversary, with the common-rank table per creature
      type (manual 986–1008 <ManualRef ref-key="npc-ranks" />) and the Chapter 5 statblocks
      (manual 4270–4854).
    </p>
    <p class="planned">Planned for Phase 2, task 9.</p>
  </section>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}

.planned {
  color: var(--pico-muted-color);
  font-style: italic;
}
</style>
