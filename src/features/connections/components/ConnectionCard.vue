<script setup lang="ts">
import { computed, ref } from 'vue'

import { game } from '@/store'
import ManualRef from '@/components/ManualRef.vue'

import * as store from '../store'
import {
  VERDICT_LABEL,
  compareRoll,
  isChallengeMatch,
  rollActionDie,
  rollChallengePair,
  type Verdict,
} from '../dice'
import {
  MARKS_TO_FILL,
  pulseMax,
  XP_PER_RANK,
  type Connection,
  type DestroyOutcome,
  type Rank,
  type TestOutcome,
} from '../types'

interface RollLine {
  attribute: string
  die: number
  bonus: number
  challenge: [number, number]
  score: number
  verdict: Verdict
  match: boolean
}

const props = defineProps<{ connection: Connection }>()

const editing = ref(false)
const nameDraft = ref('')
const confirmingDelete = ref(false)
const confirmingUndo = ref(false)
const showDemand = ref(false)
const flash = ref('')
const bloodAmount = ref(1)
const testRoll = ref<RollLine | null>(null)
const healRoll = ref<RollLine | null>(null)

const pmax = computed(() => pulseMax(props.connection.rank))
const bloodNow = computed(() => game.meters.blood.value)
const canGive = computed(() => !props.connection.dead && bloodNow.value >= bloodAmount.value)
const testAttribute = computed(() => (props.connection.mortal ? 'Soul' : 'Charm'))
const attributeValue = computed(() =>
  props.connection.mortal ? game.attributes.soul : game.attributes.charm,
)
const demandRank = computed(() => Math.min(5, props.connection.rank + 1) as Rank)

function startEdit(): void {
  nameDraft.value = props.connection.name
  editing.value = true
}

function saveName(): void {
  store.renameConnection(props.connection.id, nameDraft.value)
  editing.value = false
}

function setRank(event: Event): void {
  store.setRank(props.connection.id, Number((event.target as HTMLSelectElement).value))
}

function onDelete(): void {
  if (!confirmingDelete.value) {
    confirmingDelete.value = true
    return
  }
  store.removeConnection(props.connection.id)
}

function doSeal(): void {
  const gained = store.seal(props.connection.id)
  flash.value = `Connection Sealed: +${gained} XP (manual 1014–1016)`
}

function sealWithoutXp(): void {
  store.markSealed(props.connection.id)
  flash.value = 'Marked Sealed without XP — it was already claimed with the track'
}

function applyProgress(label: string): void {
  if (props.connection.sealed) {
    store.sealedProgressRush()
    flash.value = `${label} — Sealed Connection: +2 Rush instead of progress (manual 1017–1019)`
  } else {
    flash.value = `${label} — mark progress on the Connection's track in Progress Tracks (manual 1011–1016)`
  }
}

function recordTest(outcome: TestOutcome): void {
  if (props.connection.dead) return
  if (outcome === 'failure') {
    confirmingUndo.value = false
    showDemand.value = true
    return
  }
  confirmingUndo.value = false
  showDemand.value = false
  applyProgress(
    outcome === 'stylish'
      ? 'This test brings you closer'
      : 'Closer, at a cost — pay the price (manual 1036–1037)',
  )
}

function rollTest(): void {
  if (props.connection.dead) return
  confirmingUndo.value = false
  const die = rollActionDie()
  const bonus = props.connection.sealed ? 1 : 0
  const challenge = rollChallengePair()
  const score = die + attributeValue.value + bonus
  const verdict = compareRoll(score, challenge)
  testRoll.value = {
    attribute: testAttribute.value,
    die,
    bonus,
    challenge,
    score,
    verdict,
    match: isChallengeMatch(challenge),
  }
  recordTest(verdict)
}

function rollDestruction(): void {
  const die = rollActionDie()
  const challenge = rollChallengePair()
  const score = die + props.connection.rank
  const verdict = compareRoll(score, challenge)
  const match = isChallengeMatch(challenge)
  healRoll.value = null
  testRoll.value = null
  if (match) {
    store.resolveAvoidDestruction(props.connection.id, 'match')
    flash.value = 'A match: they are dead or destroyed (manual 1079)'
  } else if (verdict === 'stylish') {
    store.resolveAvoidDestruction(props.connection.id, 'stylish')
    flash.value = 'They avoid destruction: recovered 1 Pulse (manual 1074)'
  } else if (verdict === 'flat') {
    store.resolveAvoidDestruction(props.connection.id, 'flat')
    flash.value = 'Recovered 1 Pulse and lost 1 Rush (manual 1076)'
  } else {
    store.resolveAvoidDestruction(props.connection.id, 'failure')
    flash.value = 'They are out of action until you heal them (manual 1078)'
  }
}

