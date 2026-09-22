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
    path: '/session',
    name: 'session',
    component: () => import('@/features/session/SessionPage.vue'),
    meta: {
      title: 'Session',
      short: 'Session',
      blurb: 'End-of-night slumber checklist, Loose Ends and the XP economy in one flow.',
    },
  },
  {
    path: '/connections',
    name: 'connections',
    component: () => import('@/features/connections/ConnectionsPage.vue'),
    meta: {
      title: 'Connections',
      short: 'Conns',
      blurb: 'Rank, Pulse, Sealed and Bloodied states for every relationship.',
    },
  },
  {
    path: '/roster',
    name: 'npc-roster',
    component: () => import('@/features/roster/RosterPage.vue'),
    meta: {
      title: 'NPC & Adversary Roster',
      short: 'Roster',
      blurb: 'Rank, Pulse and notes for every NPC and adversary you create.',
    },
  },
  {
    path: '/reference',
    name: 'rules-reference',
    component: () => import('@/features/reference/ReferencePage.vue'),
    meta: {
      title: 'Rules Reference',
      short: 'Rules',
      blurb: 'Searchable glossary, basic actions and damage tables with full rules text.',
    },
  },
  {
    path: '/aspects',
    name: 'aspect-database',
    component: () => import('@/features/aspects/AspectsPage.vue'),
    meta: {
      title: 'Aspect Database',
      short: 'Aspects',
      blurb: 'Browse Expertises, Gifts, Mysteries, Edges and Burdens with acquisition rules.',
    },
  },
  {
    path: '/world',
    name: 'world-creation',
    component: () => import('@/features/world/WorldPage.vue'),
    meta: {
      title: 'World Creation',
      short: 'World',
      blurb: 'Step through Truths, build your city and generate your first mission.',
    },
  },
  {
    path: '/create',
    name: 'character-creation',
    component: () => import('@/features/create/CreatePage.vue'),
    meta: {
      title: 'Character Creation',
      short: 'Create',
      blurb: 'Origins, turning, gifts, attributes and starting abilities — from mortal to vampire.',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]
