<script setup lang="ts">
import ManualRef from '@/components/ManualRef.vue'

import DraftField from '../DraftField.vue'
import RollField from '../RollField.vue'
import type { StepEmits, StepProps } from '../steps'

defineProps<StepProps>()
const emit = defineEmits<StepEmits>()

function setProgenitor(value: string): void {
  emit('patch', { progenitor: value })
}

function setReason(value: string): void {
  emit('patch', { turningReason: value })
}
</script>

<template>
  <section aria-labelledby="step-turning">
    <h2 id="step-turning">
      Turning
      <ManualRef ref-key="creation-turning" />
    </h2>
    <p class="cite">
      Decide who turned you, why, and how it happened; the tables are inspiration, invent freely
      (manual 1722–1728 <ManualRef ref-key="creation-turning" />).
    </p>
    <DraftField
      label="Progenitor"
      placeholder="Name the vampire who turned you"
      :model-value="draft.progenitor"
      @update="setProgenitor"
    />
    <p class="hint">
      Who were they to you? Roll for a relationship to envision them — write a fitting name above.
    </p>
    <RollField table-id="turning-who" inspiration-only />
    <p class="hint">Why did they turn you?</p>
    <RollField table-id="turning-why" @apply="setReason" />
    <DraftField
      label="Reason for turning"
      placeholder="Why did they turn you?"
      :model-value="draft.turningReason"
      @update="setReason"
    />
  </section>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}

.hint {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
}
</style>
