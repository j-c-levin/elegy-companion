# AGENTS.md

## Git workflow

- Do all implementation work in a git worktree, never directly on `main` (Pages deploys from `main`, keep it always working):

  ```
  git worktree add ../elegy-companion-<topic> -b feature/<topic>
  ```

- Commit and push regularly: small, frequent commits on the branch, pushed to origin early and often.

- When a worktree's branch is merged into `main`, clean up immediately:

  ```
  git worktree remove ../elegy-companion-<topic>
  git branch -d feature/<topic>
  git push origin --delete feature/<topic>   # if the remote branch still exists
  ```

- Do not leave merged worktrees or branches behind.

## Product conventions

- **Mobile and desktop friendly, both are first-class.** Every screen must be usable on a phone (touch targets, responsive layout) and a desktop. There is no data sync between devices: all state lives in `localStorage` on each device. No backend, no accounts, ever. Design every feature so it can be opened on either platform and persist there.
- **UX-first, aesthetics-minimal.** Clean, uncluttered user experience is the priority. Use only the shared base CSS layer (see README "Building"): no styling engines, no component libraries, no theming effort. The bar is "looks intentional, not raw HTML" — nothing more.
- **Features stay isolated.** One directory per feature. Shared game state goes through the store defined by the foundation; extend it additively in new files, never rewrite shared store files. Router/tab registration is the only shared file a feature may need to touch.
- **Cite the manual.** Game rules live in `reference/elegy-4e-beta-v3.txt`; the line-number index is in README.md. Implement mechanics exactly as written and cite line numbers in PR/commit notes.
- **No emojis. No unnecessary comments.**

## Agent conduct

- Subagents do not spawn subagents and do not merge to `main`. The orchestrator handles code review (dispatched separately) and merging.
