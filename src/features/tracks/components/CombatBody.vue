<script setup lang="ts">
import { computed, ref } from 'vue'

import { PROGRESS_TICKS_PER_MARK, TOTAL_TICKS, type Rank } from '../types'
import type { Track } from '../types'
import * as store from '../store'
import ManualRef from '@/components/ManualRef.vue'

const props = defineProps<{ track: Track }>()

const result = ref<'stylish' | 'flat' | 'failure' | null>(null)
const weapons = ref(false)
const supportRank = ref<Rank | null>(null)
const flash = ref('')

const full = computed(() => props.track.ticks >= TOTAL_TICKS)
const perMark = computed(() => PROGRESS_TICKS_PER_MARK[props.track.rank])
const preview = computed(() =>
  result.value && result.value !== 'failure'
    ? store.attackTicks(props.track.rank, {
        weapons: weapons.value,
        supportRank: supportRank.value,
      })
    : 0,
)

function setResult(value: 'stylish' | 'flat' | 'failure'): void {
  result.value = result.value === value ? null : value
}

function applyAttack(): void {
  if (!result.value || result.value === 'failure') return
  store.applyAttack(props.track.id, {
    weapons: weapons.value,
    supportRank: supportRank.value,
  })
  if (result.value === 'flat') {
    flash.value = 'Attack landed — pay the price for the counterblow or setback'
  }
  result.value = null
  weapons.value = false
  supportRank.value = null
}

function collectWin(): void {
  const rush = store.collectCombatRush(props.track.id)
  flash.value = `They are down: +${rush} Rush`
  store.setTrackArchived(props.track.id, true)
}

function loseFight(): void {
  flash.value = 'Fight abandoned or lost: envision the consequence and pay the price'
  store.setTrackArchived(props.track.id, true)
}
</script>

<template>
  <div class="body">
    <div v-if="!track.hasTrack" class="notrack">
      <p class="note">
        No progress track: regular mortals are taken out in one hit. Land a Stylish or Flat
        attack and they are down.
      </p>
      <button type="button" class="mark-btn" @click="collectWin">
        They are down — gain +{{ track.rank }} Rush
      </button>
      <button type="button" class="ghost-btn" @click="loseFight">Lose or abandon the fight</button>
    </div>

    <template v-else>
      <p v-if="full" class="warning" role="status">
        Track full: the adversary is down once you collect the Rush.
      </p>

      <div v-if="full" class="mark-row">
        <button type="button" class="mark-btn" @click="collectWin">
          They are down — gain +{{ track.rank }} Rush
        </button>
        <ManualRef ref-key="combat-winning" label="Winning a fight" />
      </div>

      <details class="panel" :open="!full">
        <summary>
        Attack (roll with Body, manually)
        <ManualRef ref-key="combat-attack" label="Attacking" />
      </summary>
        <p class="note">
          Roll with Body in the Roll Engine, then record the result here. One mark of damage is
          worth {{ perMark }} tick{{ perMark === 1 ? '' : 's' }}.
        </p>
        <div class="btn-row">
          <button
            type="button"
            class="ghost-btn"
            :class="{ active: result === 'stylish' }"
            @click="setResult('stylish')"
          >
            Stylish
          </button>
          <button
            type="button"
            class="ghost-btn"
            :class="{ active: result === 'flat' }"
            @click="setResult('flat')"
          >
            Flat
          </button>
          <button
            type="button"
            class="ghost-btn"
            :class="{ active: result === 'failure' }"
            @click="setResult('failure')"
          >
            Failure
          </button>
        </div>

        <label v-if="result && result !== 'failure'" class="flag">
          <input v-model="weapons" type="checkbox" />
          <span>Used weapons or fangs — mark once more (not usable against vampires)</span>
        </label>

        <label v-if="result && result !== 'failure'" class="flag support">
          <span>A Connection providing direct support — multiply progress by their Rank:</span>
          <select
            :value="supportRank ?? ''"
            aria-label="Supporting Connection rank"
            @change="
              supportRank =
                ($event.target as HTMLSelectElement).value === ''
                  ? null
                  : (Number(($event.target as HTMLSelectElement).value) as Rank)
            "
          >
            <option value="">None</option>
            <option v-for="r in 5" :key="r" :value="r">Rank {{ r }}</option>
          </select>
        </label>

        <p v-if="preview > 0" class="note preview">
          This attack marks +{{ preview }} ticks ({{ track.ticks }} →
          {{ Math.min(TOTAL_TICKS, track.ticks + preview) }}/40)
        </p>

        <button
          v-if="result === 'flat' || result === 'stylish'"
          type="button"
          class="mark-btn"
          @click="applyAttack"
        >
          Land the attack — mark {{ preview }} tick{{ preview === 1 ? '' : 's' }}
        </button>
        <p v-else-if="result === 'failure'" class="note">
          Your enemy hits you, or something else happens before you can land your blow: pay the
          price.
        </p>
      </details>

      <button type="button" class="ghost-btn lose" @click="loseFight">
        Lose or abandon the fight — pay the price
      </button>
    </template>

    <p v-if="flash" class="flash" role="status">{{ flash }}</p>
  </div>
</template>

<style scoped>
.mark-btn {
  width: 100%;
  padding-block: 0.9rem;
  font-weight: 600;
}

.ghost-btn.lose {
  margin-top: 0.75rem;
  width: 100%;
}

.notrack {
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

.ghost-btn.active {
  border-color: var(--pico-primary);
  color: var(--pico-primary);
}

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

.preview {
  font-weight: 600;
}

.flag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.92rem;
  margin: 0.5rem 0;
}

.flag span {
  flex: 1;
}

.support select {
  margin-bottom: 0;
  width: auto;
}

.warning {
  margin-top: 0.75rem;
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  background: var(--pico-secondary-background);
  border-left: 4px solid var(--pico-primary);
  font-size: 0.92rem;
}

.flash {
  margin: 0.75rem 0 0;
  font-weight: 600;
  color: var(--pico-primary);
}
</style>