function recordDestruction(outcome: DestroyOutcome): void {
  store.resolveAvoidDestruction(props.connection.id, outcome)
  flash.value =
    outcome === 'match'
      ? 'A match: they are dead or destroyed (manual 1079)'
      : outcome === 'failure'
        ? 'They are out of action until you heal them (manual 1078)'
        : outcome === 'flat'
          ? 'Recovered 1 Pulse and lost 1 Rush (manual 1076)'
          : 'Recovered 1 Pulse (manual 1074)'
}

function rollLetThemHeal(): void {
  const die = rollActionDie()
  const challenge = rollChallengePair()
  const score = die + props.connection.rank
  const verdict = compareRoll(score, challenge)
  healRoll.value = {
    attribute: `+${props.connection.rank} Rank`,
    die,
    bonus: 0,
    challenge,
    score,
    verdict,
    match: isChallengeMatch(challenge),
  }
  if (verdict === 'stylish') {
    store.letThemHeal(props.connection.id, 'stylish')
    flash.value = `They recovered their Rank in Pulse (+${props.connection.rank})`
  } else if (verdict === 'flat') {
    store.letThemHeal(props.connection.id, 'flat')
    flash.value = `They recovered +${Math.ceil(props.connection.rank / 2)} Pulse (half Rank, rounded up)`
  } else {
    store.letThemHeal(props.connection.id, 'failure')
    flash.value = 'They recovered half Rank, rounded down — the situation worsens: pay the price'
  }
}

function giveBlood(): void {
  if (!store.giveBlood(props.connection.id, bloodAmount.value)) {
    flash.value = `Need ${bloodAmount.value} Blood to give — you have ${bloodNow.value}.`
    return
  }
  flash.value = `Gave ${bloodAmount.value} Blood: +${bloodAmount.value} Pulse, now Bloodied by you — Try Your Conscience at the end of the scene (manual 1036–1037)`
}

function drinkTheirBlood(): void {
  store.setBloodied(props.connection.id, props.connection.bloodiedByYou, true)
  confirmingUndo.value = false
  showDemand.value = false
  flash.value = 'You drank their vampiric blood: Bloodied by them (manual 1041)'
}

function demandMission(): void {
  store.setLoyaltyDemand(props.connection.id, true)
  confirmingUndo.value = false
  showDemand.value = false
  flash.value = `They require a Mission at Rank ${demandRank.value} — commit it in Progress Tracks`
}

function refuse(): void {
  if (!confirmingUndo.value) {
    confirmingUndo.value = true
    return
  }
  store.removeConnection(props.connection.id)
}
</script>

