<script setup lang="ts">
import ManualRef from '@/components/ManualRef.vue'
</script>

<template>
  <section aria-labelledby="connections-heading">
    <h1 id="connections-heading">Connections</h1>
    <p class="cite">
      Rank, Pulse (Rank + 2), Sealed and Bloodied-by-you / Bloodied-by-them states for every
      relationship, with the progress, testing and healing rules attached (manual 979–1084
      <ManualRef ref-key="connections" />).
    </p>
    <p class="planned">Planned for Phase 2, task 8.</p>
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
