<script setup lang="ts">
import { ref } from 'vue'

import ManualRef from '@/components/ManualRef.vue'

import { getTable, rollTable, type OracleResult } from '@/features/oracles/roll'
import type { OracleRow, OracleTable } from '@/features/oracles/types'
import { setCityField, worldDraft } from './draft'
import { CITY_HIGHLIGHTS, CITY_UGLY_SIDES, rollCityIdea, type CityIdea } from './city-tables'

const world = worldDraft()

function table(id: string): OracleTable {
  const found = getTable(id)
  if (!found) throw new Error(`missing oracle table ${id}`)
  return found
}

const MAX_FACTION_VALUES = 3

type FactionRoll = { result: OracleResult; row: OracleRow }

const newValue = ref('')
const highlightRoll = ref<CityIdea | null>(null)
const uglyRoll = ref<CityIdea | null>(null)

const factionValueRoll = ref<FactionRoll | null>(null)
const factionNameRoll = ref<FactionRoll | null>(null)
const sampleFactionRoll = ref<FactionRoll | null>(null)

const districtName = ref('')
const districtFaction = ref('')
const districtType = ref('')
const districtKeyPlace = ref('')

function onField<K extends 'name' | 'founded' | 'economy' | 'climate' | 'languages' | 'highlight' | 'uglySide' | 'factionName'>(
  key: K,
  event: Event,
): void {
  setCityField(key, (event.target as HTMLInputElement).value)
}

function rollHighlight(): void {
  highlightRoll.value = rollCityIdea(CITY_HIGHLIGHTS)
  setCityField('highlight', highlightRoll.value.label)
}

function rollUglySide(): void {
  uglyRoll.value = rollCityIdea(CITY_UGLY_SIDES)
  setCityField('uglySide', uglyRoll.value.label)
}

function rollFactionValue(): void {
  factionValueRoll.value = rollTable(table('faction'))
}

function rollFactionName(): void {
  factionNameRoll.value = rollTable(table('faction'))
}

function rollSampleFaction(): void {
  sampleFactionRoll.value = rollTable(table('sample-factions'))
}

function useFactionValue(): void {
  const value = factionValueRoll.value?.result.factionValue
  if (!value || world.city.factionValues.length >= MAX_FACTION_VALUES) return
  if (world.city.factionValues.includes(value)) return
  setCityField('factionValues', [...world.city.factionValues, value])
}

function useFactionName(): void {
  const name = factionNameRoll.value?.result.factionName
  if (name) setCityField('factionName', name)
}

function useSampleFaction(): void {
  const roll = sampleFactionRoll.value
  if (!roll?.row) return
  setCityField('factionName', roll.row.label)
  const values = (roll.row.examples ?? '')
    .split('·')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .slice(0, MAX_FACTION_VALUES)
  if (values.length) setCityField('factionValues', values)
}

function addFactionValue(): void {
  const value = newValue.value.trim()
  if (!value || world.city.factionValues.length >= MAX_FACTION_VALUES) return
  setCityField('factionValues', [...world.city.factionValues, value])
  newValue.value = ''
}

function removeFactionValue(index: number): void {
  setCityField('factionValues', world.city.factionValues.filter((_, i) => i !== index))
}

function rollDistrictType(): void {
  const roll = rollTable(table('district-type'))
  districtType.value = roll.result.parts.map((part) => (part.kind === 'text' ? part.text : '')).join(' ').trim()
}

function addDistrict(): void {
  const name = districtName.value.trim()
  const faction = districtFaction.value.trim()
  const type = districtType.value.trim()
  const keyPlace = districtKeyPlace.value.trim()
  if (!name && !type && !faction && !keyPlace) return
  const parts = [
    name,
    type ? `${name ? '' : 'Type: '}${type}` : '',
    faction ? `Faction: ${faction}` : '',
    keyPlace ? `Key place: ${keyPlace}` : '',
  ].filter((part) => part.length > 0)
  setCityField('districts', [...world.city.districts, parts.join(' — ')])
  districtName.value = ''
  districtFaction.value = ''
  districtType.value = ''
  districtKeyPlace.value = ''
}

function removeDistrict(index: number): void {
  setCityField('districts', world.city.districts.filter((_, i) => i !== index))
}
</script>

