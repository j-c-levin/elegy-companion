<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

const props = defineProps<{
  label: string
  confirmLabel?: string
  danger?: boolean
  disabled?: boolean
  small?: boolean
}>()

const emit = defineEmits<{ confirm: [] }>()

const armed = ref(false)
let timer: number | undefined

function click(): void {
  if (props.disabled) return
  if (armed.value) {
    armed.value = false
    window.clearTimeout(timer)
    emit('confirm')
    return
  }
  armed.value = true
  timer = window.setTimeout(() => {
    armed.value = false
  }, 4000)
}

onUnmounted(() => window.clearTimeout(timer))
</script>

<template>
  <button
    type="button"
    class="confirm-btn"
    :class="{ armed, danger, small }"
    :disabled="disabled"
    @click="click"
  >
    {{ armed ? (confirmLabel ?? 'Sure?') : label }}
  </button>
</template>

<style scoped>
.confirm-btn {
  margin-bottom: 0;
}

.confirm-btn.small {
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  --pico-font-size: 0.8rem;
}

.confirm-btn.armed {
  background: var(--pico-primary-background);
  border-color: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
}

.confirm-btn.danger {
  background: var(--pico-danger-background);
  border-color: var(--pico-danger-background);
  color: var(--pico-danger-inverse);
}

.confirm-btn.armed.danger {
  background: var(--pico-danger-background);
  animation: pulse 1s ease infinite;
}

@keyframes pulse {
  50% {
    filter: brightness(1.25);
  }
}
</style>
