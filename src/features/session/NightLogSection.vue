<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'

import ManualRef from '@/components/ManualRef.vue'
import { game } from '@/store'

import { clearLog, loadLog, slumber, stayAwake, type NightResult } from './night-log'

const looseEndText = ref('')
const violatedLaw = ref(false)
const mitigateBlood = ref(false)
const result = ref<NightResult | null>(null)
const log = ref(loadLog())
const confirmingClear = ref(false)
let confirmTimer: number | undefined

const starving = computed(() => game.activeConditions.includes('Starving'))
const cautioned = computed(() => game.activeConditions.includes('Cautioned'))
const canMitigateStay = computed(() => !starving.value && game.meters.rush.value > 0)
const canSlumber = computed(() => looseEndText.value.trim().length > 0)

function doSlumber(): void {
  if (!canSlumber.value) return
  result.value = slumber(looseEndText.value, violatedLaw.value)
  if (result.value) {
    looseEndText.value = ''
    violatedLaw.value = false
  }
  log.value = loadLog()
}

function doStayAwake(): void {
  result.value = stayAwake(mitigateBlood.value)
  log.value = loadLog()
}

function doClear(): void {
  if (!confirmingClear.value) {
    confirmingClear.value = true
    confirmTimer = window.setTimeout(() => {
      confirmingClear.value = false
    }, 4000)
    return
  }
  window.clearTimeout(confirmTimer)
  confirmingClear.value = false
  clearLog()
  result.value = null
  log.value = loadLog()
}

onBeforeUnmount(() => window.clearTimeout(confirmTimer))

const whenFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

function when(iso: string): string {
  return whenFormat.format(new Date(iso))
}

function rushText(delta: number): string {
  if (delta > 0) return `+${delta} Rush`
  if (delta < 0) return `${delta} Rush`
  return 'no Rush change'
}
</script>

<template>
  <section aria-labelledby="night-log-heading">
    <h2 id="night-log-heading">Night log</h2>
    <p class="lede">
      Close each night with the slumber routine (manual 767–778 <ManualRef ref-key="slumber" />):
      lose 1 Blood that cannot be mitigated, gain +1 Rush, try your Standing if the laws or customs
      of vampire society were violated, and leave one lingering question as a Loose End.
    </p>

    <article class="panel">
      <ol class="steps">
        <li>
          <span class="step-title">Lose 1 Blood — cannot be mitigated</span>
          <span class="step-detail">
            Blood context: manual 762–805 <ManualRef ref-key="blood" />
          </span>
        </li>
        <li>
          <span class="step-title">Gain +1 Rush</span>
          <span class="step-detail">
            Capped at your max Rush (manual 363–375 <ManualRef ref-key="rush" />)
          </span>
        </li>
        <li>
          <label class="toggle">
            <input type="checkbox" role="switch" v-model="violatedLaw" />
            <span>
              Violated a law or custom of vampire society tonight
              <small class="step-detail">
                If so: Try Your Standing — roll with Charm (manual 856–907
                <ManualRef ref-key="standing" />)
              </small>
            </span>
          </label>
        </li>
        <li>
          <label class="lingering" for="lingering-question">
            <span class="step-title">Write a lingering question as a Loose End</span>
            <small class="step-detail">
              Manual 1150–1152 <ManualRef ref-key="loose-end-write" />
            </small>
          </label>
          <input
            id="lingering-question"
            v-model="looseEndText"
            type="text"
            placeholder="Who was the figure watching from the rooftop?"
            autocomplete="off"
          />
        </li>
      </ol>

      <div class="meter-strip">
        <span>Blood {{ game.meters.blood.value }} / {{ game.meters.blood.max }}</span>
        <span>Rush {{ game.meters.rush.value }} <small>(base {{ game.meters.rush.base }}, max {{ game.meters.rush.max }})</small></span>
      </div>

      <button type="button" class="primary" :disabled="!canSlumber" @click="doSlumber">
        Slumber until dusk
      </button>
      <p v-if="!canSlumber" class="hint">Write the night's lingering question to finish the routine.</p>

      <details class="awake">
        <summary>Stay awake through the day instead</summary>
        <p class="step-detail">
          Lose 2 Blood and Flow Your Blood with Soul in the Roll Engine. On any Success you remain
          awake for one day scene; when it ends, you must sleep or do this again (manual 773–776
          <ManualRef ref-key="slumber" />).
        </p>
        <label v-if="!starving" class="toggle">
          <input type="checkbox" role="switch" v-model="mitigateBlood" :disabled="!canMitigateStay" />
          <span>
            Spend 1 Rush to lose 1 less Blood (manual 779–783 <ManualRef ref-key="mitigate-blood" />)
          </span>
        </label>
        <p v-else class="step-detail">
          Mitigation is unavailable while Starving (manual 779–783
          <ManualRef ref-key="mitigate-blood" />).
        </p>
        <button type="button" class="ghost" @click="doStayAwake">Stay awake instead (lose {{ mitigateBlood && canMitigateStay ? 1 : 2 }} Blood)</button>
      </details>
    </article>

    <article v-if="result" class="panel result" aria-live="polite">
      <h3>{{ result.outcome === 'slumber' ? 'Slumbered until dusk' : 'Stayed awake through the day' }}</h3>
      <ul class="effects">
        <li>
          Blood {{ result.bloodBefore }} → {{ result.bloodAfter }}<template v-if="result.clamped"> — clamped at 0</template>
        </li>
        <li>Rush {{ result.rushBefore }} → {{ result.rushAfter }}</li>
        <li v-if="result.looseEnd">Loose End written: “{{ result.looseEnd }}”</li>
      </ul>

      <div v-if="result.clamped" class="prompt warning">
        <p>
          You lost Blood while at 0 — the cascade (Starving → Enraged → Torpid) applies (manual
          806–825 <ManualRef ref-key="blood-cascade" />).
        </p>
        <RouterLink to="/character">On the Character Sheet, press Lose 1 on the Blood meter</RouterLink>
      </div>

      <div v-if="result.standingQueued" class="prompt">
        <p>
          You violated a law or custom tonight: Try Your Standing by rolling with Charm (manual
          856–907 <ManualRef ref-key="standing" />).
        </p>
        <RouterLink to="/character">Queue and resolve the test on the Character Sheet</RouterLink>
      </div>

      <div v-if="result.outcome === 'slumber'" class="prompt">
        <p>
          Slumbering restores each Connection's Pulse by its Rank (manual 1057–1079
          <ManualRef ref-key="pulse" />).
        </p>
        <RouterLink to="/connections">Apply it on the Connections page</RouterLink>
      </div>

      <div v-if="cautioned && result.outcome === 'slumber'" class="prompt">
        <p>
          Cautioned recovers the next time you slumber (manual 888–890
          <ManualRef ref-key="cond-cautioned" />).
        </p>
        <RouterLink to="/character">Erase it on the Character Sheet</RouterLink>
      </div>
    </article>

    <article class="panel history">
      <div class="history-head">
        <h3>History</h3>
        <button v-if="log.entries.length" type="button" class="ghost" @click="doClear">
          {{ confirmingClear ? 'Really clear?' : 'Clear' }}
        </button>
      </div>
      <p class="counters">
        {{ log.slumberCount }} nights slumbered · {{ log.awakeCount }} stayed awake ·
        {{ log.totalBloodLost }} Blood lost
      </p>
      <p v-if="!log.entries.length" class="empty">
        No nights logged yet. Your first slumber or day awake will appear here.
      </p>
      <ul v-else class="entries">
        <li v-for="entry in log.entries" :key="entry.id">
          <div class="entry-head">
            <span class="what" :class="entry.outcome">
              {{ entry.outcome === 'slumber' ? 'Slumbered' : 'Stayed awake' }}
            </span>
            <span class="when">{{ when(entry.at) }}</span>
          </div>
          <div class="entry-detail">
            <span class="effect">Blood {{ entry.bloodBefore }} → {{ entry.bloodAfter }}</span>
            <span class="effect">{{ rushText(entry.rushDelta) }}</span>
            <span v-if="entry.standingQueued" class="effect">Standing prompted</span>
            <span v-if="entry.looseEnd" class="quote">“{{ entry.looseEnd }}”</span>
          </div>
        </li>
      </ul>
    </article>
  </section>
