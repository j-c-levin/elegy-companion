<script setup lang="ts">
import ActionRollPanel from './ActionRollPanel.vue'
import PayThePricePanel from './PayThePricePanel.vue'
import RollHistoryList from './RollHistoryList.vue'
import ManualRef from '@/components/ManualRef.vue'
</script>

<template>
  <section>
    <h1>Roll Engine</h1>
    <p class="lede">
      Resolve actions with the manual's dice: 1d6 + attribute + bonuses against 2d10 challenge dice
      (manual 315–362 <ManualRef ref-key="action-roll" />).
    </p>
    <ActionRollPanel />
    <PayThePricePanel />
    <RollHistoryList />
  </section>
</template>

<style scoped>
.lede {
  color: var(--pico-muted-color);
  margin-bottom: 1.25rem;
}
</style>
