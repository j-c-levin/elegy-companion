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
- **Contrast: text on filled elements uses Pico's inverse tokens** (`--pico-primary-inverse` on `--pico-primary-background`, `--pico-secondary-inverse` on `--pico-secondary-background`) — verified WCAG AA in both color modes. Pico 2.1.1 quirks: it scopes `--pico-background-color` to the primary fill inside `<button>` (so `background: var(--pico-background-color)` on a button is blue, never the page color), the `--pico-primary-hue` override in `base.css` is inert, and `--pico-danger*` tokens are undefined — do not rely on them (see character README debt).

## Agent conduct

- The lead orchestrates roadmap phases but does not implement directly: dispatch one implementation subagent per numbered task in the phase.
  - Each implementation subagent works in its own worktree/branch `feature/<topic>` under the Git workflow above; commits and pushes regularly.
  - Subagents do not spawn subagents and do not merge to `main`.
- If tasks in a phase share interdependent paths, dispatch a foundation subagent first to build the shared pieces (store shape, shared components, routing, data conventions) so implementation subagents can each add their work cleanly in their own worktrees without rewriting shared files.
- When an implementation branch is finished, the lead spins up a reviewer subagent: approach review as a staff-level frontend engineer with a clear eye for maintainability, abstraction, and clean code. Code comments must be non-existent, or a single line only where absolutely mandatory.
- The lead handles merging to `main` after review passes.
- At the end of each roadmap phase (README Feature roadmap), the orchestrator dispatches one dedicated tech-debt cleanup subagent before the next phase starts.
  - Scope is cleanup only: known limitations in feature READMEs, review-noted gaps, TODOs, duplication, dead code, storage/migration guards. No new features.
  - Works in its own worktree/branch `feature/<phase>-cleanup` under the same git workflow; does not merge to `main`.
  - Must keep `npm run build` green and preserve manual line citations; writes remaining debt back to the owning feature README.
