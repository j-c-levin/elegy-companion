<script setup lang="ts">
import ManualRef from '@/components/ManualRef.vue'
import actionsData from '@/data/basic-actions.json'

interface Action {
  id: string
  title: string
  ref: string
  intro: string
  attributes: { key: string; guidance: string }[]
  bonusHint?: string
  results: Record<string, { text: string; options: { label: string }[] }>
}

const actionList: Action[] = actionsData.actions

const resultOrder = ['stylish', 'flat', 'failure'] as const
const resultLabels: Record<(typeof resultOrder)[number], string> = {
  stylish: 'Stylish Success',
  flat: 'Flat Success',
  failure: 'Failure',
}
</script>

<template>
  <section aria-label="Basic actions">
    <header class="section-head">
      <h2>
        Basic Actions
        <ManualRef ref-key="basic-actions" />
      </h2>
      <p class="muted">
        Aspects give you Rush
        <ManualRef ref-key="aspects-give-rush" />
      </p>
    </header>
    <article v-for="a in actionList" :key="a.id" class="action-card">
      <h3>
        {{ a.title }}
        <ManualRef v-if="a.id === 'generic'" ref-key="generic-action" :label="a.title" />
        <ManualRef v-else ref-key="basic-actions" :label="a.title" />
      </h3>
      <p class="action-intro">{{ a.intro }}</p>
      <ul class="attr-list">
        <li v-for="attr in a.attributes" :key="attr.key">
          <strong class="attr-key">{{ attr.key }}</strong> — {{ attr.guidance }}
        </li>
      </ul>
      <p v-if="a.bonusHint" class="bonus-hint">{{ a.bonusHint }}</p>
      <dl class="results">
        <div v-for="key in resultOrder" :key="key" class="result">
          <dt>{{ resultLabels[key] }}</dt>
          <dd>
            {{ a.results[key].text }}
            <ul v-if="a.results[key].options.length" class="option-list">
              <li v-for="opt in a.results[key].options" :key="opt.label">{{ opt.label }}</li>
            </ul>
          </dd>
        </div>
      </dl>
    </article>
  </section>
</template>

<style scoped>
.section-head h2 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.muted {
  color: var(--pico-muted-color);
}

.action-card {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.5rem;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
}

.action-card h3 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.5rem;
}

.action-intro {
  margin: 0 0 0.5rem;
}

.attr-list {
  margin: 0 0 0.5rem;
  padding-left: 1.2rem;
}

.attr-key {
  text-transform: capitalize;
}

.bonus-hint {
  color: var(--pico-muted-color);
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
}

.results {
  margin: 0;
}

.result {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.5rem 0;
  border-top: 1px solid var(--pico-muted-border-color);
}

.result dt {
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--pico-muted-color);
}

.result dd {
  margin: 0;
}

.option-list {
  margin: 0.35rem 0 0;
  padding-left: 1.2rem;
}
</style>
