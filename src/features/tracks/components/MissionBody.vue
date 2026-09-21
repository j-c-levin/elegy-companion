<script setup lang="ts">
import { computed, ref } from 'vue'

import { compareRoll, rollChallengePair, VERDICT_LABEL } from '../dice'
import { XP_PER_RANK, TOTAL_TICKS, progressScore, type Rank } from '../types'
import type { Track } from '../types'
import * as store from '../store'
import ManualRef from '@/components/ManualRef.vue'

const props = defineProps<{ track: Track }>()

const newStep = ref('')
const fulfillOpen = ref(false)
const roll = ref<{ d1: number; d2: number; verdict: ReturnType<typeof compareRoll> } | null>(null)
const flatMode = ref<'choice' | 'new-mission'>('choice')
const newMissionTitle = ref('')
const failureMode = ref<'choice' | 'recommit' | 'abandon'>('choice')
const recommit = ref<{ d1: number; d2: number; lower: number } | null>(null)
const done = ref(false)
const doneMessage = ref('')
type AbandonConsequence = 'demoralized' | 'innocent' | 'reputation' | 'enemy'
const appliedConsequences = ref<Record<AbandonConsequence, boolean>>({
  demoralized: false,
  innocent: false,
  reputation: false,
  enemy: false,
})

const score = computed(() => progressScore(props.track.ticks))
const full = computed(() => props.track.ticks >= TOTAL_TICKS)
const xp = computed(() => XP_PER_RANK[props.track.rank])
const reducedXp = computed(() =>
  props.track.rank > 1 ? XP_PER_RANK[(props.track.rank - 1) as Rank] : 0,
)

function addStep(): void {
  store.addStep(props.track.id, newStep.value)
  newStep.value = ''
}

function doRoll(): void {
  const [d1, d2] = rollChallengePair()
  roll.value = { d1, d2, verdict: compareRoll(score.value, [d1, d2]) }
  flatMode.value = 'choice'
  failureMode.value = 'choice'
  recommit.value = null
}

function finish(message: string): void {
  done.value = true
  doneMessage.value = message
}

function bankStylish(): void {
  const gained = store.grantMissionXp(props.track.id)
  finish(`Mission fulfilled: +${gained} XP`)
}

function commitFollowUp(): void {
  const gained = store.grantMissionXp(props.track.id)
  store.addTrack(
    'mission',
    newMissionTitle.value.trim() || `Follow-up: ${props.track.title}`,
    props.track.rank,
  )
  finish(`Committed a follow-up Mission at Rank ${props.track.rank}: +${gained} XP`)
}

function reduceReward(): void {
  const amount = reducedXp.value
  if (amount > 0) {
    store.grantXp(amount)
    finish(`Reward reduced by one Rank: +${amount} XP`)
  } else {
    finish('Rank 1 Mission: reward reduced to nothing')
  }
}

function doRecommitRoll(): void {
  const [d1, d2] = rollChallengePair()
  const lower = Math.min(d1, d2)
  recommit.value = { d1, d2, lower }
  store.recommitMission(props.track.id, lower)
}

function applyConsequence(kind: AbandonConsequence): void {
  if (appliedConsequences.value[kind]) return
  appliedConsequences.value[kind] = true
  if (kind === 'enemy') store.loseRush()
  else store.loseClarity()
}

function archive(): void {
  store.setTrackArchived(props.track.id, true)
}
</script>