<template>
  <article class="connection-card" :class="{ dead: connection.dead }">
    <header class="head">
      <h3 v-if="!editing" class="title" @click="startEdit">{{ connection.name }}</h3>
      <input
        v-else
        v-model="nameDraft"
        class="title-input"
        type="text"
        :aria-label="`Name for ${connection.name}`"
        @blur="saveName"
        @keyup.enter="saveName"
      />
      <label class="rank-pick">
        Rank
        <select :value="connection.rank" :aria-label="`Rank for ${connection.name}`" @change="setRank">
          <option v-for="r in 5" :key="r" :value="r">{{ r }}</option>
        </select>
      </label>
    </header>

    <div class="tags" v-if="connection.sealed || connection.bloodiedByYou || connection.bloodiedByThem || connection.loyaltyDemand || connection.outOfAction || connection.dead">
      <span v-if="connection.dead" class="tag bad">Dead or destroyed</span>
      <span v-else-if="connection.outOfAction" class="tag bad">Out of action</span>
      <span v-if="connection.sealed" class="tag good">Sealed</span>
      <span v-if="connection.bloodiedByYou" class="tag">Bloodied by you</span>
      <span v-if="connection.bloodiedByThem" class="tag">Bloodied by them</span>
      <span v-if="connection.loyaltyDemand" class="tag bad">Loyalty Mission pending</span>
    </div>

    <p v-if="connection.sealed" class="banner sealed">
      Sealed — a relationship of honest mutual trust. Tests add +1; further progress gains
      +2 Rush instead of progress (manual 1014–1019).
    </p>
    <p v-if="connection.loyaltyDemand" class="banner demand" role="status">
      They require a Mission at Rank {{ demandRank }}. Until it is done, take no benefit from this
      Connection (manual 1042–1046).
      <button type="button" class="ghost-btn small" @click="store.setLoyaltyDemand(connection.id, false)">
        Mission done — restore benefit
      </button>
    </p>
    <p v-if="connection.pulse === 0 && !connection.dead" class="banner bad" role="status">
      At 0 Pulse and losing more, they must avoid destruction (manual 1071–1079).
    </p>

    <details class="panel" :open="!connection.sealed && !connection.dead">
      <summary>
        Progress &amp; sealing
        <ManualRef ref-key="connection-progress" label="Making Progress / Sealing a Connection" />
      </summary>
      <div v-if="!connection.sealed" class="btn-col">
        <button type="button" class="seal-btn" :disabled="connection.dead" @click="doSeal">
          Mark Sealed — gain +{{ XP_PER_RANK[connection.rank] }} XP
        </button>
        <button type="button" class="ghost-btn small" @click="sealWithoutXp">
          Mark Sealed without XP (already claimed on the track)
        </button>
        <p class="note">
          Filling the whole track Seals the Connection (manual 1011–1016). Marks happen on its
          track in the <RouterLink to="/tracks">Progress Tracks tool</RouterLink> — at Rank
          {{ connection.rank }}, {{ MARKS_TO_FILL[connection.rank] }} marks fill the track
          (progress per Rank, manual 924–927).
        </p>
      </div>
      <div v-else class="btn-col">
        <button type="button" class="seal-btn" @click="applyProgress('Progress made')">
          Make progress → +2 Rush
        </button>
      </div>
    </details>

    <details class="panel">
      <summary>
        Test the Connection
        <ManualRef ref-key="connection-test" label="Testing a Connection" />
      </summary>
      <label class="flag">
        <input
          type="checkbox"
          :checked="connection.mortal"
          @change="store.setMortal(props.connection.id, !connection.mortal)"
        />
        <span>Mortal — tests roll with Soul; otherwise Charm (manual 1028–1029).</span>
      </label>
      <p class="note">
        Roll with {{ testAttribute }}{{ connection.sealed ? ', +1 for being Sealed' : '' }}.
        Soul {{ game.attributes.soul }} · Charm {{ game.attributes.charm }} on the Character Sheet.
      </p>
      <div class="btn-row">
        <button type="button" class="ghost-btn" :disabled="connection.dead" @click="rollTest">Roll the test</button>
      </div>
      <p v-if="testRoll" class="roll-line" role="status">
        1d6 {{ testRoll.die }} + {{ testRoll.attribute }} {{ attributeValue }}<template v-if="testRoll.bonus"> +1 Sealed</template>
        = {{ testRoll.score }} vs {{ testRoll.challenge[0] }}, {{ testRoll.challenge[1] }} —
        <strong>{{ VERDICT_LABEL[testRoll.verdict] }}</strong>
      </p>
      <p v-if="testRoll?.match" class="note">
        Challenge match: consult the Roll Engine for Twist, Misfortune or Impulse (manual 513–524).
      </p>
      <p class="note">Rolled in the Roll Engine instead? Record it:</p>
      <div class="btn-row">
        <button type="button" class="ghost-btn" :disabled="connection.dead" @click="recordTest('stylish')">Stylish</button>
        <button type="button" class="ghost-btn" :disabled="connection.dead" @click="recordTest('flat')">Flat</button>
        <button type="button" class="ghost-btn" :disabled="connection.dead" @click="recordTest('failure')">Failure</button>
      </div>
      <template v-if="showDemand">
        <p class="note">They demand proof of your loyalty. Pick one (manual 1038–1046):</p>
        <div class="btn-col">
          <button type="button" class="ghost-btn" @click="drinkTheirBlood">
            You drink their vampiric blood — Bloodied by them
          </button>
          <button type="button" class="ghost-btn" @click="demandMission">
            They require a Mission at Rank {{ demandRank }}
          </button>
          <button type="button" class="ghost-btn danger" @click="refuse">
            {{ confirmingUndo ? 'Confirm: permanently undone' : 'Refuse — the Connection is permanently undone' }}
          </button>
        </div>
      </template>
      <p v-if="!showDemand" class="note">
        No interest in maintaining the relationship? Treat the test as a Failure (manual 1031–1032).
      </p>
    </details>

    <details class="panel" open>
      <summary>
        Pulse {{ connection.pulse }} / {{ pmax }}
        <ManualRef ref-key="pulse" label="Pulse, limits and healing" />
      </summary>
      <p class="note">Their maximum Pulse equals their Rank + 2; damage comes off Pulse as Health does from you.</p>
      <div class="btn-row">
        <button type="button" class="ghost-btn" :disabled="connection.pulse === 0 || connection.dead" @click="store.damagePulse(props.connection.id, 1)">−1 Pulse</button>
        <button type="button" class="ghost-btn" :disabled="connection.pulse === 0 || connection.dead" @click="store.damagePulse(props.connection.id, 2)">−2 Pulse</button>
        <button type="button" class="ghost-btn" :disabled="connection.pulse >= pmax || connection.dead" @click="store.healPulse(props.connection.id, 1)">+1 Pulse</button>
      </div>

      <div v-if="connection.pulse === 0 && !connection.dead" class="sub">
        <p class="note">
          Avoiding destruction: roll your dice and add their Rank ({{ connection.rank }}) instead of
          an Attribute.
        </p>
        <div class="btn-row">
          <button type="button" class="ghost-btn" @click="rollDestruction">Roll dice + {{ connection.rank }}</button>
        </div>
        <p class="note">Or record a manually rolled outcome:</p>
        <div class="btn-row wrap">
          <button type="button" class="ghost-btn small" @click="recordDestruction('stylish')">Stylish: +1 Pulse</button>
          <button type="button" class="ghost-btn small" @click="recordDestruction('flat')">Flat: +1 Pulse, −1 Rush</button>
          <button type="button" class="ghost-btn small" @click="recordDestruction('failure')">Failure: out of action</button>
          <button type="button" class="ghost-btn small danger" @click="recordDestruction('match')">Match: dead or destroyed</button>
        </div>
      </div>

      <div class="heal-routes">
        <h4>Restore Pulse (manual 1057–1079)</h4>
        <div class="btn-row">
          <button type="button" class="ghost-btn" :disabled="connection.dead" @click="store.slumberHeal(props.connection.id)">
            You slumber: +{{ connection.rank }} Pulse
          </button>
        </div>
        <div class="blood-row">
          <select v-model.number="bloodAmount" aria-label="Blood to give">
            <option :value="1">1 Blood</option>
            <option :value="2">2 Blood</option>
            <option :value="3">3 Blood</option>
          </select>
          <button type="button" class="ghost-btn" :disabled="!canGive" @click="giveBlood">
            Give blood: +{{ bloodAmount }} Pulse, −{{ bloodAmount }} Blood (you have {{ bloodNow }})
          </button>
        </div>
        <div class="btn-row wrap">
          <button type="button" class="ghost-btn" :disabled="connection.dead" @click="rollLetThemHeal">
            Let them heal: roll dice + {{ connection.rank }}
          </button>
          <button type="button" class="ghost-btn small" :disabled="connection.dead" @click="store.letThemHeal(props.connection.id, 'stylish')">Stylish +{{ props.connection.rank }}</button>
          <button type="button" class="ghost-btn small" :disabled="connection.dead" @click="store.letThemHeal(props.connection.id, 'flat')">Flat +{{ Math.ceil(props.connection.rank / 2) }}</button>
          <button type="button" class="ghost-btn small" :disabled="connection.dead" @click="store.letThemHeal(props.connection.id, 'failure')">Fail +{{ Math.floor(props.connection.rank / 2) }}</button>
        </div>
        <p v-if="healRoll" class="roll-line" role="status">
          1d6 {{ healRoll.die }} + Rank {{ connection.rank }} = {{ healRoll.score }} vs
          {{ healRoll.challenge[0] }}, {{ healRoll.challenge[1] }} —
          <strong>{{ VERDICT_LABEL[healRoll.verdict] }}</strong>
        </p>
        <p v-if="healRoll?.match" class="note">
          Challenge match: consult the Roll Engine for Twist, Misfortune or Impulse (manual 513–524).
        </p>
        <p class="note">
          Letting them heal on a Failure: half Rank, rounded down, and the situation worsens —
          pay the price (manual 1076–1077).
        </p>
      </div>
    </details>

    <details class="panel">
      <summary>
        Blood bonds
        <ManualRef ref-key="bloodied" label="Bloodying a Connection" />
      </summary>
      <label class="flag">
        <input
          type="checkbox"
          :checked="connection.bloodiedByYou"
          @change="store.setBloodied(props.connection.id, !connection.bloodiedByYou, connection.bloodiedByThem)"
        />
        <span>
          <strong>Bloodied by you.</strong> Letting them drink binds them to you: make progress,
          and Try Your Conscience at the end of the scene. When you interact with them, roll one
          extra action die and pick the best (manual 1032–1045).
        </span>
      </label>
      <label class="flag">
        <input
          type="checkbox"
          :checked="connection.bloodiedByThem"
          @change="store.setBloodied(props.connection.id, connection.bloodiedByYou, !connection.bloodiedByThem)"
        />
        <span>
          <strong>Bloodied by them.</strong> You drank their vampiric veins and are bound to them.
          Acting against them goes against your deepest impulses: when you roll against them,
          subtract their Rank (manual 1043–1051).
        </span>
      </label>
      <label v-if="connection.bloodiedByThem" class="flag">
        <input
          type="checkbox"
          :checked="connection.boundAgainstWill"
          @change="store.setBoundAgainstWill(props.connection.id, !connection.boundAgainstWill)"
        />
        <span>
          Drank against your will — no dots or Feats: not a real relationship, grants no bonuses
          (manual 1046–1048).
        </span>
      </label>
    </details>

    <details class="panel">
      <summary>Notes &amp; links</summary>
      <label class="field">
        <span>Notes</span>
        <textarea
          rows="3"
          :value="connection.notes"
          :aria-label="`Notes for ${connection.name}`"
          @input="store.setNotes(props.connection.id, ($event.target as HTMLTextAreaElement).value)"
        ></textarea>
      </label>
      <label class="field">
        <span>Linked track in Progress Tracks (name or id, reference only)</span>
        <input
          type="text"
          :value="connection.trackNote"
          :aria-label="`Linked track for ${connection.name}`"
          @change="store.setTrackNote(props.connection.id, ($event.target as HTMLInputElement).value)"
        />
      </label>
    </details>

    <footer class="foot">
      <button type="button" class="ghost-btn small danger" @click="onDelete">
        {{ confirmingDelete ? 'Confirm delete' : 'Delete' }}
      </button>
      <p v-if="flash" class="flash" role="status">{{ flash }}</p>
    </footer>
  </article>