<template>
  <section aria-labelledby="city-heading">
    <h2 id="city-heading">Create your City</h2>
    <p class="lede">
      Your whole story takes place in a single city — real, inspired by one, or entirely fictional
      (manual 2338–2352 <ManualRef ref-key="city-basics" />).
    </p>

    <article class="panel">
      <h3>
        Basics <ManualRef ref-key="city-basics" />
      </h3>
      <div class="grid-fields">
        <label for="city-name">Name
          <input id="city-name" type="text" :value="world.city.name" placeholder="What is your city called officially?" @input="onField('name', $event)" />
        </label>
        <label for="city-founded">Founded in
          <input id="city-founded" type="text" :value="world.city.founded" placeholder="A date, year, century, or historical period" @input="onField('founded', $event)" />
        </label>
        <label for="city-economy">Economy
          <input id="city-economy" type="text" :value="world.city.economy" placeholder="Main industries and economic activities" @input="onField('economy', $event)" />
        </label>
        <label for="city-climate">Climate
          <input id="city-climate" type="text" :value="world.city.climate" placeholder="Subtropical? Temperate? Polar?" @input="onField('climate', $event)" />
        </label>
        <label for="city-languages">Language(s)
          <input id="city-languages" type="text" :value="world.city.languages" placeholder="Official languages" @input="onField('languages', $event)" />
        </label>
      </div>

      <div class="idea-block">
        <div class="idea-head">
          <label for="city-highlight">Highlights — what lures mortals into this city? <ManualRef ref-key="city-highlight" /></label>
          <button type="button" class="roll-btn" @click="rollHighlight">Roll d10</button>
        </div>
        <input id="city-highlight" type="text" :value="world.city.highlight" placeholder="e.g. Vibrant nightlife" @input="onField('highlight', $event)" />
        <p v-if="highlightRoll" class="idea-detail">
          {{ highlightRoll.summary }}<br />
          <strong>Detail seed:</strong> {{ highlightRoll.seed }}
        </p>
      </div>

      <div class="idea-block">
        <div class="idea-head">
          <label for="city-ugly">Ugly side — what makes them leave? <ManualRef ref-key="city-ugly-side" /></label>
          <button type="button" class="roll-btn" @click="rollUglySide">Roll d10</button>
        </div>
        <input id="city-ugly" type="text" :value="world.city.uglySide" placeholder="e.g. Surveillance state" @input="onField('uglySide', $event)" />
        <p v-if="uglyRoll" class="idea-detail">
          {{ uglyRoll.summary }}<br />
          <strong>Detail seed:</strong> {{ uglyRoll.seed }}
        </p>
      </div>
    </article>

    <article class="panel">
      <h3>Your faction <ManualRef ref-key="city-faction" /></h3>
      <p class="hint">
        Create the faction you belong to: choose three values and a name. Roll for random results or
        inspiration (manual 2505–2510).
      </p>
      <label for="faction-name">Name</label>
      <input id="faction-name" type="text" :value="world.city.factionName" placeholder="Pick one freely, or roll below" @input="onField('factionName', $event)" />
      <p class="hint">Values — three, representing what your faction is mostly about ({{ world.city.factionValues.length }} / {{ MAX_FACTION_VALUES }})</p>
      <ul class="value-chips">
        <li v-for="(value, index) in world.city.factionValues" :key="value + index" class="chip">
          {{ value }}
          <button type="button" class="chip-remove" :aria-label="`Remove value ${value}`" @click="removeFactionValue(index)">×</button>
        </li>
      </ul>
      <div class="add-row">
        <input v-model="newValue" type="text" placeholder="Add a value" :disabled="world.city.factionValues.length >= MAX_FACTION_VALUES" @keyup.enter="addFactionValue" />
        <button type="button" class="roll-btn" :disabled="world.city.factionValues.length >= MAX_FACTION_VALUES" @click="addFactionValue">Add</button>
      </div>

      <div class="roller">
        <button type="button" class="roll-btn" @click="rollFactionValue">Roll a value</button>
        <button type="button" class="roll-btn" @click="rollFactionName">Roll a name</button>
        <button type="button" class="roll-btn" @click="rollSampleFaction">Roll a sample faction</button>
      </div>

      <div v-if="factionValueRoll" class="roll-result">
        <p>
          <strong>{{ factionValueRoll.result.factionValue }}</strong>
          <span class="hint"> — {{ factionValueRoll.result.note }}</span>
        </p>
        <button type="button" class="roll-btn" :disabled="world.city.factionValues.length >= MAX_FACTION_VALUES" @click="useFactionValue">Use this value</button>
      </div>
      <div v-if="factionNameRoll" class="roll-result">
        <p><strong>{{ factionNameRoll.result.factionName }}</strong></p>
        <button type="button" class="roll-btn" @click="useFactionName">Use this name</button>
      </div>
      <div v-if="sampleFactionRoll" class="roll-result">
        <p><strong>{{ sampleFactionRoll.row.label }}</strong></p>
        <p class="hint">{{ sampleFactionRoll.row.detail }}</p>
        <p class="hint">Values: {{ sampleFactionRoll.row.examples }}</p>
        <button type="button" class="roll-btn" @click="useSampleFaction">Use this faction</button>
      </div>
    </article>

    <article class="panel">
      <h3>Districts <ManualRef ref-key="city-districts" /></h3>
      <p class="hint">
        Significant but not precisely delimited areas. Start with the district your character
        inhabits: name, dominating faction, type, and one key place where they usually feed
        (manual 2650–2667).
      </p>
      <ul class="district-list">
        <li v-for="(district, index) in world.city.districts" :key="district + index">
          <span>{{ district }}</span>
          <button type="button" class="chip-remove" :aria-label="`Remove district ${district}`" @click="removeDistrict(index)">×</button>
        </li>
      </ul>
      <div class="district-form">
        <input v-model="districtName" type="text" placeholder="District name" @keyup.enter="addDistrict" />
        <input v-model="districtType" type="text" placeholder="Type (roll or choose)" @keyup.enter="addDistrict" />
        <button type="button" class="roll-btn" @click="rollDistrictType">Roll type</button>
        <input v-model="districtFaction" type="text" placeholder="Dominating faction" @keyup.enter="addDistrict" />
        <input v-model="districtKeyPlace" type="text" placeholder="Key place — where your character feeds" @keyup.enter="addDistrict" />
        <button type="button" class="roll-btn" @click="addDistrict">Add district</button>
      </div>
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

