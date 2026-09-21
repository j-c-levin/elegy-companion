<script setup lang="ts">
import ManualRef from '@/components/ManualRef.vue'
</script>

<template>
  <section aria-labelledby="session-xp-heading">
    <h2 id="session-xp-heading">XP economy</h2>
    <p class="cite">
      Failures grant 1 XP, or 3 on a match; spend 10 XP to upgrade an Aspect, 15 to acquire one
      (manual 1122–1160 <ManualRef ref-key="xp" />).
    </p>
    <p class="planned">Planned for Phase 2, task 7. The XP tally lives on the Character Sheet for now.</p>
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
