<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { game, type AttributeKey } from '@/store'

import { applyDeltas, deltaLabel, resetRushToBase } from './apply'
import {
  ATTRIBUTE_LABELS,
  MIN_RUSH,
  VERDICT_LABELS,
  matchTableFor,
  rejudge,
  rollAction,
  rollOnTable,
  type ActionRollResult,
  type MatchTableId,
} from './engine'
import { patchRoll, recordRoll } from './history'
import { consumeNextRollBonus, nextRollBonus, setNextRollBonus } from './local'
import { BASIC_ACTIONS, type BasicAction, type EffectOption } from './presets'
import { matchTable } from './tables'

const ASPECT_OPTION_LABEL = 'Aspects give you Rush: gain +1 Rush'

const initialAction: BasicAction | undefined =
  BASIC_ACTIONS.find((action) => action.id === 'generic') ?? BASIC_ACTIONS[0]

const actionId = ref(initialAction?.id ?? '')
const attribute = ref<AttributeKey>(initialAction?.attributes[0]?.key ?? 'body')
const bonuses = ref(0)
const aspectAided = ref(false)

const result = ref<ActionRollResult | null>(null)
const cooledFrom = ref<number | null>(null)
const appliedKeys = ref<string[]>([])
const matchRoll = ref<{ id: MatchTableId; die: number; text: string } | null>(null)
const historyId = ref<string | null>(null)

const currentAction = computed<BasicAction>(
  () => BASIC_ACTIONS.find((action) => action.id === actionId.value) ?? BASIC_ACTIONS[0],
)

watch(actionId, () => {
  const first = currentAction.value.attributes[0]
  if (first) attribute.value = first.key
  clearResult()
})

function clearResult(): void {
  result.value = null
  cooledFrom.value = null
  appliedKeys.value = []
  matchRoll.value = null
  historyId.value = null
}

const verdict = computed(() => result.value?.verdict ?? null)

const currentTable = computed<MatchTableId | null>(() => {
  if (!result.value) return null
  return matchTableFor(
    {
      match: result.value.match,
      verdict: result.value.verdict,
      actionDie: result.value.actionDie,
    },
    game.meters.blood.value,
  )
})

const currentMatchTable = computed(() =>
  currentTable.value ? matchTable(currentTable.value) : undefined,
)

const canCool = computed(
  () =>
    result.value !== null &&
    cooledFrom.value === null &&
    game.meters.rush.value > result.value.actionScore,
)

const options = computed<EffectOption[]>(() => {
  const rolled = result.value
  const v = rolled?.verdict
  if (!rolled || !v) return []
  const list = [...currentAction.value.results[v].options]
  if (aspectAided.value && v !== 'failure') {
    list.push({
      label: ASPECT_OPTION_LABEL,
      deltas: [{ meter: 'rush', amount: 1 }],
    })
  }
  return list
})

interface OptionEntry {
  option: EffectOption
  key: string
}

const optionEntries = computed<OptionEntry[]>(() =>
  options.value.map((option, index) => ({
    option,
    key: option.label === ASPECT_OPTION_LABEL ? 'aspect' : `opt-${index}`,
  })),
)

function isApplied(key: string): boolean {
  return appliedKeys.value.includes(key)
}

function canApply(key: string): boolean {
  if (isApplied(key)) return true
  if (key.startsWith('opt-') && appliedKeys.value.some((k) => k.startsWith('opt-'))) {
    return false
  }
  return true
}

function optionDisabled(option: EffectOption, key: string): boolean {
  if (isApplied(key)) return true
  return !canApply(key) || optionNoChange(option)
}

function optionNoChange(option: EffectOption): boolean {
  return option.deltas.some((delta) => {
    if (delta.meter !== 'rush') return false
    const rush = game.meters.rush
    const next = Math.min(Math.max(rush.value + delta.amount, MIN_RUSH), rush.max)
    return next === rush.value
  })
}

function rollMatchTable(id: MatchTableId): { id: MatchTableId; die: number; text: string } | null {
  const table = matchTable(id)
  if (!table) return null
  const rolled = rollOnTable(table.rows)
  return { id, die: rolled.die, text: rolled.row.text }
}

