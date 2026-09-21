<script setup lang="ts">
import ManualRef from '@/components/ManualRef.vue'

import DraftField from '../DraftField.vue'
import RollField from '../RollField.vue'
import type { StepEmits, StepProps } from '../steps'

defineProps<StepProps>()
const emit = defineEmits<StepEmits>()

function setOccupation(value: string): void {
  emit('patch', { occupation: value })
}

function setApparentAge(value: string): void {
  emit('patch', { apparentAge: value })
}
</script>

<template>
  <section aria-labelledby="step-origins">
    <h2 id="step-origins">
      Origins
      <ManualRef ref-key="creation-origins" />
    </h2>
    <p class="cite">
      You were a regular mortal until around one year ago, when you died and were turned (manual
      1641–1651 <ManualRef ref-key="creation-origins" />).
    </p>
    <DraftField
      label="Occupation in life"
      placeholder="What did you do for a living?"
      :model-value="draft.occupation"
      @update="setOccupation"
    />
    <RollField table-id="mortal-occupation" @apply="setOccupation" />
    <DraftField
      label="Apparent age"
      placeholder="The age you will look like forever"
      :model-value="draft.apparentAge"
      @update="setApparentAge"
    />
  </section>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}
</style>
