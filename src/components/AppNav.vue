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