<template>
  <div class="body">
    <div class="step-list">
      <label v-for="step in track.steps" :key="step.id" class="step">
        <input
          type="checkbox"
          :checked="step.done"
          @change="store.toggleStep(track.id, step.id)"
        />
        <span :class="{ done: step.done }">{{ step.text }}</span>
        <button
          type="button"
          class="ghost-btn small"
          aria-label="Remove step"
          @click.prevent="store.removeStep(track.id, step.id)"
        >
          Remove
        </button>
      </label>
    </div>
    <form class="step-add" @submit.prevent="addStep">
      <input v-model="newStep" type="text" placeholder="Add a step" aria-label="Add a step" />
      <button type="submit" class="ghost-btn">Add</button>
    </form>

    <div class="mark-row">
      <button type="button" class="mark-btn" :disabled="full" @click="store.markProgress(track.id)">
        Mark progress
      </button>
      <button
        type="button"
        class="ghost-btn"
        :disabled="track.ticks === 0"
        @click="store.undoProgress(track.id)"
      >
        Undo
      </button>
    </div>

    <details class="guidance">
      <summary>When to mark progress</summary>
      <ul>
        <li>Overcoming a critical obstacle</li>
        <li>Gaining meaningful insight</li>
        <li>Acquiring a crucial item or resource</li>
        <li>Earning vital support</li>
        <li>Defeating a notable foe standing in your way</li>
      </ul>
      <p>
        Unplanned challenges that advance the Mission mark progress as normal. If the track fills
        before you fulfill the Mission in the fiction, keep playing but mark no more: the Mission
        only ends when the narrative says it does.
      </p>
    </details>

    <p v-if="full && !done" class="warning" role="status">
      Track full but the Mission is not fulfilled: keep playing, mark no more progress.
    </p>

    <div class="fulfill">
      <div v-if="!fulfillOpen" class="fulfill-open-row">
        <button type="button" class="ghost-btn" @click="fulfillOpen = true">
          Fulfill — roll 2d10 vs {{ score }}
        </button>
        <ManualRef ref-key="missions" label="Fulfilling a Mission" />
      </div>
      <template v-else>
        <div class="roll-row">
          <button type="button" class="ghost-btn" :disabled="done" @click="doRoll">
            Roll two challenge dice
          </button>
          <span class="score-chip">Progress {{ score }}</span>
          <button type="button" class="ghost-btn small" @click="fulfillOpen = false">Close</button>
        </div>

        <div v-if="roll" class="roll-result">
          <p class="dice">
            <span class="die">{{ score }}</span>
            <span class="die-sep">vs</span>
            <span class="die dark">{{ roll.d1 }}</span>
            <span class="die dark">{{ roll.d2 }}</span>
          </p>
          <p class="verdict" :class="roll.verdict">{{ VERDICT_LABEL[roll.verdict] }}</p>
          <p v-if="roll.d1 === roll.d2" class="note">
            Match on the challenge dice — surface the Twist or Misfortune table from the Roll
            Engine before resolving.
          </p>

          <template v-if="roll.verdict === 'stylish'">
            <button v-if="!done" type="button" class="mark-btn" @click="bankStylish">
              Fulfilled — bank +{{ xp }} XP
            </button>
          </template>

          <template v-else-if="roll.verdict === 'flat'">
            <template v-if="!done">
              <template v-if="flatMode === 'choice'">
                <p class="note">
                  There is more to be done, or the true nature of the Mission is only now revealed.
                </p>
                <button type="button" class="mark-btn" @click="flatMode = 'new-mission'">
                  Commit a new Mission — take the full reward (+{{ xp }} XP)
                </button>
                <button type="button" class="ghost-btn" @click="reduceReward">
                  Reduce the reward by one Rank
                  {{ reducedXp > 0 ? `(+${reducedXp} XP)` : '(Rank 1: no XP)' }}
                </button>
              </template>
              <template v-else>
                <input
                  v-model="newMissionTitle"
                  type="text"
                  :placeholder="`Follow-up: ${track.title}`"
                  aria-label="New Mission title"
                />
                <button type="button" class="mark-btn" @click="commitFollowUp">
                  Commit and take +{{ xp }} XP
                </button>
              </template>
            </template>
          </template>

          <template v-else>
            <template v-if="failureMode === 'choice'">
              <p class="note">
                Your success is undone by a harsh surprise or realization. Envision what happens,
                then choose one.
              </p>
              <button type="button" class="mark-btn" @click="failureMode = 'recommit'">
                Recommit to the Mission
              </button>
              <button type="button" class="ghost-btn" @click="failureMode = 'abandon'">
                Abandon the Mission
              </button>
            </template>

            <template v-else-if="failureMode === 'recommit'">
              <button v-if="!recommit" type="button" class="mark-btn" @click="doRecommitRoll">
                Roll two challenge dice
              </button>
              <p v-if="recommit" class="note">
                Rolled {{ recommit.d1 }} and {{ recommit.d2 }} — take the lower ({{ recommit.lower }}):
                cleared {{ recommit.lower }} box{{ recommit.lower === 1 ? '' : 'es' }},
                Mission Rank is now {{ track.rank }}.
              </p>
              <button type="button" class="ghost-btn" @click="fulfillOpen = false">Done</button>
            </template>

            <template v-else>
              <p class="note">
                Envision the impact and choose one or more consequences appropriate to its nature.
              </p>
              <ul class="consequences">
                <li>
                  <span>You are deeply demoralized: lose Clarity.</span>
                  <button
                    type="button"
                    class="ghost-btn small"
                    :disabled="appliedConsequences.demoralized"
                    @click="applyConsequence('demoralized')"
                  >
                    {{ appliedConsequences.demoralized ? 'Applied' : '−1 Clarity' }}
                  </button>
                </li>
                <li>
                  <span>
                    A Connection loses trust in you: test that Connection the next time you
                    interact (its card has the test flow).
                  </span>
                </li>
                <li>
                  <span>Someone innocent bears the heavy cost of your failure: lose Clarity.</span>
                  <button
                    type="button"
                    class="ghost-btn small"
                    :disabled="appliedConsequences.innocent"
                    @click="applyConsequence('innocent')"
                  >
                    {{ appliedConsequences.innocent ? 'Applied' : '−1 Clarity' }}
                  </button>
                </li>
                <li>
                  <span>An enemy gains power: lose Rush.</span>
                  <button
                    type="button"
                    class="ghost-btn small"
                    :disabled="appliedConsequences.enemy"
                    @click="applyConsequence('enemy')"
                  >
                    {{ appliedConsequences.enemy ? 'Applied' : '−1 Rush' }}
                  </button>
                </li>
                <li>
                  <span>This stains your reputation: lose Clarity.</span>
                  <button
                    type="button"
                    class="ghost-btn small"
                    :disabled="appliedConsequences.reputation"
                    @click="applyConsequence('reputation')"
                  >
                    {{ appliedConsequences.reputation ? 'Applied' : '−1 Clarity' }}
                  </button>
                </li>
                <li>
                  <span>
                    As a punishment, you drink their vampiric blood: mark that Connection as
                    Bloodied by them on its card.
                  </span>
                </li>
              </ul>
              <button type="button" class="mark-btn" @click="archive">
                Mission abandoned — archive it
              </button>
            </template>
          </template>
        </div>
      </template>
    </div>

    <div v-if="done" class="done-panel">
      <p class="flash" role="status">{{ doneMessage }}</p>
      <button type="button" class="mark-btn" @click="archive">Archive this Mission</button>
    </div>
  </div>
