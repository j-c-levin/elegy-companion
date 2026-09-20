<script setup lang="ts">
import { computed, ref } from 'vue'

import { game } from '@/store'
import {
  firstUnmarkedForTrack,
  TRACK_LABEL,
} from './conditions'
import {
  conscienceTest,
  resolveConscience,
  resolveStanding,
  setConscienceTest,
  setStandingTest,
  standingTest,
  type TenetPending,
} from './sheet'
import CascadePrompt from './CascadePrompt.vue'
import ManualRef from '@/components/ManualRef.vue'
import { endRefKey } from '@/manual/refs'

const conscienceCascade = ref(false)
const standingCascade = ref(false)

function triggerConscience(reason: string): void {
  const pending: TenetPending = { reason, selfDefense: false }
  setConscienceTest(pending)
}

function triggerStanding(): void {
  setStandingTest({ reason: 'Violated the laws or customs of vampire society', selfDefense: false })
}

function conscienceFailure(): void {
  if (conscienceTest.value?.selfDefense) {
    resolveConscience('failure')
    return
  }
  conscienceCascade.value = true
}

function markConscienceCascade(): void {
  conscienceCascade.value = false
  resolveConscience('failure')
}

function standingFailure(): void {
  standingCascade.value = true
}

function markStandingCascade(): void {
  standingCascade.value = false
  resolveStanding('failure')
}

function toggleSelfDefense(checked: boolean): void {
  if (conscienceTest.value) setConscienceTest({ ...conscienceTest.value, selfDefense: checked })
}

const conscienceNext = computed(() =>
  firstUnmarkedForTrack('conscience', game.activeConditions),
)
const standingNext = computed(() =>
  firstUnmarkedForTrack('standing', game.activeConditions),
)
</script>

<template>
  <section aria-labelledby="tenets-heading">
    <h2 id="tenets-heading">Tenets</h2>
    <p class="cite">
      Conscience and Standing have no meter; specific events trigger a test (manual 846–907
      <ManualRef ref-key="tenets" />).
      Make the roll in the Roll Engine, then record the outcome here.
    </p>
    <div class="tenet-grid">
      <article>
        <h3>
          Conscience <span class="cite-inline">roll with Soul — manual 853–882 <ManualRef ref-key="conscience" /></span>
        </h3>
        <p class="how">
          Triggered at the end of a scene where you take a life or bloody a Connection. If you
          killed in self-defense or to protect someone when no other option remained, treat a
          Failure as a Flat Success.
        </p>
        <div v-if="!conscienceTest" class="result-buttons">
          <button type="button" class="outline" @click="triggerConscience('Took a life')">
            Took a life this scene
          </button>
          <button type="button" class="outline" @click="triggerConscience('Bloodied a Connection')">
            Bloodied a Connection this scene
          </button>
        </div>
        <div v-else class="pending">
          <p class="pending-title">Try Your Conscience — {{ conscienceTest.reason }}</p>
          <label class="self-defense">
            <input
              type="checkbox"
              :checked="conscienceTest.selfDefense"
              @change="toggleSelfDefense(($event.target as HTMLInputElement).checked)"
            />
            Killed in self-defense or to protect someone (Failure counts as Flat)
          </label>
          <div class="result-buttons">
            <button type="button" @click="resolveConscience('stylish')">
              Stylish: +1 Rush
            </button>
            <button type="button" @click="resolveConscience('flat')">
              Flat: +1 Rush, −1 Clarity
            </button>
            <button type="button" class="outline" @click="conscienceFailure">
              Failure: suffer the cascade
            </button>
            <button type="button" class="outline" @click="setConscienceTest(null)">Dismiss</button>
          </div>
        </div>
        <CascadePrompt
          v-if="conscienceCascade"
          heading="Your Conscience fails (manual 864–882)"
          manual-ref-key="conscience-cascade"
          note="You reach your limit; suffer the first unmarked condition in the cascade."
          :condition="conscienceNext"
          :confirm-label="conscienceNext ? `Mark ${conscienceNext.key}` : 'No condition left'"
          @confirm="markConscienceCascade()"
          @cancel="conscienceCascade = false"
        />
        <p v-if="!conscienceCascade && conscienceNext === undefined" class="ended-note">
          Detached, Penitent and Blighted are all marked — see The End (manual 880–882
          <ManualRef :ref-key="endRefKey('conscience')" />).
        </p>
      </article>

      <article>
        <h3>
          Standing <span class="cite-inline">roll with Charm — manual 856–907 <ManualRef ref-key="standing" /></span>
        </h3>
        <p class="how">
          Triggered at the end of a night where you violated the laws or customs of vampire
          society: breaking the ruling authority's laws, disrespecting an elder, exposing secrets,
          leaving witnesses, failing duties, acting against a powerful faction.
        </p>
        <div v-if="!standingTest" class="result-buttons">
          <button type="button" class="outline" @click="triggerStanding">
            Violated laws or customs tonight
          </button>
        </div>
        <div v-else class="pending">
          <p class="pending-title">Try Your Standing — {{ standingTest.reason }}</p>
          <div class="result-buttons">
            <button type="button" @click="resolveStanding('stylish')">
              Stylish: nothing happened. +1 Rush
            </button>
            <button type="button" @click="resolveStanding('flat')">
              Flat: they let it pass, no Rush
            </button>
            <button type="button" class="outline" @click="standingFailure">
              Failure: suffer the cascade
            </button>
            <button type="button" class="outline" @click="setStandingTest(null)">Dismiss</button>
          </div>
        </div>
        <CascadePrompt
          v-if="standingCascade"
          heading="Your Standing fails (manual 878–907)"
          manual-ref-key="standing-cascade"
          note="They condemn and punish you; you awaken to a written warning. Suffer the first unmarked condition in the cascade."
          :condition="standingNext"
          :confirm-label="standingNext ? `Mark ${standingNext.key}` : 'No condition left'"
          @confirm="markStandingCascade()"
          @cancel="standingCascade = false"
        />
        <p v-if="!standingCascade && standingNext === undefined" class="ended-note">
          Cautioned, Discredited and Branded are all marked — see The End (manual 904–907
          <ManualRef :ref-key="endRefKey('standing')" />).
        </p>
      </article>
    </div>
    <p class="track-legend">
      Cascade tracks: {{ TRACK_LABEL.conscience }} — Detached, Penitent, Blighted;
      {{ TRACK_LABEL.standing }} — Cautioned, Discredited, Branded.
    </p>
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

.tenet-grid {
  display: grid;
  gap: 1rem;
}

.tenet-grid article {
  margin-bottom: 0;
  padding: 1rem 1.1rem;
}

@media (min-width: 720px) {
  .tenet-grid {
    grid-template-columns: repeat(2, 1fr);
    align-items: start;
  }
}

.how {
  font-size: 0.9rem;
  color: var(--pico-muted-color);
}

.result-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.result-buttons button {
  margin-bottom: 0;
  font-size: 0.85rem;
}

.pending {
  border-top: 1px dashed var(--pico-muted-border-color);
  padding-top: 0.6rem;
}

.pending-title {
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.self-defense {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.self-defense input {
  margin: 0;
}

.ended-note {
  color: var(--pico-danger);
  font-weight: 600;
  font-size: 0.9rem;
  margin: 0.5rem 0 0;
}

.track-legend {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
  margin-top: 0.75rem;
}
</style>
