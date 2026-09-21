<script setup lang="ts">
import ManualRef from '@/components/ManualRef.vue'
</script>

<template>
  <section aria-labelledby="loose-ends-heading">
    <h2 id="loose-ends-heading">Loose Ends</h2>
    <p class="cite">
      Lingering questions written when you slumber; mark one Tied to gain 1 XP (manual 1147–1155
      <ManualRef ref-key="loose-ends" />).
    </p>
    <p class="planned">Planned for Phase 2, task 6. The Character Sheet keeps the legacy Phase 1 list until this ships.</p>
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
