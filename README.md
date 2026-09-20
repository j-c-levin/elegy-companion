# Elegy Companion

A digital companion website for playing [Elegy 4e](https://discord.com/invite/elegy) — a solo (and co-op/guided) tabletop RPG where you play a young vampire surviving in a big city. Built to run as a static site on GitHub Pages: no backend, no accounts, works offline.

**Source manual:** *Elegy 4e Beta v3* by Moro de Oliveira (Miracle M). The full text extraction lives at
[`reference/elegy-4e-beta-v3.txt`](reference/elegy-4e-beta-v3.txt) (8,273 lines, extracted with `pdftotext -layout` from the beta PDF).

> **Citing the manual:** line references in this doc use the form
> `reference/elegy-4e-beta-v3.txt:LINE` (range: `:START-END`). The extraction is deterministic — the same command on the same PDF always yields identical line numbers — so these references stay stable across agents and sessions. Note the layout-mode extraction puts the two PDF columns side by side on shared lines, so one line number can contain text from both columns.

---

## Manual index (line-numbered)

For future agents: this is the map of the extracted manual. Find the rule you need before implementing.

| Section | Lines |
|---|---|
| Credits / what the game is | 1–46 |
| Table of contents | 12–47 |
| Welcome to Elegy / what you need to play / multiplayer modes | 53–95 |
| The Setting (vampires, secrecy, society) | 96–126 |
| Your Character (the four fiction pillars) | 127–166 |
| **Chapter 2 — How to play** | 167–1396 |
| Character basics / Identity | 174–190 |
| Attributes (Body, Mind, Charm, Soul) | 191–220 |
| Aspects: types, XP evolution, narrative requirements | 221–267 |
| Conditions overview (Resources vs Tenets) | 268–300 |
| Other characters (allies, NPCs, Factions) | 301–314 |
| **The Action Roll** (1d6 + attribute vs 2d10) | 315–362 |
| Results (Stylish / Flat / Failure) | 316–362 |
| Rush (−6..+10, cooling, base +2) | 363–375 |
| **Pay the Price** d100 table | 364–412 |
| Basic Actions: Face Danger, Secure an Advantage, Compel, Gather Information, Hunt | 418–489 |
| The Generic Action Roll | 490–512 |
| Matches (doubles on challenge dice) + Twist / Misfortune / Impulse tables | 513–576 |
| Best practices (fiction first, zooming) | 577–620 |
| Play loop diagram | 621–655 |
| **Suffering** (Resources vs Tenets explained) | 656–680 |
| Health (regenerate roll, 0-health cascade: Wounded → Mangled → Scarred) | 681–722 |
| Clarity (respite roll, cascade: In Shock → Tormented → Traumatized) | 723–761 |
| Blood (Flow Your Blood, Appear Alive, Slumber, Feeding) | 762–805 |
| At 0 Blood cascade (Starving → Enraged → Torpid); Rush setbacks; 0 Rush | 806–845 |
| Conscience & Standing tenets (Trying rolls + cascades) | 846–887 |
| The End (character death/ending) | 888–910 |
| **Progress Tracks** (10 boxes, progress-per-rank table) | 911–932 |
| Missions (ranks, fulfilling roll, abandoning consequences) | 933–978 |
| Connections (rank table, progress, Sealed, testing, Bloodied, Pulse) | 979–1084 |
| Combat (attack rolls, damage per rank, winning/losing) | 1085–1121 |
| Experience (gaining, XP-per-rank table, failures, Loose Ends, spending) | 1122–1160 |
| XP notation (tallies) | 1161–1187 |
| Glossary | 1188–1396 |
| **Chapter 3 — Begin your journey** (setup) | 1397–2891 |
| The Basic Setting (vampires, blood, hunger, Elegy, vulnerabilities, turning) | 1404–1490 |
| Truths: origins, innate powers, population, politics, hunting territory | 1491–1627 |
| Create your character (identity, attributes, blight) | 1628–2089 |
| Starting Abilities (choose Aspects) | 2090–2337 |
| Create your City (districts, factions, landmarks) | 2338–2698 |
| Your First Mission | 2699–2891 |
| **Chapter 4 — Aspects** (full lists & abilities) | 2892–4269 |
| Expertise | 2960 | 
| Gift (Animality, Shadows, …) | 3310 |
| Edge | 3672 |
| Connection abilities | 3916 |
| Burden abilities | 3961 |
| **Chapter 5 — Other Characters** (NPC creation, statblocks, Factions) | 4270–4854 |
| NPCs & creating them | 4270–4490 |
| Witches / Werewolves / Fey | 4491–4660 |
| Factions | 4661–4854 |
| **Chapter 6 — Oracles** | 4855–6662 |
| How to ask (Ask → Pick → Roll → Interpret) | 4856–4884 |
| General: Action / Descriptor / Theme / Yes-No | 4886–4972 |
| Characters: names, Subject, First Look, Disposition, Character Goal | 4974–5463 |
| Mystery oracle + Witch School | 5464–5495 |
| Story: Clue table, Combat action table | 5496–5559 |
| Faction: values/names generator, Relationship | 5560–5761 |
| Locations: Urban / Historical / Secret / Vampire home / District / Relic | 5762–5925 |
| Objects: pocket contents, Weapon tables | 5926–6059 |
| Quick Victim: Nightlife / Streets | 6060–6112 |
| Ambience: Busy Street and others | 6113–6662 |
| **Chapter 7 — Alternative Rules** | 6663–6700 |
| **Chapter 8 — Actual play** (worked example, Yasmin) | 6701–7739 |
| Printable sheets (text is rough here; sheets are graphics) | 7740–8273 |

Quick jump points for implementation:
- Character sheet fields: 7744–7751 (Body/Mind/Charm/Soul, Aspects block)
- Meters state example in play: 6909 (`Rush: 2 | Blood: 4 | Health: 5 | Clarity: 5`)

---

## Feature roadmap

### Phase 1 — Core play loop (the paper friction)

1. **Interactive character sheet**
   - Meters: Health, Clarity, Blood, Rush — with base Rush (+2) and max Rush adjustments from conditions.
   - Condition cascades wired to the meters: dropping below 0 offers the next unmarked condition with its full rules text (Health 694–717, Clarity 726–744, Blood 806–833, Conscience 864–882, Standing 888–907).
   - Mitigation prompts: "spend 1 Rush to lose 1 less" buttons (Health 708, Clarity 740, Blood 779).
   - Attributes, Identity block, Possessions, XP tally.

2. **Roll engine**
   - d6 action die + attribute + bonuses vs 2d10 challenge dice; auto-verdict Stylish/Flat/Failure (315–362).
   - Match detection on challenge dice → surfaces Twist (Stylish), Misfortune (Failure), or Impulse (Failure and action die > Blood) tables with one-click rolls (513–524).
   - "Cool your Rush" action: if current Rush > action score, replace score and reset Rush to base (363–375).
   - Aspect bonus tracking ("Aspects give you Rush": +1 Rush on any success aided by an Aspect, 436–438).
   - Pay the Price roller (376–412) with "roll again if it doesn't make sense" affordance.

3. **Progress tracks**
   - Create Mission / Connection / Combat tracks with Rank 1–5; marking fills the correct number of boxes (progress per rank table, 914–927).
   - Mission fulfillment: roll 2d10 vs filled boxes, with recommit/abandon flows (934–978).
   - Combat: adversary tracks, "mark once more with weapons/fangs", Connection-support multiplier (1085–1121).

4. **Oracle engine**
   - Yes/No with odds presets: Small Chance / Unlikely / 50-50 / Likely / Almost Certain (4956–4967).
   - All tables digitized per the index above; click to reroll; "roll twice / roll on the subject table" chaining for compound results (e.g. Subject 96–00 → roll twice, 5087).

### Phase 2 — Session & bookkeeping

5. **Night log / slumber checklist** — one button per night's end that runs the slumber routine: lose 1 Blood (unmitigable), gain +1 Rush, Try Your Standing if laws were violated, write a Loose End (767–778).
6. **Loose Ends tracker** — capture questions, mark Tied, auto-grant +1 XP (1147–1155).
7. **XP economy** — fail → +1 XP, match-fail → +3 XP (1144–1146); spend 10 to upgrade / 15 to acquire (1123–1155); gift/mystery acquisition flows via Connection missions (1136–1149).
8. **Connection manager** — Rank, Pulse (= Rank + 2, 1060–1062), Sealed / Bloodied-by-you / Bloodied-by-them states with their mechanical effects attached (1026–1084).
9. **NPC & adversary roster** — Rank, common-rank table per creature type (986–1008), Pulse, notes; statblock references from Chapter 5 (4270–4854).

### Phase 3 — Setup & reference

10. **Guided world creation** — step through Truths with oracle wiring (origins, innate powers, population, politics, hunting territory: 1491–1627), city creation (2338–2698), first mission generation (2699–2891).
11. **Character creation wizard** — identity, attributes, starting Abilities (2090–2337), innate Gifts + blight per chosen Truth (1492–1510).
12. **Rules reference** — searchable glossary (1188–1396), basic actions with full result text (418–512), damage/clarity-loss tables by threat Rank (Health 687–696, Clarity 728–739).
13. **Aspect database** — browse Expertises, Gifts, Mysteries, Edges, Burdens with abilities and acquisition requirements (2892–4269).

### Phase 4 — Nice-to-haves

14. **PWA / offline** — installable, all state in `localStorage`, export/import JSON.
15. **Journal** — scene-by-scene log with timestamps, markdown export (the game explicitly encourages journaling, 97–106).
16. **Ambience mode** — timed Ambience-table rolls during play (6113–6662).
17. **Multiplayer support** — shared state for co-op/Guided modes (82–90); aid via Secure an Advantage (430–438); group-roll rules (578–592).

### Suggested tech stack

Static single-page app, no build step required for v1 (plain HTML/CSS/JS or a small Vite+TS setup). Data (oracle tables, aspects, glossary) as JSON modules so future agents can extend tables without touching logic.

---

## Building

**Stack:** Vue 3 (`<script setup>` SFCs) + TypeScript + Vite, `vue-router` (hash history — no server config needed on Pages), [Pico.css](https://picocss.com) as the classless base layer plus a small shared layer in `src/styles/base.css`. Dependencies are kept minimal on purpose; no styling engines, no component libraries, no backend.

```sh
npm install
npm run dev        # dev server
npm run build      # typecheck + build to dist/
npm run preview    # serve the production build locally
```

Deploys to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`. The Vite `base` is `/elegy-companion/`.

### Tools and routes (Phase 1)

| Tool | Route |
|---|---|
| Home (launchpad) | `/` |
| Character Sheet | `/character` |
| Roll Engine | `/rolls` |
| Progress Tracks | `/tracks` |
| Oracles | `/oracles` |

Navigation is top tabs on desktop, a bottom tab bar on mobile (breakpoint 720px). Pages use hash routing (`/#/character`).

### Shared state and data conventions

- **Store:** `src/store/` is the shared, typed, localStorage-backed game state (identity, attributes, Body/Mind/Charm/Soul, Health/Clarity/Blood/Rush meters, XP, active conditions, generic lists). Read the full API in [`docs/store.md`](docs/store.md) before touching game state. Extend it additively; never rewrite shared store files.
- **Static game data:** oracle tables and similar content go in `src/data/` as JSON modules — see [`src/data/README.md`](src/data/README.md).
- **Feature isolation:** one directory per feature under `src/features/`; the only shared file a feature edits is [`src/router/routes.ts`](src/router/routes.ts) (route + tab registration).

---

## For future agents

- Read `reference/elegy-4e-beta-v3.txt` sections via the index above — don't re-extract the PDF (the line numbers here assume `-layout` mode).
- The 4e rules are **in beta**; if the author publishes updates, re-extract and re-index, then update this file's references.
- Elegy is built on Ironsworn/Starforged mechanics (CC BY 4.0, 2): oracle/roll conventions follow that lineage — the Shadow of Ironsworn community tooling is a useful reference for UX patterns.
- Text in the extraction is the author's beta material, included in `reference/` for personal play use; don't republish it as game content.
