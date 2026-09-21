<script setup lang="ts">
import { computed, ref } from 'vue'

import { TOTAL_TICKS, XP_PER_RANK, pulseMax, type Rank } from '../types'
import type { Track } from '../types'
import * as store from '../store'
import ManualRef from '@/components/ManualRef.vue'

const props = defineProps<{ track: Track }>()

const flash = ref('')
const bloodAmount = ref(1)
const testResult = ref<'stylish' | 'flat' | 'failure' | null>(null)
const showRefuse = ref(false)

const full = computed(() => props.track.ticks >= TOTAL_TICKS)
const pmax = computed(() => pulseMax(props.track.rank))

function mark(): void {
  if (props.track.sealed) {
    store.grantSealedProgress()
    flash.value = 'Sealed Connection: +2 Rush instead of progress'
    return
  }
  store.markProgress(props.track.id)
  checkSeal()
}

function checkSeal(): void {
  if (props.track.ticks >= TOTAL_TICKS && !props.track.sealed) {
    const gained = store.sealConnection(props.track.id)
    flash.value = `Connection Sealed: +${gained} XP`
  }
}

function seal(): void {
  const gained = store.sealConnection(props.track.id)
  flash.value = `Connection Sealed: +${gained} XP`
}

function setTest(result: 'stylish' | 'flat' | 'failure'): void {
  testResult.value = result
  showRefuse.value = false
  if (result === 'stylish') {
    mark()
  } else if (result === 'flat') {
    mark()
    flash.value = 'Progress made — envision a demand or complication as fallout and pay the price'
  }
}

function drinkTheirBlood(): void {
  store.setBloodied(props.track.id, props.track.bloodiedByYou, true)
  flash.value = 'You drank their vampiric blood: Bloodied by them'
}

function demandMission(): void {
  const rank = Math.min(5, props.track.rank + 1) as Rank
  store.addTrack(
    'mission',
    `Prove loyalty to ${props.track.title}`,
    rank,
    'Take no benefit from this Connection until it is done.',
  )
  flash.value = `New Mission committed at Rank ${rank}`
}

function refuseConnection(): void {
  store.setTrackArchived(props.track.id, true)
}

function giveBlood(): void {
  store.giveBlood(props.track.id, bloodAmount.value)
  flash.value = `Gave ${bloodAmount.value} Blood: +${bloodAmount.value} Pulse, Bloodied by you`
}

function avoidDestruction(outcome: store.DestroyOutcome): void {
  store.resolveAvoidDestruction(props.track.id, outcome)
  flash.value =
    outcome === 'match'
      ? 'A match: they are dead or destroyed'
      : outcome === 'failure'
        ? 'They are out of action until you heal them'
        : outcome === 'flat'
          ? 'Recovered 1 Pulse, lost 1 Rush'
          : 'Recovered 1 Pulse'
}
</script>

