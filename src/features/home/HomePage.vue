<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { routes } from '@/router/routes'

const tools = routes.flatMap((route) =>
  route.meta
    ? [{ to: route.path, name: route.meta.title, blurb: route.meta.blurb }]
    : [],
)
</script>

<template>
  <section>
    <h1>Elegy Companion</h1>
    <p class="tagline">Tools for your nights in the city. Choose a tool to begin.</p>
    <div class="card-grid">
      <RouterLink v-for="tool in tools" :key="tool.to" class="card" :to="tool.to">
        <h3>{{ tool.name }}</h3>
        <p>{{ tool.blurb }}</p>
        <span class="card-cta">Open</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.tagline {
  color: var(--pico-muted-color);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.card {
  display: block;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.75rem;
  padding: 1.1rem 1.25rem;
  background: var(--pico-card-background-color);
  color: var(--pico-color);
  text-decoration: none;
  transition: border-color 0.15s ease;
}

.card:hover {
  border-color: var(--pico-primary);
}

.card h3 {
  margin-bottom: 0.3rem;
}

.card p {
  color: var(--pico-muted-color);
  font-size: 0.95rem;
  margin-bottom: 0.6rem;
}

.card-cta {
  color: var(--pico-primary);
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
