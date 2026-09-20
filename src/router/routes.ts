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
    meta: {
      title: 'Character Sheet',
      short: 'Sheet',
      blurb: 'Identity, attributes, meters, conditions and XP — everything the paper sheet tracked.',
    },
  },
  {
    path: '/rolls',
    name: 'roll-engine',
    component: () => import('@/features/rolls/RollEnginePage.vue'),
    meta: {
      title: 'Roll Engine',
      short: 'Rolls',
      blurb: 'Action rolls against the challenge dice, Rush cooling, and Pay the Price.',
    },
  },
  {
    path: '/tracks',
    name: 'progress-tracks',
    component: () => import('@/features/tracks/ProgressTracksPage.vue'),
    meta: {
      title: 'Progress Tracks',
      short: 'Tracks',
      blurb: 'Missions, connections and combat tracks with rank-based progress boxes.',
    },
  },
  {
    path: '/oracles',
    name: 'oracles',
    component: () => import('@/features/oracles/OraclesPage.vue'),
    meta: {
      title: 'Oracles',
      short: 'Oracles',
      blurb: 'Yes/no questions with odds presets and every table in the manual.',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]
