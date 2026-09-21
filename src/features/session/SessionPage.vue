<script setup lang="ts">
import { computed, type Component } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import LooseEndsSection from './LooseEndsSection.vue'
import NightLogSection from './NightLogSection.vue'
import XpSection from './XpSection.vue'

type ViewId = 'night-log' | 'loose-ends' | 'xp'

const DEFAULT_VIEW: ViewId = 'night-log'

interface SessionView {
  id: ViewId
  label: string
  component: Component
}

const VIEWS: readonly SessionView[] = [
  { id: 'night-log', label: 'Night log', component: NightLogSection },
  { id: 'loose-ends', label: 'Loose Ends', component: LooseEndsSection },
  { id: 'xp', label: 'XP', component: XpSection },
]

function isViewId(value: unknown): value is ViewId {
  return value === 'night-log' || value === 'loose-ends' || value === 'xp'
}

const route = useRoute()

const activeId = computed<ViewId>(() =>
  isViewId(route.query.view) ? route.query.view : DEFAULT_VIEW,
)

const activeView = computed(() => VIEWS.find((view) => view.id === activeId.value) as SessionView)
</script>

<template>
  <section aria-labelledby="session-heading">
    <h1 id="session-heading">Session</h1>
    <nav class="views" aria-label="Session sections">
      <RouterLink
        v-for="view in VIEWS"
        :key="view.id"
        :to="{ path: '/session', query: { view: view.id } }"
        custom
        v-slot="{ href, navigate }"
      >
        <a
          :href="href"
          class="view-tab"
          :class="{ active: view.id === activeId }"
          :aria-current="view.id === activeId ? 'page' : undefined"
          @click="navigate"
        >
          {{ view.label }}
        </a>
      </RouterLink>
    </nav>
    <component :is="activeView.component" />
  </section>
</template>

<style scoped>
.views {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}

.view-tab {
  margin-bottom: 0;
  padding: 0.45rem 1rem;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 2rem;
  background: transparent;
  color: var(--pico-muted-color);
  font-size: 0.9rem;
  text-decoration: none;
}

.view-tab.active {
  border-color: var(--pico-primary);
  color: var(--pico-primary);
  font-weight: 600;
}
</style>
