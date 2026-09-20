import type { RouteRecordRaw } from 'vue-router'

import HomePage from '@/features/home/HomePage.vue'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/character',
    name: 'character-sheet',
    component: () => import('@/features/character/CharacterSheetPage.vue'),
    meta: { title: 'Character Sheet', short: 'Sheet' },
  },
  {
    path: '/rolls',
    name: 'roll-engine',
    component: () => import('@/features/rolls/RollEnginePage.vue'),
    meta: { title: 'Roll Engine', short: 'Rolls' },
  },
  {
    path: '/tracks',
    name: 'progress-tracks',
    component: () => import('@/features/tracks/ProgressTracksPage.vue'),
    meta: { title: 'Progress Tracks', short: 'Tracks' },
  },
  {
    path: '/oracles',
    name: 'oracles',
    component: () => import('@/features/oracles/OraclesPage.vue'),
    meta: { title: 'Oracles', short: 'Oracles' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]