function doRoll(): void {
  const attrValue = game.attributes[attribute.value]
  const bonusTotal = bonuses.value + consumeNextRollBonus()
  const rolled = rollAction(attribute.value, attrValue, bonusTotal)
  result.value = rolled
  cooledFrom.value = null
  appliedKeys.value = []
  const tableId = currentTableFor(rolled)
  matchRoll.value = tableId ? rollMatchTable(tableId) : null
  const entry = recordRoll({
    action: currentAction.value.title,
    attribute: rolled.attribute,
    parts: partsText(rolled.actionDie, rolled.attributeValue, rolled.bonuses),
    score: rolled.actionScore,
    challenge: [rolled.challenge.first, rolled.challenge.second],
    verdict: rolled.verdict,
    match: rolled.match,
    matchRoll: matchRoll.value
      ? {
          table: matchTable(matchRoll.value.id)?.title ?? matchRoll.value.id,
          die: matchRoll.value.die,
          text: matchRoll.value.text,
        }
      : undefined,
  })
  historyId.value = entry.id
}

function currentTableFor(rolled: ActionRollResult): MatchTableId | null {
  return matchTableFor(
    { match: rolled.match, verdict: rolled.verdict, actionDie: rolled.actionDie },
    game.meters.blood.value,
  )
}

function coolRush(): void {
  if (!result.value || cooledFrom.value !== null) return
  const rush = game.meters.rush.value
  if (rush <= result.value.actionScore) return
  const originalScore = result.value.actionScore
  cooledFrom.value = rush
  resetRushToBase()
  result.value = rejudge(result.value, rush)
  appliedKeys.value = []
  const table = matchTableFor(
    {
      match: result.value.match,
      verdict: result.value.verdict,
      actionDie: result.value.actionDie,
    },
    game.meters.blood.value,
  )
  matchRoll.value = table ? rollMatchTable(table) : null
  if (historyId.value) {
    patchRoll(historyId.value, {
      score: rush,
      cooledFrom: originalScore,
      verdict: result.value.verdict,
      matchRoll: matchRoll.value
        ? {
            table: matchTable(matchRoll.value.id)?.title ?? matchRoll.value.id,
            die: matchRoll.value.die,
            text: matchRoll.value.text,
          }
        : undefined,
    })
  }
}

function applyOption(option: EffectOption, key: string): void {
  if (appliedKeys.value.includes(key)) return
  appliedKeys.value.push(key)
  applyDeltas(option.deltas)
  if (option.nextRoll) {
    setNextRollBonus(nextRollBonus.value + option.nextRoll)
  }
}

function rerollMatchTable(): void {
  if (currentTable.value) {
    matchRoll.value = rollMatchTable(currentTable.value)
  }
}

function partsText(die: number, attr: number, bonus: number): string {
  let text = `${die} + ${attr}`
  if (bonus > 0) text += ` + ${bonus}`
  if (bonus < 0) text += ` − ${Math.abs(bonus)}`
  return `${text} = ${die + attr + bonus}`
}

function bonusText(bonus: number): string {
  if (bonus === 0) return ''
  return bonus > 0 ? ` + ${bonus}` : ` − ${Math.abs(bonus)}`
}
</script>