</template>

<style scoped>
.mark-btn {
  width: 100%;
  padding-block: 0.9rem;
  font-weight: 600;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.step span.done {
  text-decoration: line-through;
  color: var(--pico-muted-color);
}

.step button {
  margin-left: auto;
}

.step-add {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.step-add input {
  margin-bottom: 0;
  flex: 1;
}

.mark-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.mark-row .mark-btn {
  flex: 1;
}

.guidance {
  margin-top: 0.75rem;
  font-size: 0.92rem;
  color: var(--pico-muted-color);
}

.guidance p {
  margin-bottom: 0.25rem;
}

.warning {
  margin-top: 0.75rem;
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  background: var(--pico-secondary-background);
  color: var(--pico-secondary-inverse);
  border-left: 4px solid var(--pico-primary);
  font-size: 0.92rem;
}

.fulfill {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.fulfill-open-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fulfill-open-row .ghost-btn {
  flex: 1;
}

.roll-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.score-chip {
  font-size: 0.9rem;
  color: var(--pico-muted-color);
}

.dice {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.die {
  display: inline-block;
  min-width: 2.4rem;
  text-align: center;
  padding: 0.3rem 0.4rem;
  border-radius: 0.4rem;
  background: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
}

.die.dark {
  background: var(--pico-secondary-background);
  color: var(--pico-secondary-inverse);
}

.die-sep {
  font-size: 0.9rem;
  color: var(--pico-muted-color);
}

.verdict.stylish {
  color: var(--pico-primary);
  font-weight: 700;
}

.verdict.flat {
  font-weight: 700;
}

.verdict.failure {
  color: var(--pico-muted-color);
  font-weight: 700;
}

.note {
  font-size: 0.92rem;
  color: var(--pico-muted-color);
  margin: 0;
}

.consequences {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.92rem;
}

.consequences li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.5rem;
}

.consequences li > span {
  flex: 1;
}

.done-panel {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.flash {
  margin: 0;
  font-weight: 600;
  color: var(--pico-primary);
}
</style>
