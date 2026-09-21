<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import ManualRef from '@/components/ManualRef.vue'

import { resetWorldDraft, truthChoiceLabel, worldDraft } from './draft'
import { TRUTH_IDS, type TruthId } from './world'

const world = worldDraft()

const confirmingReset = ref(false)
let resetTimer: number | undefined

const TRUTH_TITLES: Record<TruthId, string> = {
  'origins': 'Origins',
  'innate-powers': 'Innate Powers',
  'population': 'Population',
  'political-landscape': 'Political Landscape',
  'loyalty': 'Loyalty',
  'hunting-territory': 'Hunting Territory',
  'sunlight': 'Sunlight',
  'district-access': 'District Access',
  'witches': 'Witches',
  'hunters': 'Vampire Hunters',
  'werewolves': 'Werewolves',
  'fey': 'Fey',
}

const chosenTruths = computed(() =>
  TRUTH_IDS.filter((id) => world.truths[id] !== '').map((id) => ({
    id,
    title: TRUTH_TITLES[id],
    choice: truthChoiceLabel(id),
  })),
)

const cityDone = computed(() => world.city.name.trim().length > 0)
const missionDone = computed(() => world.firstMission.rank !== null)

function doReset(): void {
  if (!confirmingReset.value) {
    confirmingReset.value = true
    resetTimer = window.setTimeout(() => {
      confirmingReset.value = false
    }, 4000)
    return
  }
  window.clearTimeout(resetTimer)
  confirmingReset.value = false
  resetWorldDraft()
}
</script>

<template>
  <section aria-labelledby="summary-heading">
    <div class="step-head">
      <h2 id="summary-heading">World so far</h2>
      <button type="button" class="ghost" @click="doReset">
        {{ confirmingReset ? 'Really reset everything?' : 'Reset draft' }}
      </button>
    </div>
    <p class="lede">
      A running draft of your world. Everything is saved as you go — revisit any step from the
      stepper above to change it.
    </p>

    <article class="panel">
      <h3>Truths — {{ chosenTruths.length }} / {{ TRUTH_IDS.length }}</h3>
      <p v-if="!chosenTruths.length" class="empty">No truths chosen yet.</p>
      <dl v-else class="truth-summary">
        <div v-for="truth in chosenTruths" :key="truth.id">
          <dt>{{ truth.title }}</dt>
          <dd>{{ truth.choice }}</dd>
        </div>
      </dl>
    </article>

    <article class="panel">
      <h3>City {{ cityDone ? '— ' + world.city.name : '' }}</h3>
      <p v-if="!cityDone && !world.city.districts.length" class="empty">Nothing recorded yet.</p>
      <dl class="city-summary">
        <div v-if="world.city.founded"><dt>Founded in</dt><dd>{{ world.city.founded }}</dd></div>
        <div v-if="world.city.economy"><dt>Economy</dt><dd>{{ world.city.economy }}</dd></div>
        <div v-if="world.city.climate"><dt>Climate</dt><dd>{{ world.city.climate }}</dd></div>
        <div v-if="world.city.languages"><dt>Language(s)</dt><dd>{{ world.city.languages }}</dd></div>
        <div v-if="world.city.highlight"><dt>Highlights</dt><dd>{{ world.city.highlight }}</dd></div>
        <div v-if="world.city.uglySide"><dt>Ugly side</dt><dd>{{ world.city.uglySide }}</dd></div>
        <div v-if="world.city.factionName"><dt>Your faction</dt><dd>{{ world.city.factionName }}</dd></div>
        <div v-if="world.city.factionValues.length">
          <dt>Faction values</dt>
          <dd>{{ world.city.factionValues.join(' · ') }}</dd>
        </div>
        <div v-if="world.city.districts.length">
          <dt>Districts</dt>
          <dd>
            <ul class="districts">
              <li v-for="district in world.city.districts" :key="district">{{ district }}</li>
            </ul>
          </dd>
        </div>
      </dl>
    </article>

    <article class="panel">
      <h3>First mission {{ missionDone ? `— Rank ${world.firstMission.rank}` : '' }}</h3>
      <p v-if="!world.firstMission.title && !world.firstMission.subject && !world.firstMission.goal" class="empty">
        Not envisioned yet.
      </p>
      <dl v-else class="city-summary">
        <div v-if="world.firstMission.title"><dt>Title</dt><dd>{{ world.firstMission.title }}</dd></div>
        <div v-if="world.firstMission.subject"><dt>Subject</dt><dd>{{ world.firstMission.subject }}</dd></div>
        <div v-if="world.firstMission.goal"><dt>Goal</dt><dd>{{ world.firstMission.goal }}</dd></div>
        <div v-if="world.firstMission.rank"><dt>Rank</dt><dd>{{ world.firstMission.rank }}</dd></div>
        <div v-if="world.firstMission.scene"><dt>Opening scene</dt><dd>{{ world.firstMission.scene }}</dd></div>
      </dl>
      <div v-if="missionDone" class="carry">
        <p>
          Carry it over: create a Mission track named “{{ world.firstMission.title }}” at Rank
          {{ world.firstMission.rank }} on <RouterLink to="/tracks">Progress Tracks</RouterLink>
          (manual 933–978 <ManualRef ref-key="missions" />). If a Connection assigned it, add them on
          <RouterLink to="/connections">Connections</RouterLink> (manual 979–1084
          <ManualRef ref-key="connections" />).
        </p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.step-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.ghost {
  padding: 0.45rem 0.9rem;
  font-size: 0.85rem;
  margin: 0;
  min-height: 2.75rem;
}

.lede {
  color: var(--pico-muted-color);
  margin-bottom: 1.25rem;
}

.panel {
  margin-bottom: 1.25rem;
}

.panel h3 {
  margin-bottom: 0.5rem;
}

.empty {
  color: var(--pico-muted-color);
  font-style: italic;
}

.truth-summary,
.city-summary {
  display: grid;
  gap: 0.4rem;
  margin: 0;
}

@media (min-width: 720px) {
  .truth-summary,
  .city-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.truth-summary dt,
.city-summary dt {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--pico-muted-color);
}

.truth-summary dd,
.city-summary dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.districts {
  list-style: none;
  padding: 0;
  margin: 0;
}

.districts li {
  padding: 0.2rem 0;
  border-bottom: 1px solid var(--pico-muted-border-color);
}

.districts li:last-child {
  border-bottom: none;
}

.carry {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.6rem;
  padding: 0.8rem 0.9rem;
  margin-top: 0.75rem;
}

.carry p {
  margin: 0;
}
</style>