</template>

<style scoped>
.lede {
  color: var(--pico-muted-color);
  margin-bottom: 1.25rem;
}

.panel {
  margin-bottom: 1.25rem;
}

.steps {
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.step-title {
  display: block;
  font-weight: 600;
}

.step-detail {
  display: block;
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}

.toggle {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-weight: 400;
}

.toggle input {
  margin: 0;
  flex-shrink: 0;
}

.lingering {
  display: block;
  font-weight: 400;
  margin-bottom: 0.4rem;
}

.meter-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  color: var(--pico-muted-color);
  font-size: 0.92rem;
  margin-bottom: 0.9rem;
}

.primary {
  width: 100%;
  padding-block: 0.9rem;
  font-size: 1.05rem;
  font-weight: 600;
}

.hint {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.awake {
  margin-top: 1rem;
}

.awake summary {
  cursor: pointer;
  color: var(--pico-primary);
  font-weight: 600;
}

.awake .step-detail {
  margin-block: 0.6rem;
}

.awake .ghost {
  margin-block: 0.6rem 0;
}

.ghost {
  padding: 0.55rem 0.9rem;
  font-size: 0.85rem;
  margin: 0;
  min-height: 2.75rem;
}

.result h3 {
  margin-bottom: 0.5rem;
}

.effects {
  list-style: none;
  padding: 0;
  margin: 0 0 0.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.prompt {
  border: 1px dashed var(--pico-muted-border-color);
  border-radius: 0.5rem;
  padding: 0.7rem 0.9rem;
  margin-top: 0.7rem;
}

.prompt.warning {
  border-color: var(--pico-del-color);
}

.prompt p {
  margin-bottom: 0.35rem;
}

.history h3 {
  margin-bottom: 0.25rem;
}

.history-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.counters {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.empty {
  color: var(--pico-muted-color);
  font-style: italic;
}

.entries {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.entries li {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--pico-muted-border-color);
}

.entries li:last-child {
  border-bottom: none;
}

.entry-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.25rem 0.75rem;
}

.entry-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 0.15rem 0.9rem;
}

.when {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
}

.what {
  font-weight: 600;
}

.what.stayed-awake {
  color: var(--pico-muted-color);
}

.effect {
  font-size: 0.88rem;
}

.quote {
  font-size: 0.9rem;
  overflow-wrap: anywhere;
}

@media (min-width: 720px) {
  .entries li {
    display: grid;
    grid-template-columns: 14rem minmax(0, 1fr);
    align-items: baseline;
  }

  .entry-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.1rem;
  }

  .entry-detail {
    display: block;
  }

  .effect {
    display: inline-block;
    margin-right: 0.9rem;
  }
}
</style>