</template>

<style scoped>
.connection-card {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.75rem;
  padding: 1rem 1.1rem 1.1rem;
  background: var(--pico-card-background-color);
}

.connection-card.dead {
  opacity: 0.7;
}

.head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.title {
  margin: 0;
  cursor: text;
  flex: 1;
  min-width: 6rem;
  overflow-wrap: anywhere;
}

.title-input {
  flex: 1;
  min-width: 6rem;
  margin-bottom: 0;
}

.rank-pick {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  margin: 0;
}

.rank-pick select {
  width: auto;
  margin-bottom: 0;
  padding: 0.25rem 1.6rem 0.25rem 0.5rem;
  font-size: 0.85rem;
}

.tags {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-top: 0.55rem;
}

.tag {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: var(--pico-secondary-background);
  color: var(--pico-secondary-inverse);
}

.tag.good {
  background: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
}

.tag.bad {
  background: var(--pico-secondary-background);
  color: var(--pico-secondary-inverse);
}

.banner {
  margin-top: 0.6rem;
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  border-left: 4px solid var(--pico-primary);
  background: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
  font-size: 0.92rem;
}

.banner.demand {
  background: var(--pico-secondary-background);
  color: var(--pico-secondary-inverse);
  border-left-color: var(--pico-primary);
}