<template>
  <article class="panel">
    <h2>Action Roll</h2>
    <p class="cite">Manual 315–362 (roll) · 363–375 (Rush) · 513–576 (matches) · 418–512 (basic actions)</p>

    <label for="action-select">Action</label>
    <select id="action-select" v-model="actionId">
      <option v-for="action in BASIC_ACTIONS" :key="action.id" :value="action.id">
        {{ action.title }}
      </option>
    </select>
    <p class="intro">{{ currentAction.intro }}</p>

    <fieldset class="attr-group">
      <legend>Attribute</legend>
      <label
        v-for="attr in currentAction.attributes"
        :key="attr.key"
        class="attr-option"
      >
        <input type="radio" name="attribute" :value="attr.key" v-model="attribute" />
        <span>
          {{ ATTRIBUTE_LABELS[attr.key] }}
          <small>{{ attr.guidance }}</small>
        </span>
      </label>
    </fieldset>

    <div class="bonus-row">
      <span class="bonus-label">Bonus</span>
      <button type="button" class="step-btn" aria-label="Decrease bonus" @click="bonuses -= 1">−</button>
      <span class="bonus-value">{{ bonuses }}</span>
      <button type="button" class="step-btn" aria-label="Increase bonus" @click="bonuses += 1">+</button>
      <button v-if="bonuses !== 0" type="button" class="ghost-btn" @click="bonuses = 0">Reset</button>
    </div>
    <p v-if="currentAction.bonusHint" class="hint">{{ currentAction.bonusHint }}</p>
    <p v-if="nextRollBonus !== 0" class="hint">
      +{{ nextRollBonus }} to your next action roll is active.
      <button type="button" class="ghost-btn" @click="setNextRollBonus(0)">Clear</button>
    </p>

    <label class="aspect-toggle">
      <input type="checkbox" role="switch" v-model="aspectAided" />
      <span>Aided by one or more of my Aspects — any success gains +1 Rush</span>
    </label>

    <p class="meter-strip">
      <span>Rush {{ game.meters.rush.value }} <small>(base {{ game.meters.rush.base }}, max {{ game.meters.rush.max }})</small></span>
      <span>Blood {{ game.meters.blood.value }}</span>
    </p>

    <button class="roll-btn" @click="doRoll">Roll 1d6 + attribute vs 2d10</button>

    <div v-if="result" class="result">
      <p class="breakdown">
        <span class="die">{{ result.actionDie }}</span> action die
        + <span class="die">{{ result.attributeValue }}</span> {{ ATTRIBUTE_LABELS[result.attribute] }}<template v-if="result.bonuses !== 0">{{ bonusText(result.bonuses) }}</template>
        = <strong>{{ result.actionScore }}</strong>
      </p>
      <p class="challenge-row">
        <span class="chip" :class="{ beaten: result.beats[0] }">
          {{ result.challenge.first }} {{ result.beats[0] ? 'beaten' : 'not beaten' }}
        </span>
        <span class="chip" :class="{ beaten: result.beats[1] }">
          {{ result.challenge.second }} {{ result.beats[1] ? 'beaten' : 'not beaten' }}
        </span>
        <span v-if="result.match" class="chip match-chip">Match</span>
      </p>
      <p class="verdict-banner" :class="result.verdict">{{ VERDICT_LABELS[result.verdict] }}</p>
      <p class="result-text">{{ currentAction.results[result.verdict].text }}</p>

      <p v-if="cooledFrom !== null" class="hint">
        Cooled your Rush: action score {{ cooledFrom }} replaced with Rush {{ result.actionScore }}; Rush reset to base {{ game.meters.rush.base }}.
      </p>

      <button v-if="canCool" type="button" class="cool-btn" @click="coolRush">
        Cool your Rush: replace score {{ result.actionScore }} with Rush {{ game.meters.rush.value }}
        (Rush resets to base {{ game.meters.rush.base }})
      </button>

      <div v-if="result.match" class="match-panel">
        <p class="hint">
          Both challenge dice show {{ result.challenge.first }} — a match (manual 513–524).
          <template v-if="currentTable === 'impulse'">
            Action die {{ result.actionDie }} &gt; Blood {{ game.meters.blood.value }}: your predatory nature takes over.
          </template>
        </p>
        <p v-if="matchRoll && currentMatchTable" class="match-result">
          <strong>{{ currentMatchTable.title }}</strong> — d10: {{ matchRoll.die }} — {{ matchRoll.text }}
        </p>
        <button v-if="matchRoll" type="button" class="ghost-btn" @click="rerollMatchTable">Roll again</button>
        <details v-if="currentMatchTable">
          <summary>Full {{ currentMatchTable.title }} table</summary>
          <ol class="table-list">
            <li v-for="row in currentMatchTable.rows" :key="row.range[0]">{{ row.text }}</li>
          </ol>
        </details>
      </div>

      <div v-if="optionEntries.length" class="options">
        <button
          v-for="entry in optionEntries"
          :key="entry.key"
          type="button"
          class="apply-btn"
          :disabled="optionDisabled(entry.option, entry.key)"
          @click="applyOption(entry.option, entry.key)"
        >
          <span>{{ isApplied(entry.key) ? 'Applied — ' : '' }}{{ entry.option.label }}</span>
          <small v-if="!isApplied(entry.key) && entry.option.deltas.length">
            {{ entry.option.deltas.map(deltaLabel).join(' · ') }}
          </small>
        </button>
      </div>
      <p v-if="verdict === 'failure'" class="hint">Roll on Pay the Price below.</p>
    </div>
  </article>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
  margin-bottom: 1rem;
}

