<script setup lang="ts">
import ManualRef from '@/components/ManualRef.vue'
</script>

<template>
  <section aria-labelledby="night-log-heading">
    <h2 id="night-log-heading">Night log</h2>
    <p class="cite">
      One button per night's end: lose 1 Blood (can't be mitigated), gain +1 Rush, Try Your Standing
      if laws were violated, and write a lingering question as a Loose End (manual 767–778
      <ManualRef ref-key="slumber" />).
    </p>
    <p class="planned">Planned for Phase 2, task 5.</p>
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
