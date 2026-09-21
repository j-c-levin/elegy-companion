<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import ManualRef from '@/components/ManualRef.vue'

import { getTable, rollTable, summarize, type OracleResult } from '@/features/oracles/roll'
import type { OracleRow, OracleTable } from '@/features/oracles/types'
import { setMissionField, worldDraft } from './draft'

const world = worldDraft()

function table(id: string): OracleTable {
  const found = getTable(id)
  if (!found) throw new Error(`missing oracle table ${id}`)
  return found
}

type TableRoll = { result: OracleResult; row: OracleRow }

const SCENE_OPTIONS = [
  {
    id: 'prologue',
    label: 'Prologue',
    seed: 'Start slow: show your character during a typical night — hunting, meeting acquaintances, enjoying the nightlife — then introduce an inciting incident or a request from a Connection that kicks off the mission.',
  },
  {
    id: 'in-medias-res',
    label: 'In medias res',
    seed: 'Start in the middle of the action: the problem has already begun and your character is already reacting, diving straight into the thick of it.',
  },
] as const

const subjectRoll = ref<TableRoll | null>(null)
const goalRoll = ref<TableRoll | null>(null)

const confirmingReset = ref(false)
let resetTimer: number | undefined

function onField<K extends 'title' | 'subject' | 'goal' | 'scene'>(
  key: K,
  event: Event,
): void {
  setMissionField(key, (event.target as HTMLTextAreaElement | HTMLInputElement).value)
}

function rollSubject(): void {
  subjectRoll.value = rollTable(table('subject'))
}

function rollGoal(): void {
  goalRoll.value = rollTable(table('character-goal'))
}

function collectSubTexts(result: OracleResult): string[] {
  return (result.subResults ?? []).flatMap((sub) => [summarize(sub), ...collectSubTexts(sub)])
}

function subjectText(roll: TableRoll): string {
  const subs = collectSubTexts(roll.result)
  const main = summarize(roll.result)
  return subs.length ? `${main} — and — ${subs.join(' — and — ')}` : main
}

function useSubject(): void {
  if (subjectRoll.value) setMissionField('subject', subjectText(subjectRoll.value))
}

function useGoal(): void {
  if (goalRoll.value) setMissionField('goal', summarize(goalRoll.value.result))
}

function setRank(rank: number): void {
  setMissionField('rank', world.firstMission.rank === rank ? null : rank)
}

function applySceneOption(seed: string): void {
  setMissionField('scene', seed)
}

function resetMission(): void {
  if (!confirmingReset.value) {
    confirmingReset.value = true
    resetTimer = window.setTimeout(() => {
      confirmingReset.value = false
    }, 4000)
    return
  }
  window.clearTimeout(resetTimer)
  confirmingReset.value = false
  setMissionField('title', '')
  setMissionField('subject', '')
  setMissionField('goal', '')
  setMissionField('rank', null)
  setMissionField('scene', '')
}

onUnmounted(() => window.clearTimeout(resetTimer))

function trackSummary(): string {
  const rank = world.firstMission.rank
  return `${world.firstMission.title || 'Your first mission'}${rank ? ` — Rank ${rank}` : ''}`
}
</script>

