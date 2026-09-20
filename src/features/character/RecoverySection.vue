<script setup lang="ts">
import { computed, ref } from 'vue'

import { game } from '@/store'
import {
  addLooseEnd,
  feed,
  regenerate,
  respite,
  setStandingTest,
  slumber,
  type RecoveryResult,
} from './sheet'

const wounded = computed(() => game.activeConditions.includes('Wounded'))
const inShock = computed(() => game.activeConditions.includes('In Shock'))
const starving = computed(() => game.activeConditions.includes('Starving'))

const healthGain = computed(() => (wounded.value ? 2 : 3))
const clarityGain = computed(() => (inShock.value ? 1 : 2))

const regenChoice = ref<null | 'blood' | 'rush'>(null)
const respiteChoice = ref<null | 'rush' | 'clarity'>(null)

function pickRegenerate(result: RecoveryResult): void {
  if (result === 'failure' && wounded.value) {
    regenChoice.value = 'blood'
    return
  }
  regenerate(result, 'blood')
}

function pickRegenerateFailure(choice: 'blood' | 'rush'): void {
  regenChoice.value = null
  regenerate('failure', choice)
}

function pickRespite(result: RecoveryResult): void {
  if (result === 'failure') {
    respiteChoice.value = 'rush'
    return
  }
  respite(result, 'rush')
}

function pickRespiteFailure(choice: 'rush' | 'clarity'): void {
  respiteChoice.value = null
  respite('failure', choice)
}

const animalSource = ref(false)
const preservedSource = ref(false)

function toggleAnimal(): void {
  animalSource.value = !animalSource.value
  if (animalSource.value) preservedSource.value = false
}

function togglePreserved(): void {
  preservedSource.value = !preservedSource.value
  if (preservedSource.value) animalSource.value = false
}

function feedGain(): number {
  let gain = starving.value ? 2 : 3
  if (animalSource.value) gain -= 1
  if (preservedSource.value) gain -= 1
  return Math.max(0, gain)
}

const feedFailureVoracious = computed(() => starving.value && !preservedSource.value)

const looseEndText = ref('')

function addLooseEndNow(): void {
  const text = looseEndText.value.trim()
  if (!text) return
  addLooseEnd(text)
  looseEndText.value = ''
}
</script>

