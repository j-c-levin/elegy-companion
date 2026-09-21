# Character creation feature (Phase 3 task 11)

Character creation wizard at `/create`. Owner: task 11 agent. Scope: identity,
attributes, innate Gifts + blight per the chosen Truth (manual 1492–1510).
Starting Abilities are picked by name only (manual 1825–1879); ability text
(manual 2090–2337) stays in the Aspect Database — no whole-chapter registry key
is provided.

## Contract (foundation-owned, do not reshape)

- Creation tables: `src/data/creation.json` (id `creation`, read-only) — mortal
  occupation, turning-who, turning-why, innate gifts, skills/assets, mysteries,
  vampire home references. Rows point at the oracle tables that already digitize
  them (`mortal-occupation`, `turning-who`, `turning-why`, `vampire-power`,
  `expertises-edges`, `mystery`, `vampire-home`); roll on those tables, never
  duplicate their rows here. Every step carries `tables: string[]` (empty
  array where there is no oracle table).
- Draft state: `elegy:creation-draft` via `readJson`/`writeJson` (see `draft.ts`
  `loadDraft` / `saveDraft` / `clearDraft`), payload `{ version: 1, draft }`.
- Types + defaults: `src/features/create/draft.ts` (`CreationDraft`,
  `createDefaultDraft`, `loadDraft`, `saveDraft`, `clearDraft`,
  `hasValidAttributeSpread`, `commitDraft`).
- `commitDraft` is the ONLY write path into shared state: identity fields +
  attributes via `updateGame` (attributes limited to the +3/+2/+2/+1 spread,
  manual 1942–1946 — validate with `hasValidAttributeSpread` before calling,
  since `commitDraft` throws on an invalid spread; meters reset to creation
  defaults, `identity.realAge` is cleared because the draft has no realAge
  field). Connections, tracks, conditions and XP are never written — the
  wizard links to `/connections` and `/tracks` for follow-up steps instead.
- Re-creation: if a character already exists (`game.identity.name !== ''`),
  the wizard confirms with the user, calls `resetGame()` (from `@/store`),
  then `commitDraft()` — `commitDraft` alone preserves `xp`,
  `activeConditions` and `lists`.

## Storage (claimed)

- `creation-draft` (`elegy:creation-draft`, version 1): owned by this feature.
  Abandoned-draft state only; the committed character lives in `elegy:game`.
- `world` (`elegy:world`): owned by task 10. Read the innate-powers Truth
  (`loadWorld()` from `@/features/world/world`, then
  `truths['innate-powers']`) to prefill the gifts step; never write it.

## Wizard flow (implemented)

1. Origins — occupation and apparent age; oracle inspiration via
   `mortal-occupation` (manual 1641–1721).
2. Turning — progenitor and reason; `turning-who` is read-only inspiration,
   `turning-why` can be applied to the reason field (manual 1722–1786).
3. Gifts — three power slots, each a Gift (`vampire-power` names) or, via the
   one-for-one exchange (manual 1880–1915), a Mystery (`mystery`); the
   innate-powers Truth is read from `loadWorld()` to prefill blight guidance
   (manual 1492–1510), with a link to `/world` when unset.
4. Starting Abilities — three Aspect slots per the manual's counts (one
   Expertise main talent, two Expertise-or-Edge); names as labels only,
   ability text linked to `/aspects` (manual 1825–1879, 2090–2107).
5. Attributes — per-attribute selects with a live remaining-pool readout;
   commit stays disabled until `hasValidAttributeSpread` passes (manual
   1940–1965).
6. Identity — name, look, home (`vampire-home` roll), possessions, two
   relationships, finishing-touches and XP notes (manual 1966–2055,
   1880–1939, 1161–1187).
7. Commit — summary plus the contract's commit flow; success card links to
   `/aspects`, `/connections`, `/tracks` and `/session?view=xp`.

Oracle rolls are read-only inspiration: `rolls.ts` wraps the sanctioned
`rollTable` helper from `src/features/oracles/roll` and resolves chained rows
(e.g. vampire-home's urban/historical chains) recursively.

## Files the implementation agent may touch

Everything in `src/features/create/` (this README included), plus nothing else:
`src/router/routes.ts`, `src/store/*`, `src/styles/base.css`, `src/manual/refs.json`
(need a new citation key: coordinate with the lead — shared file),
`src/data/creation.json` and other features are off-limits.

## Manual citations

Use the pre-registered keys: `creation-origins`, `creation-turning`,
`creation-gifts`, `creation-skills`, `creation-magic`,
`creation-relationships`, `creation-attributes`, `creation-identity`,
`creation-finishing`, `attributes-create` (1942–1946, existing), plus
`truths-innate-powers` and `xp-tallies`.
Cite subsection ranges only; whole-chapter ManualRef dialogs are
intentionally not registered.

## Known limitations

- No `starting-abilities` registry key exists in `src/manual/refs.json`; the
  Abilities step cites `creation-skills` (1825–1879) and shows the
  2090–2107 range as plain text. Registering `starting-abilities`
  (2090–2107, or the full 2090–2337 subsection) needs a lead-coordinated
  refs.json edit plus `npm run manual:build`.
- Aspect names are labels only; full ability text belongs to task 13
  (`src/data/aspects.json`) — the wizard links to `/aspects`, it does not
  copy ability text.
- Wizard rolls are read-only inspiration and are not recorded in the
  oracles roll history (`elegy:rolls`).
- Wizard step position is session-local; refreshing returns to step 1. The
  draft data itself persists in `elegy:creation-draft`.
- CommitStep gates only on the attribute spread and does not require name,
  Gifts or Aspects to be filled; empty slots commit as empty fields.
- `commitDraft` preserves `xp`, `activeConditions` and `lists` by design (see
  re-creation flow above); it does not reconcile them with the new character.
- `loadDraft` discards unversioned payloads and re-tests the newer-version
  condition inline rather than via sequential checks.
