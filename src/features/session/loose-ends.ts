import { addListItem, game, removeListItem, updateGame } from '@/store'
import { awardXp } from './xp'

const OPEN_LIST = 'loose-ends'
const TIED_LIST = 'loose-ends-tied'

export function writeLooseEnd(text: string): void {
  const trimmed = text.trim()
  if (!trimmed) return
  updateGame((draft) => {
    addListItem(draft, OPEN_LIST, trimmed)
  })
}

export function tieLooseEnd(id: string): void {
  const stillOpen = (game.lists[OPEN_LIST] ?? []).some((item) => item.id === id)
  if (!stillOpen) return
  updateGame((draft) => {
    const list = draft.lists[OPEN_LIST] ?? []
    const item = list.find((entry) => entry.id === id)
    if (!item) return
    removeListItem(draft, OPEN_LIST, id)
    const tied = draft.lists[TIED_LIST] ?? []
    tied.push({ id: item.id, text: item.text })
    draft.lists[TIED_LIST] = tied
  })
  awardXp(1)
}

export function discardLooseEnd(id: string): void {
  updateGame((draft) => {
    removeListItem(draft, OPEN_LIST, id)
  })
}