<template>
  <section aria-labelledby="mission-heading">
    <div class="step-head">
      <h2 id="mission-heading">Your First Mission</h2>
      <button v-if="world.firstMission.title || world.firstMission.subject || world.firstMission.rank" type="button" class="ghost" @click="resetMission">
        {{ confirmingReset ? 'Really clear?' : 'Clear mission' }}
      </button>
    </div>
    <p class="lede">
      Envision your character’s first mission in the story — assigned by a Connection or pursued on
      their own. Draw inspiration from your Truths, or generate a rumor by rolling on the Subject
      and Character Goal tables (manual 2699–2719
      <ManualRef ref-key="first-mission-envision" />).
    </p>

    <article class="panel">
      <h3>Envision <ManualRef ref-key="first-mission-envision" /></h3>
      <div class="roller">
        <button type="button" class="roll-btn" @click="rollSubject">Roll Subject</button>
        <button type="button" class="roll-btn" @click="rollGoal">Roll Character Goal</button>
      </div>

      <div v-if="subjectRoll" class="roll-result">
        <p>{{ subjectText(subjectRoll) }}</p>
        <button type="button" class="roll-btn" @click="useSubject">Use as subject</button>
      </div>
      <div v-if="goalRoll" class="roll-result">
        <p>{{ summarize(goalRoll.result) }}</p>
        <button type="button" class="roll-btn" @click="useGoal">Use as goal</button>
      </div>

      <div class="fields">
        <label for="mission-title">Mission title</label>
        <input id="mission-title" type="text" :value="world.firstMission.title" placeholder="Name this mission" @input="onField('title', $event)" />
        <label for="mission-subject">Subject</label>
        <input id="mission-subject" type="text" :value="world.firstMission.subject" placeholder="Who or what is the mission about?" @input="onField('subject', $event)" />
        <label for="mission-goal">Goal</label>
        <input id="mission-goal" type="text" :value="world.firstMission.goal" placeholder="What must be done?" @input="onField('goal', $event)" />
      </div>

      <p class="hint">
        A good first mission is personal, unavoidable, urgent, and tight in scope
        (manual 2846–2891 <ManualRef ref-key="first-mission-commit" />).
      </p>
    </article>

    <article class="panel">
      <h3>Set the scene <ManualRef ref-key="first-mission-commit" /></h3>
      <p class="hint">Pick an option to start from, then make it yours (manual 2846–2891 <ManualRef ref-key="first-mission-commit" />).</p>
      <div class="scene-options">
        <button
          v-for="option in SCENE_OPTIONS"
          :key="option.id"
          type="button"
          class="option"
          :class="{ selected: world.firstMission.scene.startsWith(option.seed) }"
          :aria-pressed="world.firstMission.scene.startsWith(option.seed)"
          @click="applySceneOption(option.seed)"
        >
          {{ option.label }}
        </button>
      </div>
      <label for="mission-scene">Opening scene</label>
      <textarea id="mission-scene" rows="3" :value="world.firstMission.scene" placeholder="How does the mission begin?" @input="onField('scene', $event)" />
    </article>

    <article class="panel">
      <h3>Commit to the mission <ManualRef ref-key="first-mission-commit" /></h3>
      <p class="hint">
        Write down the mission and assign it a Rank. First missions should be Rank 1 or 2; higher
        Ranks are for later in the story (manual 2865–2871).
      </p>
      <div class="rank-row" role="group" aria-label="Mission rank">
        <button
          v-for="rank in 5"
          :key="rank"
          type="button"
          class="rank-btn"
          :class="{ selected: world.firstMission.rank === rank }"
          :aria-pressed="world.firstMission.rank === rank"
          @click="setRank(rank)"
        >
          {{ rank }}
        </button>
      </div>

      <div class="carry">
        <p class="carry-title">Carry it over — by reference:</p>
        <p class="carry-line">
          Mission track on Progress Tracks: <strong>{{ trackSummary() }}</strong>
        </p>
        <RouterLink to="/tracks" class="carry-link">Create it on Progress Tracks</RouterLink>
        <p class="carry-line">
          If a Connection assigned this mission, add them there:
          <strong>{{ world.firstMission.subject || 'the Connection behind this mission' }}</strong>
        </p>
        <RouterLink to="/connections">Open Connections</RouterLink>
        <p class="hint">
          These tools keep their own records — copy the values above when you create them (manual
          933–978 <ManualRef ref-key="missions" />, 979–1084 <ManualRef ref-key="connections" />).
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
  margin-bottom: 0.6rem;
}

.roller {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.roll-btn {
  margin: 0;
  padding: 0.45rem 0.9rem;
  font-size: 0.9rem;
  min-height: 2.75rem;
}

.roll-result {
  border: 1px dashed var(--pico-muted-border-color);
  border-radius: 0.5rem;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.75rem;
}

.roll-result p {
  margin-bottom: 0.4rem;
}

.fields {
  display: grid;
  gap: 0.15rem;
  margin-top: 0.9rem;
}

.fields label {
  margin-top: 0.6rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.hint {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin: 0.5rem 0;
}

.scene-options {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

@media (min-width: 720px) {
  .scene-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.option {
  margin: 0;
  padding: 0.7rem 0.85rem;
  min-height: 2.9rem;
  text-align: left;
  font-weight: 600;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.6rem;
  background: var(--pico-card-background-color);
  cursor: pointer;
}

.option:hover {
  border-color: var(--pico-primary);
}

.option.selected {
  border-color: var(--pico-primary);
  background: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
}

.rank-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.rank-btn {
  flex: 0 0 auto;
  width: 3.2rem;
  min-height: 3rem;
  margin: 0;
  padding: 0;
  text-align: center;
  font-weight: 600;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.6rem;
  background: var(--pico-card-background-color);
  cursor: pointer;
}

.rank-btn:hover {
  border-color: var(--pico-primary);
}

.rank-btn.selected {
  border-color: var(--pico-primary);
  background: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
}

.carry {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.6rem;
  padding: 0.8rem 0.9rem;
}

.carry-title {
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.carry-line {
  margin-bottom: 0.25rem;
  overflow-wrap: anywhere;
}
</style>
