<script setup lang="ts">
import type { Condition } from './conditions'

defineProps<{
  heading: string
  note?: string
  condition?: Condition
  confirmLabel: string
}>()

const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <aside class="cascade-prompt">
    <p class="heading"><strong>{{ heading }}</strong></p>
    <p v-if="note" class="note">{{ note }}</p>
    <details v-if="condition" open>
      <summary>{{ condition.key }} — next condition in the cascade ({{ condition.ref }})</summary>
      <p class="rules-text">{{ condition.text }}</p>
      <p class="effects">
        <span v-if="condition.maxRush !== 0">Max Rush {{ condition.maxRush }}. </span>
        <span v-if="condition.soul !== 0">Soul {{ condition.soul }}. </span>
        <span v-if="condition.actionPenalty !== 0">
          {{ condition.actionPenalty }} to every action roll except hunting. </span>
        <span v-if="condition.burden">Acquire the burden {{ condition.burden }}. </span>
      </p>
    </details>
    <div class="actions">
      <button v-if="condition" type="button" @click="emit('confirm')">{{ confirmLabel }}</button>
      <button type="button" class="outline" @click="emit('cancel')">Cancel</button>
    </div>
  </aside>
</template>

<style scoped>
.cascade-prompt {
  border: 2px solid var(--pico-primary);
  border-radius: 0.75rem;
  padding: 0.9rem 1.1rem;
  margin: 0.75rem 0;
  background: var(--pico-card-background-color);
}

.heading {
  margin-bottom: 0.4rem;
}

.note {
  color: var(--pico-muted-color);
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
}

.rules-text {
  font-size: 0.95rem;
  margin-bottom: 0.4rem;
}

.effects {
  font-size: 0.85rem;
  color: var(--pico-muted-color);
  margin-bottom: 0;
}

.actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.6rem;
}

.actions button {
  margin-bottom: 0;
}
</style>
