<script setup lang="ts">
const STATBLOCKS: ReadonlyArray<{ label: string; lines: string }> = [
  { label: 'Average Vampires (Newborn to Ancient)', lines: '4338–4395' },
  { label: 'Mundane Mortals (Common Mortal, Gangster, Police Agent, Lackey)', lines: '4400–4430' },
  { label: 'Vampire Hunters (Vigilante, Holy Hunter, Agent)', lines: '4435–4466' },
  { label: 'Ghosts (Recent Ghost, Wraith)', lines: '4468–4489' },
  { label: 'Witches, incl. the d10 school table', lines: '4491–4567' },
  { label: 'Werewolves (Adolescent, Mature, Elder)', lines: '4568–4606' },
  { label: 'Fey (Refugee, Official, High Fey)', lines: '4607–4660' },
  { label: 'Factions', lines: '4661–4854' },
]
</script>

<template>
  <section class="rules">
    <h2>Creation rules — Chapter 5</h2>
    <p class="cite">
      NPCs &amp; creating them, manual 4270–4310 (full chapter: 4270–4854).
    </p>
    <ul>
      <li>
        NPCs have one mechanical stat: their Rank, representing durability in combat, skill and
        influence (4277–4279).
      </li>
      <li>
        Build NPCs that fit your city and world; start from the sample NPCs in Chapter 5 or invent
        your own, and consult the Oracle when unsure (4272–4280).
      </li>
      <li>
        Sample NPCs carry two traits: Drives — what the NPC usually seeks above all — and Means —
        the tools, assets, powers and leverage they offer (4290–4294).
      </li>
      <li>
        Elevate the Rank by one (max 5) for exceptionally powerful NPCs; lower it by one (min 1)
        for less formidable adversaries (4299–4302).
      </li>
      <li>
        When a Connection NPC goes into dangerous missions with you, create a Pulse track for them
        (4303–4305). Pulse equals Rank + 2 (1060–1062).
      </li>
      <li>
        NPCs may become long-term presences: take notes about what you learn about them, especially
        if you create a Connection (4282–4285).
      </li>
      <li>
        Werewolves count one Rank higher while transformed (1008; the statblocks at 4573, 4589 and
        4587 read "Rank X (Y when transformed)").
      </li>
    </ul>

    <h3>Statblocks in the manual</h3>
    <ul class="statblocks">
      <li v-for="block in STATBLOCKS" :key="block.label">
        {{ block.label }} <span class="lines">{{ block.lines }}</span>
      </li>
    </ul>

    <h3>Combat belongs to the tracks tool</h3>
    <p class="muted">
      Adversaries you fight are modeled as combat tracks in Progress Tracks, where attack marks,
      damage per rank and winning/losing live (1085–1121: attack 1095–1107, winning and losing
      1108–1116). Link an entry fought in Combat by name or notes here — the roster is the
      directory, not a second combat engine.
    </p>
  </section>
</template>

<style scoped>
.rules h2 {
  margin-bottom: 0.25rem;
}

.cite,
.muted {
  color: var(--pico-muted-color);
  font-size: 0.88rem;
}

ul {
  margin-bottom: 1rem;
}

li {
  margin-bottom: 0.35rem;
}

.statblocks {
  font-size: 0.92rem;
}

.lines {
  color: var(--pico-muted-color);
  font-variant-numeric: tabular-nums;
}

h3 {
  margin-top: 1.25rem;
  margin-bottom: 0.4rem;
  font-size: 1rem;
}

.muted {
  margin-bottom: 0;
}
</style>