<template>
  <div class="body">
    <div v-if="track.sealed" class="state-banner sealed">
      Sealed — a relationship of honest mutual trust. Further progress becomes +2 Rush.
    </div>
    <p v-else-if="full" class="warning" role="status">
      Track full: seal this Connection to claim its XP.
    </p>

    <div v-if="!track.sealed && !full" class="mark-row">
      <button type="button" class="mark-btn" @click="mark">Mark progress</button>
      <button
        type="button"
        class="ghost-btn"
        :disabled="track.ticks === 0"
        @click="store.undoProgress(track.id)"
      >
        Undo
      </button>
    </div>
    <div v-else-if="track.sealed" class="mark-row">
      <button type="button" class="mark-btn" @click="mark">Make progress → +2 Rush</button>
    </div>
    <div v-else class="mark-row">
      <button type="button" class="mark-btn" @click="seal">
        Seal — gain +{{ XP_PER_RANK[track.rank] }} XP
      </button>
      <ManualRef ref-key="connection-progress" label="Sealing a Connection" />
    </div>

    <details class="guidance">
      <summary>When to mark progress</summary>
      <ul>
        <li>Committing to a Mission in their service</li>
        <li>Completing a Mission that benefits them</li>
        <li>Relying on their help in desperate circumstances</li>
        <li>Sharing a profound and meaningful moment together</li>
        <li>Standing by them through hardship</li>
        <li>Overcoming a test of your relationship</li>
      </ul>
    </details>

    <details class="panel" :open="!track.sealed">
      <summary>
        Test the Connection (roll manually)
        <ManualRef ref-key="connection-test" label="Testing a Connection" />
      </summary>
      <p class="note">
        Roll with Soul if they are mortal, Charm if not; +1 if Sealed. Use the Roll Engine, then
        record the result here.
      </p>
      <div class="btn-row">
        <button type="button" class="ghost-btn" @click="setTest('stylish')">Stylish</button>
        <button type="button" class="ghost-btn" @click="setTest('flat')">Flat</button>
        <button type="button" class="ghost-btn" @click="setTest('failure')">Failure</button>
      </div>
      <template v-if="testResult === 'failure'">
        <p class="note">They demand proof of your loyalty. Pick one:</p>
        <div class="btn-col">
          <button type="button" class="mark-btn" @click="drinkTheirBlood">
            You drink their vampiric blood (Bloodied by them)
          </button>
          <button type="button" class="mark-btn" @click="demandMission">
            They require a Mission at Rank {{ Math.min(5, track.rank + 1) }}
          </button>
        </div>
        <p v-if="!showRefuse" class="note">
          If you refuse or fail, the Connection is permanently undone.
          <button type="button" class="link-btn" @click="showRefuse = true">Undo it</button>
        </p>
        <button v-else type="button" class="ghost-btn" @click="refuseConnection">
          Confirm: the Connection is permanently undone (archive)
        </button>
      </template>
    </details>

    <div v-if="track.pulse !== null" class="pulse-block">
      <h4>
        Pulse {{ track.pulse }} / {{ pmax }}
        <ManualRef ref-key="pulse" label="Connection Pulse" />
      </h4>
      <div class="btn-row">
        <button type="button" class="ghost-btn" @click="store.applyPulseDamage(track.id, 1)">
          −1 Pulse
        </button>
        <button type="button" class="ghost-btn" @click="store.applyPulseDamage(track.id, 2)">
          −2 Pulse
        </button>
        <button
          type="button"
          class="ghost-btn"
          :disabled="track.pulse >= pmax"
          @click="store.applyPulseHeal(track.id, 1)"
        >
          +1 Pulse
        </button>
      </div>

      <div v-if="track.pulse === 0 && !track.dead" class="limits">
        <p class="note">
          At 0 Pulse and losing more, they avoid destruction: roll your dice and add their Rank
          (manual roll).
        </p>
        <div class="btn-row wrap">
          <button type="button" class="ghost-btn" @click="avoidDestruction('stylish')">
            Stylish: +1 Pulse
          </button>
          <button type="button" class="ghost-btn" @click="avoidDestruction('flat')">
            Flat: +1 Pulse, −1 Rush
          </button>
          <button type="button" class="ghost-btn" @click="avoidDestruction('failure')">
            Failure: out of action
          </button>
          <button type="button" class="ghost-btn danger" @click="avoidDestruction('match')">
            Match: dead or destroyed
          </button>
        </div>
      </div>

      <p v-if="track.outOfAction && !track.dead" class="warning" role="status">
        Out of action until you heal them.
      </p>
      <p v-if="track.dead" class="warning" role="status">Dead or destroyed.</p>

      <details class="panel">
        <summary>Heal their Pulse</summary>
        <div class="btn-col">
          <button type="button" class="ghost-btn" @click="store.slumberHeal(track.id)">
            You slumber: they recover +{{ track.rank }} Pulse
          </button>
          <div class="blood-row">
            <select v-model.number="bloodAmount" aria-label="Blood to give">
              <option :value="1">1 Blood</option>
              <option :value="2">2 Blood</option>
              <option :value="3">3 Blood</option>
            </select>
            <button type="button" class="ghost-btn" @click="giveBlood">
              Give blood: +{{ bloodAmount }} Pulse
            </button>
          </div>
          <div class="heal-roll">
            <span class="note">They stop to heal (roll dice + {{ track.rank }}):</span>
            <div class="btn-row">
              <button type="button" class="ghost-btn" @click="store.letThemHeal(track.id, 'stylish')">
                Stylish +{{ track.rank }}
              </button>
              <button type="button" class="ghost-btn" @click="store.letThemHeal(track.id, 'flat')">
                Flat +{{ Math.ceil(track.rank / 2) }}
              </button>
              <button type="button" class="ghost-btn" @click="store.letThemHeal(track.id, 'failure')">
                Fail +{{ Math.floor(track.rank / 2) }}
              </button>
            </div>
          </div>
        </div>
        <p class="note">
          Letting them heal on a Failure: they recover half their Rank, rounded down, and the
          situation worsens — pay the price.
        </p>
      </details>
    </div>

    <div class="bloodied">
      <h4>
        Blood bonds
        <ManualRef ref-key="bloodied" label="Bloodying a Connection" />
      </h4>
      <label class="flag">
        <input
          type="checkbox"
          :checked="track.bloodiedByYou"
          @change="store.setBloodied(track.id, !track.bloodiedByYou, track.bloodiedByThem)"
        />
        <span>
          Bloodied by you — when you interact, roll one extra action die and pick the best.
        </span>
      </label>
      <label class="flag">
        <input
          type="checkbox"
          :checked="track.bloodiedByThem"
          @change="store.setBloodied(track.id, track.bloodiedByYou, !track.bloodiedByThem)"
        />
        <span>
          Bloodied by them — acting against them goes against your deepest impulses: subtract
          their Rank when you roll against them. Drunk against your will: no dots or Feats; not a
          real relationship, grants no bonuses.
        </span>
      </label>
    </div>

    <p v-if="flash" class="flash" role="status">{{ flash }}</p>
  </div>
</template>

<style scoped>
.mark-btn {
  width: 100%;
  padding-block: 0.9rem;
  font-weight: 600;
}

.btn-col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-row > * {
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

.guidance,
.panel {
  margin-top: 0.75rem;
  font-size: 0.92rem;
  color: var(--pico-muted-color);
}

.panel summary {
  cursor: pointer;
  color: var(--pico-color);
}

.note {
  font-size: 0.9rem;
  color: var(--pico-muted-color);
  margin: 0.4rem 0;
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

.state-banner {
  margin-top: 0.75rem;
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  background: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
  border-left: 4px solid var(--pico-primary);
  font-size: 0.92rem;
}

.limits {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border: 1px dashed var(--pico-muted-border-color);
  border-radius: 0.5rem;
}

.blood-row {
  display: flex;
  gap: 0.5rem;
}

.blood-row select {
  margin-bottom: 0;
  width: auto;
}

.heal-roll {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.link-btn {
  appearance: none;
  background: none;
  border: none;
  color: var(--pico-primary);
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}

.bloodied {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bloodied h4,
.pulse-block h4 {
  margin: 0 0 0.4rem;
}

.flag {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.92rem;
  margin: 0;
}

.flag span {
  flex: 1;
}

.flash {
  margin: 0.75rem 0 0;
  font-weight: 600;
  color: var(--pico-primary);
}

.danger {
  color: var(--pico-danger, #b03a2e);
}
</style>
