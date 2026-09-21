<script setup lang="ts">
const props = defineProps<{
  label: string
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{ update: [value: string] }>()
</script>

<template>
  <label>
    {{ props.label }}
    <input
      :value="props.modelValue"
      type="text"
      :placeholder="props.placeholder"
      @input="emit('update', ($event.target as HTMLInputElement).value)"
    />
  </label>
</template>
