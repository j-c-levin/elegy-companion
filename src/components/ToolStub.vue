<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{ title: string }>()
</script>

<template>
  <section class="stub">
    <h1>{{ title }}</h1>
    <p>Not implemented yet.</p>
    <p><RouterLink to="/">Back to home</RouterLink></p>
  </section>
</template>