<template>
  <section aria-labelledby="recovery-heading">
    <h2 id="recovery-heading">Recovery</h2>
    <p class="cite">
      Pick your roll result after rolling in the Roll Engine. Regenerate 682–692, Respite 746–756,
      Slumber 767–778, Feeding 785–800.
    </p>
    <div class="recovery-grid">
      <article>
        <h3>Regenerate <span class="cite-inline">roll with Body</span></h3>
        <p class="how">
          Restore Health. If not Wounded, treat a Failure as a Flat Success (manual 682–692).
        </p>
        <div class="result-buttons">
          <button type="button" @click="pickRegenerate('stylish')">
            Stylish: +{{ healthGain }} Health{{ wounded ? ', clear Wounded' : '' }}
          </button>
          <button type="button" @click="pickRegenerate('flat')">
            Flat: +{{ healthGain }} Health, −1 Blood
          </button>
          <button v-if="wounded" type="button" class="outline" @click="pickRegenerate('failure')">
            Failure: +{{ healthGain }} Health, then a choice
          </button>
        </div>
        <div v-if="regenChoice" class="choice-buttons">
          <button type="button" class="outline" @click="pickRegenerateFailure('blood')">
            −2 Blood instead of 1
          </button>
          <button type="button" class="outline" @click="pickRegenerateFailure('rush')">
            −1 Blood, also −2 Rush
          </button>
        </div>
      </article>

      <article>
        <h3>Respite <span class="cite-inline">roll with Mind (solitude) or Soul (company)</span></h3>
        <p class="how">Restore Clarity by taking a break and finding peace (manual 746–756).</p>
        <div class="result-buttons">
          <button type="button" @click="pickRespite('stylish')">
            Stylish: +{{ clarityGain }} Clarity{{ inShock ? ', clear In Shock' : '' }}
          </button>
          <button type="button" @click="pickRespite('flat')">
            Flat: +{{ clarityGain }} Clarity, −1 Rush
          </button>
          <button type="button" class="outline" @click="pickRespite('failure')">
            Failure: then a choice
          </button>
        </div>
        <div v-if="respiteChoice" class="choice-buttons">
          <button type="button" class="outline" @click="pickRespiteFailure('rush')">
            Lose 1 more Rush
          </button>
          <button type="button" class="outline" @click="pickRespiteFailure('clarity')">
            Gain 1 less Clarity
          </button>
        </div>
      </article>

      <article>
        <h3>Slumber <span class="cite-inline">the death-sleep, manual 767–778</span></h3>
        <p class="how">
          Lose 1 Blood (cannot be mitigated), gain +1 Rush, erase Cautioned. To stay awake through
          the day instead: lose 2 Blood and Flow Your Blood with Soul.
        </p>
        <div class="result-buttons">
          <button type="button" @click="slumber()">Slumber now</button>
        </div>
        <div class="slumber-followups">
          <p>
            Violated a law or custom of vampire society tonight?
            <button type="button" class="outline small" @click="setStandingTest({ reason: 'Violated laws or customs tonight', selfDefense: false })">
              Try Your Standing
            </button>
          </p>
          <form class="loose-end-form" @submit.prevent="addLooseEndNow">
            <input
              v-model="looseEndText"
              type="text"
              placeholder="A lingering question, as a Loose End (manual 1150–1152)"
              aria-label="New loose end"
            />
            <button type="submit" class="outline">Write it</button>
          </form>
        </div>
      </article>

      <article>
        <h3>Feeding <span class="cite-inline">roll with Soul, manual 785–800</span></h3>
        <p class="how">
          Feed on a prey you've met, hunted, or subdued to restore Blood. If you fed from this
          victim yesterday, they become extremely weak; wait two days before feeding from them again.
        </p>
        <div class="source-toggles">
          <label>
            <input type="checkbox" :checked="animalSource" @change="toggleAnimal" />
            Animal source (gain 1 less)
          </label>
          <label>
            <input type="checkbox" :checked="preservedSource" @change="togglePreserved" />
            Preserved blood (Failure: gain 1 less, −1 Rush)
          </label>
        </div>
        <div class="result-buttons">
          <button type="button" @click="feed('stylish', { animal: animalSource, preserved: preservedSource })">
            Stylish: +{{ feedGain() }} Blood{{ starving && !preservedSource ? ', erase Starving' : '' }}
          </button>
          <button type="button" @click="feed('flat', { animal: animalSource, preserved: preservedSource })">
            Flat: +{{ feedGain() }} Blood, −1 Rush
          </button>
          <button
            v-if="!feedFailureVoracious"
            type="button"
            class="outline"
            @click="feed('failure', { animal: animalSource, preserved: preservedSource })"
          >
            Failure: +{{ feedGain() }} Blood{{ preservedSource ? '' : ' (as Flat)' }}, −1 Rush
          </button>
          <button v-else type="button" class="outline" @click="feed('failure', { animal: animalSource, preserved: preservedSource })">
            Failure: full Blood, erase Starving, Try Your Conscience
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}

.cite-inline {
  display: block;
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--pico-muted-color);
}

.recovery-grid {
  display: grid;
  gap: 1rem;
}

.recovery-grid article {
  margin-bottom: 0;
  padding: 1rem 1.1rem;
}

@media (min-width: 720px) {
  .recovery-grid {
    grid-template-columns: repeat(2, 1fr);
    align-items: start;
  }
}

.how {
  font-size: 0.9rem;
  color: var(--pico-muted-color);
}

.result-buttons,
.choice-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.result-buttons button,
.choice-buttons button {
  margin-bottom: 0;
  font-size: 0.85rem;
}

.choice-buttons {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--pico-muted-border-color);
}

.slumber-followups {
  margin-top: 0.75rem;
  display: grid;
  gap: 0.5rem;
}

.slumber-followups p {
  margin-bottom: 0;
  font-size: 0.9rem;
}

.slumber-followups .small {
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  --pico-font-size: 0.8rem;
}

.loose-end-form {
  display: flex;
  gap: 0.5rem;
}

.loose-end-form input {
  margin-bottom: 0;
  flex: 1;
  font-size: 0.85rem;
}

.loose-end-form button {
  margin-bottom: 0;
  white-space: nowrap;
}

.source-toggles {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.source-toggles label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0;
}

.source-toggles input {
  margin: 0;
}
</style>