.panel h3 {
  margin-bottom: 0.6rem;
}

.grid-fields {
  display: grid;
  gap: 0.7rem;
  margin-bottom: 1rem;
}

@media (min-width: 720px) {
  .grid-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
}

.grid-fields input {
  margin-bottom: 0;
}

.idea-block {
  margin-top: 0.9rem;
}

.idea-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.idea-head label {
  margin-bottom: 0;
}

.idea-detail {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin: 0.4rem 0 0;
}

.hint {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin: 0.4rem 0;
}

.roll-btn {
  margin: 0;
  padding: 0.35rem 0.8rem;
  font-size: 0.85rem;
  min-height: 2.6rem;
}

.roller {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.roll-result {
  border: 1px dashed var(--pico-muted-border-color);
  border-radius: 0.5rem;
  padding: 0.6rem 0.8rem;
  margin-top: 0.6rem;
}

.roll-result p {
  margin-bottom: 0.4rem;
}

.value-chips {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0;
  margin: 0.4rem 0;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 2rem;
  padding: 0.25rem 0.35rem 0.25rem 0.8rem;
  font-size: 0.9rem;
}

.chip-remove {
  min-width: 2.75rem;
  min-height: 2.75rem;
  padding: 0.3rem 0.6rem;
  margin: 0;
  border-radius: 999px;
  line-height: 1;
  font-size: 1.1rem;
}

.add-row {
  display: flex;
  gap: 0.5rem;
}

.add-row input {
  flex: 1;
  margin-bottom: 0;
}

.district-list {
  list-style: none;
  padding: 0;
  margin: 0.4rem 0 0.8rem;
}

.district-list li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.45rem 0;
  border-bottom: 1px solid var(--pico-muted-border-color);
}

.district-list li:last-child {
  border-bottom: none;
}

.district-list span {
  overflow-wrap: anywhere;
}

.district-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.4rem;
}

.district-form input {
  flex: 1 1 10rem;
  margin-bottom: 0;
}
</style>
