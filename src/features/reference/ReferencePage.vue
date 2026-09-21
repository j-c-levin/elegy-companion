<script setup lang="ts">
import { ref } from 'vue'
import GlossaryBrowser from './GlossaryBrowser.vue'
import BasicActionsView from './BasicActionsView.vue'
import HarmTablesView from './HarmTablesView.vue'

type Section = 'glossary' | 'actions' | 'tables'

const sections: { id: Section; label: string }[] = [
  { id: 'glossary', label: 'Glossary' },
  { id: 'actions', label: 'Actions' },
  { id: 'tables', label: 'Tables' },
]

const section = ref<Section>('glossary')
</script>

<template>
  <div class="reference">
    <nav class="section-tabs" aria-label="Reference sections">
      <button
        v-for="s in sections"
        :key="s.id"
        type="button"
        class="section-tab"
        :class="{ active: section === s.id }"
        :aria-current="section === s.id ? 'true' : undefined"
        @click="section = s.id"
      >
        {{ s.label }}
      </button>
    </nav>
    <GlossaryBrowser v-show="section === 'glossary'" />
    <BasicActionsView v-show="section === 'actions'" />
    <HarmTablesView v-show="section === 'tables'" />
  </div>
</template>

<style scoped>
.section-tabs {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.section-tab {
  flex: 1;
  margin: 0;
  padding: 0.55rem 0.5rem;
  min-height: 2.75rem;
  font-size: 0.9rem;
  border-radius: 2rem;
  border: 1px solid var(--pico-muted-border-color);
  background: var(--pico-secondary-background);
  color: var(--pico-secondary-inverse);
}

.section-tab.active {
  background: var(--pico-primary-background);
  border-color: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
  font-weight: 600;
}
</style>
