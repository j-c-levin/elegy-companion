import { updateGame } from '@/store'

export function awardXp(amount: number): void {
  if (!(amount > 0)) return
  updateGame((draft) => {
    draft.xp += amount
  })
}

export function spendXp(amount: number): void {
  if (!(amount > 0)) return
  updateGame((draft) => {
    draft.xp = Math.max(0, draft.xp - amount)
  })
}
