<script setup lang="ts">
import { computed } from 'vue'

import { game, resetGame } from '@/store'
import {
  CONDITION_TRACKS,
  firstUnmarkedForTrack,
  THE_END_TEXT,
  trackIsComplete,
  TRACK_END_TEXT,
  TRACK_LABEL,
} from './conditions'
import {
  convertRushLoss,
  dismissRushLoss,
  pendingLoss,
  pendingRushLoss,
  resolvePendingLoss,
} from './sheet'
import AttributesSection from './AttributesSection.vue'
import CascadePrompt from './CascadePrompt.vue'
import ConditionsSection from './ConditionsSection.vue'
import IdentitySection from './IdentitySection.vue'
import MetersSection from './MetersSection.vue'
import RecoverySection from './RecoverySection.vue'
import TenetsSection from './TenetsSection.vue'
import SheetXpSection from './SheetXpSection.vue'
import ConfirmButton from './ConfirmButton.vue'
import ManualRef from '@/components/ManualRef.vue'
import { endRefKey } from '@/manual/refs'

const endedTracks = computed(() =>
  CONDITION_TRACKS.filter((track) => trackIsComplete(track, game.activeConditions)),
)

const lossCondition = computed(() =>
  pendingLoss.value
    ? firstUnmarkedForTrack(pendingLoss.value.meter, game.activeConditions)
    : undefined,
)

const lossNote = computed(() => {
  if (!pendingLoss.value) return ''
  const label = TRACK_LABEL[pendingLoss.value.meter]
  const amount = pendingLoss.value.amount
  return `You have 0 ${label.toLowerCase()} and would lose ${amount} more. The loss is not applied; instead you risk the cascade (manual 662–668).`
})
</script>

<template>
  <section class="sheet-page" aria-labelledby="sheet-heading">
    <h1 id="sheet-heading">Character Sheet</h1>

    <aside v-if="endedTracks.length" class="the-end">
      <h2>The End</h2>
      <p v-for="track in endedTracks" :key="track">
        <strong>{{ TRACK_LABEL[track] }}:</strong> {{ TRACK_END_TEXT[track] }}
        (manual 716–717, 746, 827–828, 880–882, 904–907)
        <ManualRef :ref-key="endRefKey(track)" label="The End" />
      </p>
      <p class="the-end-text">
        {{ THE_END_TEXT }} (manual 888–894 <ManualRef ref-key="the-end" />)
      </p>
      <p class="the-end-action">
        <ConfirmButton
          danger
          label="Start anew (reset character)"
          confirm-label="Erase everything?"
          @confirm="resetGame()"
        />
      </p>
    </aside>

    <CascadePrompt
      v-if="pendingLoss"
      class="page-prompt"
      :heading="`At 0 ${TRACK_LABEL[pendingLoss.meter]} — cascade (manual 694–717, 726–744, 806–825)`"
      manual-ref-key="resource-cascades"
      :note="lossNote"
      :condition="lossCondition"
      :confirm-label="lossCondition ? `Mark ${lossCondition.key}` : 'All conditions marked'"
      @confirm="resolvePendingLoss(true)"
      @cancel="resolvePendingLoss(false)"
    />

    <aside v-if="pendingRushLoss !== null" class="rush-prompt">
      <p>
        <strong>At 0 Rush and losing {{ pendingRushLoss }} more.</strong>
        Choose a steeper cost (manual 823–833 <ManualRef ref-key="rush-0" />):
      </p>
      <div class="rush-choices">
        <button type="button" class="outline" @click="convertRushLoss('health')">
          Lose {{ pendingRushLoss }} Health instead
        </button>
        <button type="button" class="outline" @click="convertRushLoss('clarity')">
          Lose {{ pendingRushLoss }} Clarity instead
        </button>
        <button type="button" class="outline" @click="convertRushLoss('blood')">
          Lose {{ pendingRushLoss }} Blood instead
        </button>
      </div>
      <p class="rush-alt">
        Or your objectives are undermined: erase progress on a Mission, Connection, or Fight in the
        <router-link to="/tracks">Progress Tracks</router-link> tool, then press done.
      </p>
      <div class="rush-dismiss">
        <button type="button" class="outline" @click="dismissRushLoss()">Done</button>
      </div>
    </aside>

    <MetersSection />
    <ConditionsSection />
    <RecoverySection />
    <TenetsSection />
    <SheetXpSection />
    <IdentitySection />
    <AttributesSection />

    <section class="danger-zone" aria-labelledby="reset-heading">
      <h2 id="reset-heading">New character</h2>
      <p class="cite">Replaces all shared state with a blank sheet. Destructive.</p>
      <ConfirmButton
        danger
        label="Start anew"
        confirm-label="Erase everything?"
        @confirm="resetGame()"
      />
    </section>
  </section>
</template>

<style scoped>
.sheet-page > section {
  margin-top: 1.5rem;
}

.the-end {
  border: 2px solid var(--pico-danger);
  border-radius: 0.75rem;
  padding: 1rem 1.1rem;
  margin-top: 1rem;
  background: var(--pico-card-background-color);
}

.the-end h2 {
  color: var(--pico-danger);
  margin-bottom: 0.4rem;
}

.the-end-text {
  font-style: italic;
}

.the-end-action {
  margin-bottom: 0;
}

.page-prompt {
  margin-top: 1rem;
}

.rush-prompt {
  border: 2px solid var(--pico-primary);
  border-radius: 0.75rem;
  padding: 0.9rem 1.1rem;
  margin-top: 1rem;
  background: var(--pico-card-background-color);
}

.rush-choices,
.rush-dismiss {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.rush-choices button,
.rush-dismiss button {
  margin-bottom: 0;
  font-size: 0.85rem;
}

.rush-alt {
  font-size: 0.85rem;
  color: var(--pico-muted-color);
}

.danger-zone {
  border: 1px solid var(--pico-danger);
  border-radius: 0.75rem;
  padding: 1rem 1.1rem;
}

.danger-zone h2 {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.danger-zone .cite {
  margin-bottom: 0.6rem;
}
</style>