.banner.bad {
  background: var(--pico-secondary-background);
  color: var(--pico-secondary-inverse);
  border-left-color: var(--pico-danger, #b03a2e);
}

.banner .ghost-btn {
  margin-top: 0.4rem;
}

.panel {
  margin-top: 0.7rem;
  font-size: 0.92rem;
}

.panel summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--pico-color);
}

.panel summary .manual-ref-btn {
  margin-left: 0.3rem;
}

.btn-col {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.btn-row.wrap {
  margin-top: 0.35rem;
}

.seal-btn {
  padding-block: 0.85rem;
  font-weight: 600;
}

.note {
  font-size: 0.88rem;
  color: var(--pico-muted-color);
  margin: 0.4rem 0 0;
}

.roll-line {
  font-variant-numeric: tabular-nums;
  font-size: 0.9rem;
  margin: 0.4rem 0 0;
}

.sub {
  margin-top: 0.6rem;
  padding: 0.55rem 0.65rem;
  border: 1px dashed var(--pico-muted-border-color);
  border-radius: 0.5rem;
}

.heal-routes {
  margin-top: 0.8rem;
  padding-top: 0.6rem;
  border-top: 1px solid var(--pico-muted-border-color);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.heal-routes h4 {
  margin: 0 0 0.25rem;
}

.blood-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 0.35rem;
}

.blood-row select {
  margin-bottom: 0;
  width: auto;
}

.flag {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.flag span {
  flex: 1;
  font-size: 0.88rem;
}

.field {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--pico-muted-color);
}

.field textarea,
.field input {
  margin-bottom: 0;
}

.foot {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.flash {
  margin: 0;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--pico-primary);
  flex: 1;
  min-width: 12rem;
}
</style>
