<script setup lang="ts">
import { computed, ref } from 'vue'

import CityStep from './CityStep.vue'
import MissionStep from './MissionStep.vue'
import TruthsStep from './TruthsStep.vue'
import WorldSummary from './WorldSummary.vue'
import { worldDraft } from './draft'
import { TRUTH_IDS } from './world'

type StepId = 'truths' | 'city' | 'mission' | 'summary'

const world = worldDraft()

const STEPS: readonly { id: StepId; label: string }[] = [
  { id: 'truths', label: 'Truths' },
  { id: 'city', label: 'City' },
  { id: 'mission', label: 'First Mission' },
  { id: 'summary', label: 'Summary' },
]

const activeId = ref<StepId>('truths')
const activeIndex = computed(() => STEPS.findIndex((step) => step.id === activeId.value))

const truthsDone = computed(() => TRUTH_IDS.filter((id) => world.truths[id] !== '').length)

const stepProgress = computed<Record<StepId, string>>(() => ({
  truths: `${truthsDone.value}/${TRUTH_IDS.length}`,
  city: world.city.name.trim() ? '1/1' : '0/1',
  mission: world.firstMission.rank !== null ? '1/1' : '0/1',
  summary: '',
}))

function isComplete(step: StepId): boolean {
  if (step === 'truths') return truthsDone.value === TRUTH_IDS.length
  if (step === 'city') return world.city.name.trim().length > 0
  if (step === 'mission') return world.firstMission.rank !== null
  return true
}

function goTo(step: StepId): void {
  activeId.value = step
  window.scrollTo({ top: 0 })
}

function goPrev(): void {
  if (activeIndex.value > 0) goTo(STEPS[activeIndex.value - 1].id)
}

function goNext(): void {
  if (activeIndex.value < STEPS.length - 1) goTo(STEPS[activeIndex.value + 1].id)
}
</script>

<template>
  <section aria-labelledby="world-heading">
    <h1 id="world-heading">World Creation</h1>
    <p class="lede">
      Set up your table: pick your Truths, build your city, and set your first mission. Your draft
      saves as you go — leave and come back any time.
    </p>

    <nav class="stepper" aria-label="World creation steps">
      <button
        v-for="(step, index) in STEPS"
        :key="step.id"
        type="button"
        class="step-chip"
        :class="{ active: step.id === activeId, done: isComplete(step.id) && step.id !== activeId }"
        :aria-current="step.id === activeId ? 'step' : undefined"
        @click="goTo(step.id)"
      >
        <span class="chip-index" aria-hidden="true">{{ index + 1 }}</span>
        <span class="chip-label">{{ step.label }}</span>
        <span v-if="stepProgress[step.id]" class="chip-progress">{{ stepProgress[step.id] }}</span>
      </button>
    </nav>

    <div class="step-body">
      <nav class="rail" aria-label="World creation steps">
        <button
          v-for="(step, index) in STEPS"
          :key="step.id"
          type="button"
          class="rail-item"
          :class="{ active: step.id === activeId }"
          :aria-current="step.id === activeId ? 'step' : undefined"
          @click="goTo(step.id)"
        >
          <span class="rail-index" aria-hidden="true">{{ index + 1 }}</span>
          <span class="rail-label">{{ step.label }}</span>
        </button>
      </nav>
      <div class="step-main">
        <KeepAlive>
          <TruthsStep v-if="activeId === 'truths'" />
          <CityStep v-else-if="activeId === 'city'" />
          <MissionStep v-else-if="activeId === 'mission'" />
          <WorldSummary v-else />
        </KeepAlive>

        <div class="step-nav">
          <button type="button" class="ghost" :disabled="activeIndex === 0" @click="goPrev">
            Back
          </button>
          <button v-if="activeIndex < STEPS.length - 1" type="button" class="primary next" @click="goNext">
            {{ activeId === 'mission' ? 'Review world' : 'Next' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lede {
  color: var(--pico-muted-color);
  margin-bottom: 1.25rem;
}

.stepper {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  margin-bottom: 1.1rem;
}

.step-chip {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  padding: 0.45rem 0.8rem;
  min-height: 2.75rem;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 2rem;
  background: var(--pico-card-background-color);
  color: var(--pico-muted-color);
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.step-chip.active {
  border-color: var(--pico-primary);
  color: var(--pico-primary);
  font-weight: 600;
}

.step-chip.done .chip-index {
  background: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
  border-color: var(--pico-primary-background);
}

.chip-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.chip-progress {
  color: var(--pico-muted-color);
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
}

.rail {
  display: none;
}

.step-body {
  display: block;
}

.step-nav {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.step-nav .ghost {
  padding: 0.6rem 1.1rem;
  min-height: 3rem;
  margin: 0;
}

.step-nav .next {
  min-height: 3rem;
  padding-block: 0.7rem;
  font-weight: 600;
}

.step-nav button:disabled {
  opacity: 0.4;
}

@media (min-width: 720px) {
  .stepper {
    display: none;
  }

  .rail {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    position: sticky;
    top: 1rem;
    align-self: start;
  }

  .step-body {
    display: grid;
    grid-template-columns: 11rem minmax(0, 1fr);
    gap: 1.5rem;
  }

  .rail-item {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    width: 100%;
    margin: 0;
    padding: 0.45rem 0.6rem;
    border: none;
    border-left: 3px solid var(--pico-muted-border-color);
    border-radius: 0;
    background: transparent;
    color: var(--pico-muted-color);
    font-size: inherit;
    text-align: left;
    cursor: pointer;
  }

  .rail-item.active {
    border-left-color: var(--pico-primary);
    color: var(--pico-primary);
    font-weight: 600;
  }

  .rail-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border: 1px solid currentColor;
    border-radius: 999px;
    font-size: 0.8rem;
  }

  .rail-label {
    font-size: 0.95rem;
    white-space: nowrap;
  }
}
</style>
