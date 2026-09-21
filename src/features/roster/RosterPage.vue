<script setup lang="ts">
import { reactive, ref } from 'vue'

import CommonRankTable from './CommonRankTable.vue'
import NpcForm from './NpcForm.vue'
import RosterList from './RosterList.vue'
import RulesPanel from './RulesPanel.vue'
import type { CreatureType, Npc, Rank } from './types'

const editing = ref<Npc | null>(null)
const preset = reactive<{ type: CreatureType; rank: Rank }>({ type: 'mortal', rank: 1 })
const formSection = ref<HTMLElement | null>(null)

function startEntry(type: CreatureType, rank: Rank): void {
  editing.value = null
  preset.type = type
  preset.rank = rank
  formSection.value?.scrollIntoView({ block: 'start' })
}

function editNpc(npc: Npc): void {
  editing.value = npc
  formSection.value?.scrollIntoView({ block: 'start' })
}

function finishEditing(): void {
  editing.value = null
}
</script>

<template>
  <section>
    <h1>NPC &amp; Adversary Roster</h1>
    <p class="lede">
      Every NPC and adversary in your city as a structured record: name, creature type, Rank, Pulse
      and notes. Built from the common-rank table per creature type (manual 986–1008, repeated for
      the statblocks at 4311–4333) and the creation rules of Chapter 5 (4270–4854).
    </p>

    <CommonRankTable @pick="startEntry" />

    <section ref="formSection" class="form-block">
      <h2>{{ editing ? `Edit ${editing.name}` : 'New entry' }}</h2>
      <NpcForm :editing="editing" :preset="preset" @save="finishEditing" @cancel="finishEditing" />
    </section>

    <RosterList @edit="editNpc" />

    <RulesPanel />
  </section>
</template>

<style scoped>
.lede {
  color: var(--pico-muted-color);
  margin-bottom: 1.25rem;
}

.form-block {
  margin-top: 1.5rem;
  scroll-margin-top: 4.5rem;
}
</style>
