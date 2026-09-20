<script setup lang="ts">
import { computed } from 'vue'

import { ATTRIBUTE_KEYS, game, updateGame, type AttributeKey } from '@/store'
import { soulModifier } from './conditions'
import ManualRef from '@/components/ManualRef.vue'

const descriptions: Record<AttributeKey, string> = {
  body: 'Strength, agility, coordination. Fight, overcome physical challenges, resist harm.',
  mind: 'Intelligence, sharpness, resolve. Investigate, apply knowledge, resist despair.',
  charm: 'Persuasiveness, charisma, composure. Influence others, hide your nature.',
  soul: 'Empathy, self-control, humaneness. Resist impulses, act with honesty.',
}

const soulPenalty = computed(() => soulModifier(game.activeConditions))

function adjust(key: AttributeKey, delta: number): void {
  updateGame((draft) => {
    draft.attributes[key] = Math.max(0, Math.min(3, draft.attributes[key] + delta))
  })
}
</script>

<template>
  <section aria-labelledby="attributes-heading">
    <h2 id="attributes-heading">Attributes</h2>
    <p class="cite">
      Character creation distributes +3, +2, +2 and +1 across the four attributes (manual 1942–1946
      <ManualRef ref-key="attributes-create" />); descriptions at 191–220
      <ManualRef ref-key="attributes" />. Scores range 0–3 in this tool.
    </p>
    <div class="attribute-list">
      <div v-for="key in ATTRIBUTE_KEYS" :key="key" class="attribute-row">
        <div class="attribute-info">
          <span class="attribute-name">
            {{ key.charAt(0).toUpperCase() + key.slice(1) }}
            <em v-if="key === 'soul' && soulPenalty !== 0" class="penalty">
              ({{ soulPenalty }} while Detached)
            </em>
          </span>
          <span class="attribute-desc">{{ descriptions[key] }}</span>
        </div>
        <div class="attribute-controls">
          <button
            type="button"
            class="outline"
            :aria-label="`Decrease ${key}`"
            :disabled="game.attributes[key] <= 0"
            @click="adjust(key, -1)"
          >
            −
          </button>
          <strong class="attribute-value">{{ game.attributes[key] }}</strong>
          <button
            type="button"
            class="outline"
            :aria-label="`Increase ${key}`"
            :disabled="game.attributes[key] >= 3"
            @click="adjust(key, 1)"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cite {
  color: var(--pico-muted-color);
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}

.attribute-list {
  display: grid;
  gap: 0.6rem;
}

.attribute-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.6rem;
  padding: 0.65rem 0.9rem;
}

.attribute-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.attribute-name {
  font-weight: 600;
  text-transform: capitalize;
}

.penalty {
  color: var(--pico-danger);
  font-style: normal;
  font-weight: 400;
  font-size: 0.85rem;
}

.attribute-desc {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}

.attribute-controls {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

.attribute-controls button {
  width: 2.6rem;
  height: 2.6rem;
  padding: 0;
  margin-bottom: 0;
  font-size: 1.3rem;
  line-height: 1;
}

.attribute-value {
  min-width: 1.5rem;
  text-align: center;
  font-size: 1.2rem;
}
</style>