.intro {
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
}

.attr-group {
  margin-bottom: 0.75rem;
}

.attr-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.5rem;
  padding: 0.55rem 0.75rem;
  margin-bottom: 0.4rem;
  cursor: pointer;
  font-weight: 400;
}

.attr-option:has(input:checked) {
  border-color: var(--pico-primary);
}

.attr-option input {
  margin: 0;
  flex-shrink: 0;
}

.attr-option small {
  display: block;
  color: var(--pico-muted-color);
}

.bonus-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.35rem;
}

.bonus-label {
  font-weight: 600;
}

.step-btn {
  width: 2.6rem;
  height: 2.6rem;
  padding: 0;
  font-size: 1.2rem;
  line-height: 1;
}

.bonus-value {
  min-width: 1.8rem;
  text-align: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.ghost-btn {
  padding: 0.35rem 0.7rem;
  font-size: 0.85rem;
  margin: 0;
}

.hint {
  color: var(--pico-muted-color);
  font-size: 0.88rem;
  margin-bottom: 0.6rem;
}

.aspect-toggle {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-weight: 400;
  margin-block: 0.75rem;
}

.aspect-toggle input {
  margin: 0;
  flex-shrink: 0;
}

.meter-strip {
  display: flex;
  gap: 1.25rem;
  color: var(--pico-muted-color);
  font-size: 0.92rem;
  margin-bottom: 0.9rem;
}

.roll-btn {
  width: 100%;
  padding-block: 0.9rem;
  font-size: 1.05rem;
  font-weight: 600;
}

.result {
  margin-top: 1.1rem;
  border-top: 1px solid var(--pico-muted-border-color);
  padding-top: 1rem;
}

.die {
  display: inline-block;
  min-width: 2.3rem;
  text-align: center;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.4rem;
  padding: 0.2rem 0.4rem;
  font-weight: 700;
  font-size: 1.15rem;
}

.challenge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chip {
  display: inline-block;
  border: 1px solid var(--pico-del-color);
  color: var(--pico-del-color);
  border-radius: 999px;
  padding: 0.28rem 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.chip.beaten {
  border-color: var(--pico-ins-color);
  color: var(--pico-ins-color);
}

.chip.match-chip {
  border-color: var(--pico-primary);
  color: var(--pico-primary);
}

.verdict-banner {
  display: inline-block;
  margin-block: 0.8rem 0.5rem;
  padding: 0.6rem 1rem;
  border: 1px solid;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 1.05rem;
}

.verdict-banner.stylish {
  color: var(--pico-ins-color);
  border-color: var(--pico-ins-color);
  background: color-mix(in srgb, var(--pico-ins-color) 10%, transparent);
}

.verdict-banner.flat {
  color: var(--pico-primary);
  border-color: var(--pico-primary);
  background: color-mix(in srgb, var(--pico-primary) 8%, transparent);
}

.verdict-banner.failure {
  color: var(--pico-del-color);
  border-color: var(--pico-del-color);
  background: color-mix(in srgb, var(--pico-del-color) 10%, transparent);
}

.result-text {
  font-size: 0.98rem;
}

.cool-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.7rem 0.9rem;
  margin-bottom: 0.75rem;
}

.match-panel {
  border: 1px dashed var(--pico-muted-border-color);
  border-radius: 0.5rem;
  padding: 0.75rem 0.9rem;
  margin-block: 0.75rem;
}

.match-result {
  font-size: 0.98rem;
}

.table-list {
  font-size: 0.9rem;
  color: var(--pico-muted-color);
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.9rem;
}

.apply-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.65rem 0.9rem;
  margin-bottom: 0;
}

.apply-btn small {
  display: block;
  color: var(--pico-muted-color);
}
</style>
