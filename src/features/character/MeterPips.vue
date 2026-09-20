<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number
    max: number
    big?: boolean
  }>(),
  { big: false },
)

function filled(index: number): boolean {
  return index < props.value
}
</script>

<template>
  <div class="pips" :class="{ big }" role="img" :aria-label="`${value} of ${max}`">
    <span
      v-for="index in Math.max(max, value)"
      :key="index"
      class="pip"
      :class="{ filled: filled(index - 1), over: index > max }"
    />
  </div>
</template>

<style scoped>
.pips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.pip {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 50%;
  border: 1.5px solid var(--pico-muted-border-color);
  background: transparent;
}

.pips.big .pip {
  width: 1.1rem;
  height: 1.1rem;
}

.pip.filled {
  background: var(--pico-primary);
  border-color: var(--pico-primary);
}

.pip.over {
  border-style: dashed;
}
</style>
