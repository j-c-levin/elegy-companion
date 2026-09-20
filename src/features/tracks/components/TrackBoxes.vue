<script setup lang="ts">
import { ref } from 'vue'

import { TICKS_PER_BOX, TRACK_BOXES } from '../types'

const props = defineProps<{ ticks: number; disabled?: boolean }>()

const emit = defineEmits<{ set: [ticks: number] }>()

const suppressClick = ref(false)
let pressTimer: ReturnType<typeof setTimeout> | null = null
let startX = 0
let startY = 0

function tickTarget(box: number, segment: number): number {
  return box * TICKS_PER_BOX + segment + 1
}

function clearTarget(box: number, segment: number): number {
  return box * TICKS_PER_BOX + segment
}

function cancelPress(): void {
  if (pressTimer !== null) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

function onPointerDown(event: PointerEvent, box: number, segment: number): void {
  if (props.disabled) return
  startX = event.clientX
  startY = event.clientY
  cancelPress()
  pressTimer = setTimeout(() => {
    pressTimer = null
    suppressClick.value = true
    emit('set', clearTarget(box, segment))
  }, 450)
}

function onPointerMove(event: PointerEvent): void {
  if (Math.abs(event.clientX - startX) > 8 || Math.abs(event.clientY - startY) > 8) {
    cancelPress()
  }
}

function onClick(box: number, segment: number): void {
  if (props.disabled) return
  if (suppressClick.value) {
    suppressClick.value = false
    return
  }
  emit('set', tickTarget(box, segment))
}

function onContextmenu(event: MouseEvent, box: number, segment: number): void {
  if (props.disabled) return
  event.preventDefault()
  cancelPress()
  suppressClick.value = true
  emit('set', clearTarget(box, segment))
}
</script>

<template>
  <div class="track-boxes" :class="{ disabled }" @pointerup="cancelPress" @pointercancel="cancelPress">
    <div v-for="box in TRACK_BOXES" :key="box" class="track-box">
      <button
        v-for="segment in TICKS_PER_BOX"
        :key="segment"
        type="button"
        class="tick"
        :class="{ filled: props.ticks >= (box - 1) * TICKS_PER_BOX + segment }"
        :disabled="disabled"
        :aria-label="`Box ${box}, tick ${segment}: ${props.ticks} of ${TRACK_BOXES * TICKS_PER_BOX} ticks filled`"
        @pointerdown="onPointerDown($event, box - 1, segment - 1)"
        @pointermove="onPointerMove"
        @click="onClick(box - 1, segment - 1)"
        @contextmenu="onContextmenu($event, box - 1, segment - 1)"
      />
    </div>
  </div>
</template>

<style scoped>
.track-boxes {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.45rem;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.track-box {
  display: flex;
  gap: 2px;
  height: 2.6rem;
  padding: 3px;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.45rem;
  background: var(--pico-card-background-color);
}

.tick {
  appearance: none;
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 2px;
  background: var(--pico-secondary-background);
  box-shadow: none;
  cursor: pointer;
}

.tick.filled {
  background: var(--pico-primary);
}

.track-boxes.disabled .tick {
  cursor: default;
  opacity: 0.75;
}

@media (min-width: 720px) {
  .track-boxes {
    grid-template-columns: repeat(10, 1fr);
  }
}
</style>
