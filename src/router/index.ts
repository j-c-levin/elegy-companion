import type { Router } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

import { routes } from './routes'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    short: string
  }
}

export const router: Router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
