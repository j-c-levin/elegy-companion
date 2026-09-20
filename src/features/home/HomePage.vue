<script setup lang="ts">
import { RouterLink } from 'vue-router'

const tools = [
  {
    to: '/character',
    name: 'Character Sheet',
    blurb: 'Identity, attributes, meters, conditions and XP — everything the paper sheet tracked.',
  },
  {
    to: '/rolls',
    name: 'Roll Engine',
    blurb: 'Action rolls against the challenge dice, Rush cooling, and Pay the Price.',
  },
  {
    to: '/tracks',
    name: 'Progress Tracks',
    blurb: 'Missions, connections and combat tracks with rank-based progress boxes.',
  },
  {
    to: '/oracles',
    name: 'Oracles',
    blurb: 'Yes/no questions with odds presets and every table in the manual.',
  },
]
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
