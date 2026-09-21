<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { routes } from '@/router/routes'

const tools = routes.flatMap((route) =>
  route.meta ? [{ to: route.path, title: route.meta.title, short: route.meta.short }] : [],
)
</script>

<template>
  <header class="app-header">
    <div class="app-header-inner">
      <RouterLink to="/" class="brand">Elegy Companion</RouterLink>
      <nav class="desktop-nav" aria-label="Tools">
        <RouterLink v-for="tool in tools" :key="tool.to" :to="tool.to">{{ tool.title }}</RouterLink>
      </nav>
    </div>
  </header>
  <nav class="tabbar" aria-label="Tools">
    <RouterLink to="/" class="tab">Home</RouterLink>
    <RouterLink v-for="tool in tools" :key="tool.to" :to="tool.to" class="tab">{{ tool.short }}</RouterLink>
  </nav>
</template>

<style scoped>
@media (max-width: 719.98px) {
  .tabbar .tab {
    padding: 0.65rem 0.1rem;
    font-size: 0.72rem;
    white-space: nowrap;
    overflow: hidden;
  }
}

@media (min-width: 720px) {
  .desktop-nav {
    flex-wrap: wrap;
    justify-content: flex-end;
    row-gap: 0.1rem;
  }
}
</style>
