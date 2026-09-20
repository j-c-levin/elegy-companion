<script setup lang="ts">
import { computed } from 'vue'

import { BASE_RUSH, game, MAX_RUSH } from '@/store'
import {
  actionPenalty,
  conditionsForTrack,
  CONDITION_TRACKS,
  rushCaps,
  soulModifier,
  TRACK_LABEL,
} from './conditions'
import { eraseCondition } from './sheet'
import ConfirmButton from './ConfirmButton.vue'

const active = computed(() => game.activeConditions)

const effectSummary = computed(() => {
  const parts: string[] = []
  const caps = rushCaps(active.value)
  if (caps.base !== BASE_RUSH) parts.push(`base Rush ${caps.base - BASE_RUSH}`)
  if (caps.max !== MAX_RUSH) parts.push(`max Rush ${caps.max - MAX_RUSH}`)
  const soul = soulModifier(active.value)
  if (soul !== 0) parts.push(`Soul ${soul}`)
  const penalty = actionPenalty(active.value)
  if (penalty !== 0) parts.push(`${penalty} to all action rolls except hunting`)
  return parts
})

function severityLabel(severity: string): string {
  if (severity === 'permanent') return 'Burdens'
  return severity.charAt(0).toUpperCase() + severity.slice(1)
}
</script>

<template>
  <section aria-labelledby="conditions-heading">
    <h2 id="conditions-heading">Conditions</h2>
    <p class="cite">
      Enduring consequences when your limits are tested; permanent ones are Burdens
      (manual 268–300, 3961+).
    </p>
    <p v-if="effectSummary.length" class="effects-line">
      Active effects: {{ effectSummary.join(', ') }}
    </p>
    <p v-if="active.length === 0" class="none">No conditions marked.</p>
    <div v-for="track in CONDITION_TRACKS" :key="track" class="track-block">
      <h3>{{ TRACK_LABEL[track] }} cascade</h3>
      <ul class="condition-list">
        <li
          v-for="condition in conditionsForTrack(track)"
          :key="condition.key"
          :class="{ inactive: !active.includes(condition.key) }"
        >
          <div class="condition-head">
            <span class="condition-name">
              {{ condition.key }}
              <em class="severity">{{ severityLabel(condition.severity) }}</em>
            </span>
            <ConfirmButton
              v-if="active.includes(condition.key)"
              small
              :danger="condition.severity === 'permanent'"
              :label="condition.severity === 'permanent' ? 'Remove' : 'Erase'"
              :confirm-label="condition.severity === 'permanent' ? 'Erase Burden?' : 'Sure?'"
              @confirm="eraseCondition(condition.key)"
            />
          </div>
          <details v-if="active.includes(condition.key)">
            <summary>Rules text ({{ condition.ref }})</summary>
            <p class="rules-text">{{ condition.text }}</p>
          </details>
          <p v-else class="unmarked-note">unmarked — {{ condition.ref }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}

.effects-line {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.none {
  color: var(--pico-muted-color);
}

.track-block {
  margin-bottom: 1rem;
}

.track-block h3 {
  font-size: 1rem;
  margin-bottom: 0.4rem;
}

.condition-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.condition-list li {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.6rem;
  padding: 0.6rem 0.9rem;
}

.condition-list li.inactive {
  opacity: 0.55;
  border-style: dashed;
}

.condition-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.condition-head .severity {
  font-style: normal;
  font-size: 0.75rem;
  color: var(--pico-muted-color);
  margin-left: 0.35rem;
}

.rules-text {
  font-size: 0.9rem;
  margin-bottom: 0;
}

.unmarked-note {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
  margin: 0;
}
</style>
