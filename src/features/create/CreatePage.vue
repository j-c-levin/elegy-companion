<script setup lang="ts">
import { computed, onUnmounted, ref, type Component } from 'vue'

import ManualRef from '@/components/ManualRef.vue'
import { game } from '@/store'

import {
  clearDraft,
  createDefaultDraft,
  hasValidAttributeSpread,
  loadDraft,
  saveDraft,
  type CreationDraft,
} from './draft'
import AbilitiesStep from './steps/AbilitiesStep.vue'
import AttributesStep from './steps/AttributesStep.vue'
import CommitStep from './steps/CommitStep.vue'
import GiftsStep from './steps/GiftsStep.vue'
import IdentityStep from './steps/IdentityStep.vue'
import OriginsStep from './steps/OriginsStep.vue'
import TurningStep from './steps/TurningStep.vue'

interface WizardStep {
  id: string
  label: string
  component: Component
}

const STEPS: WizardStep[] = [
  { id: 'origins', label: 'Origins', component: OriginsStep },
  { id: 'turning', label: 'Turning', component: TurningStep },
  { id: 'gifts', label: 'Gifts and blight', component: GiftsStep },
  { id: 'abilities', label: 'Starting Abilities', component: AbilitiesStep },
  { id: 'attributes', label: 'Attributes', component: AttributesStep },
  { id: 'identity', label: 'Identity', component: IdentityStep },
  { id: 'commit', label: 'Commit', component: CommitStep },
]

const draft = ref<CreationDraft>(loadDraft())
const stepIndex = ref(0)
const step = computed(() => STEPS[stepIndex.value]!)
const nextStep = computed(() => STEPS[stepIndex.value + 1])
const spreadValid = computed(() => hasValidAttributeSpread(draft.value.attributes))
const existingName = computed(() => game.identity.name)
const isPristine = computed(
  () => JSON.stringify(draft.value) === JSON.stringify(createDefaultDraft()),
)

function patch(p: Partial<CreationDraft>): void {
  draft.value = { ...draft.value, ...p }
  saveDraft(draft.value)
}

function go(index: number): void {
  stepIndex.value = Math.min(Math.max(index, 0), STEPS.length - 1)
}

function onCommitted(): void {
  draft.value = createDefaultDraft()
  clearDraft()
}

const discardArmed = ref(false)
let discardTimer: number | undefined

function discard(): void {
  if (!discardArmed.value) {
    discardArmed.value = true
    discardTimer = window.setTimeout(() => {
      discardArmed.value = false
    }, 4000)
    return
  }
  window.clearTimeout(discardTimer)
  discardArmed.value = false
  draft.value = createDefaultDraft()
  clearDraft()
  go(0)
}

onUnmounted(() => window.clearTimeout(discardTimer))
</script>

<template>
  <section aria-labelledby="create-heading">
    <h1 id="create-heading">Character Creation</h1>
    <p class="intro">
      From mortal to vampire: origins, turning, Gifts, Attributes and identity (manual
      1628–2089 <ManualRef ref-key="creation-origins" label="Create your character" />).
    </p>

    <div class="wizard">
      <nav class="rail" aria-label="Creation steps">
        <ol>
          <li v-for="(s, i) in STEPS" :key="s.id">
            <button
              type="button"
              class="rail-btn"
              :class="{ active: i === stepIndex, done: i < stepIndex }"
              :aria-current="i === stepIndex ? 'step' : undefined"
              @click="go(i)"
            >
              {{ i + 1 }}. {{ s.label }}
            </button>
          </li>
        </ol>
      </nav>

      <div class="content">
        <p class="progress" role="status">
          <span class="progress-count">Step {{ stepIndex + 1 }} of {{ STEPS.length }}</span>
          {{ step.label }}
        </p>

        <component :is="step.component" :key="step.id" :draft="draft" @patch="patch" @committed="onCommitted" />

        <div v-if="step.id !== 'commit'" class="wizard-nav">
          <button v-if="stepIndex > 0" type="button" class="outline nav-btn" @click="go(stepIndex - 1)">
            Back
          </button>
          <button v-if="nextStep" type="button" class="nav-btn next-btn" @click="go(stepIndex + 1)">
            Next: {{ nextStep.label }}
          </button>
        </div>

        <div class="draft-row">
          <p class="draft-note">
            Draft saves automatically on this device<span v-if="existingName"> · a character named {{ existingName }} already exists</span><span v-if="!spreadValid"> · attributes incomplete</span>.
          </p>
          <button
            v-if="!isPristine"
            type="button"
            class="outline discard-btn"
            :class="{ armed: discardArmed }"
            @click="discard"
          >
            {{ discardArmed ? 'Erase draft?' : 'Discard draft' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.intro {
  color: var(--pico-muted-color);
  font-size: 0.9rem;
}

.wizard {
  margin-top: 1rem;
}

.rail {
  display: none;
}

.progress {
  color: var(--pico-muted-color);
  font-size: 0.9rem;
  margin-bottom: 0.9rem;
}

.progress-count {
  display: inline-block;
  margin-right: 0.6rem;
  padding: 0.1rem 0.6rem;
  border: 1px solid var(--pico-primary);
  border-radius: 2rem;
  color: var(--pico-primary);
  font-variant-numeric: tabular-nums;
}

.wizard-nav {
  display: flex;
  gap: 0.6rem;
  margin-top: 1.25rem;
}

.nav-btn {
  flex: 1 1 50%;
  min-height: 3rem;
  margin-bottom: 0;
  font-weight: 600;
}

.next-btn {
  background: var(--pico-primary-background);
  border-color: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
}

.draft-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-top: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--pico-muted-border-color);
}

.draft-note {
  margin: 0;
  color: var(--pico-muted-color);
  font-size: 0.8rem;
}

.discard-btn {
  margin-bottom: 0;
  min-height: 2.4rem;
  font-size: 0.85rem;
}

.discard-btn.armed {
  background: var(--pico-primary-background);
  border-color: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
}

@media (min-width: 720px) {
  .wizard {
    display: grid;
    grid-template-columns: 12rem minmax(0, 1fr);
    gap: 1.75rem;
    align-items: start;
  }

  .rail {
    display: block;
    position: sticky;
    top: 1rem;
  }

  .rail ol {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .rail-btn {
    width: 100%;
    margin-bottom: 0;
    padding: 0.45rem 0.75rem;
    text-align: left;
    font-size: 0.88rem;
    border-radius: 0.5rem;
    border-color: transparent;
    background: transparent;
    color: var(--pico-muted-color);
  }

  .rail-btn.active {
    border-color: var(--pico-primary);
    color: var(--pico-primary);
    font-weight: 600;
  }

  .rail-btn.done {
    color: var(--pico-color);
  }
}
</style>
