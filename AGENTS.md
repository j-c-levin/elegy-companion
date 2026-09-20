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
