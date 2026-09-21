# Character creation feature (Phase 3 task 11)

Character creation wizard at `/create`. Owner: task 11 agent. Scope: identity,
attributes, starting Abilities (manual 2090–2337), innate Gifts + blight per the
chosen Truth (manual 1492–1510).

## Contract (foundation-owned, do not reshape)

- Creation tables: `src/data/creation.json` (id `creation`, read-only) — mortal
  occupation, turning-who, turning-why, innate gifts, skills/assets, mysteries,
  vampire home references. Rows point at the oracle tables that already digitize
  them (`mortal-occupation`, `turning-who`, `turning-why`, `vampire-power`,
  `expertises-edges`, `mystery`, `vampire-home`); roll on those tables, never
  duplicate their rows here.
- Draft state: `elegy:creation-draft` via `readJson`/`writeJson` (see `draft.ts`
  `loadDraft` / `saveDraft` / `clearDraft`), payload `{ version: 1, draft }`.
- Types + defaults: `src/features/create/draft.ts` (`CreationDraft`,
  `createDefaultDraft`, `loadDraft`, `saveDraft`, `clearDraft`, `commitDraft`).
- `commitDraft` is the ONLY write path into shared state: identity fields +
  attributes via `updateGame` (attributes limited to the +3/+2/+2/+1 spread,
  manual 1942–1946; meters reset to creation defaults). Connections, tracks,
  conditions and XP are never written — the wizard links to `/connections` and
  `/tracks` for follow-up steps instead.

## Storage (claimed)

- `creation-draft` (`elegy:creation-draft`, version 1): owned by this feature.
  Abandoned-draft state only; the committed character lives in `elegy:game`.
- `world` (`elegy:world`): owned by task 10. Read the innate-powers Truth
  (`truths['innate-powers']`) to prefill the gifts step; never write it.

## Files the implementation agent may touch

Everything in `src/features/create/` (this README included), plus nothing else:
`src/router/routes.ts`, `src/store/*`, `src/styles/base.css`, `src/manual/refs.json`
(need a new citation key: coordinate with the lead — shared file),
`src/data/creation.json` and other features are off-limits.

## Manual citations

Use the pre-registered keys: `character-creation` (1628–2089),
`creation-origins`, `creation-turning`, `creation-gifts`, `creation-skills`,
`creation-magic`, `creation-relationships`, `creation-identity`,
`creation-finishing`, `attributes-create` (1942–1946, existing),
`starting-abilities` (2090–2337).

## Known limitations (foundation stub)

- `CreatePage.vue` is a `ToolStub` placeholder. The wizard UI is task 11's work.
- Aspect names in `creation.json` are labels only; full ability text belongs to
  task 13 (`src/data/aspects.json`) — link there, do not copy text here.
