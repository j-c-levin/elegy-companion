<script setup lang="ts">
import ManualRef from '@/components/ManualRef.vue'

const healthRows = [
  { sources: ['Rank 1 NPC', 'Something that would bruise a mortal'], lost: 1 },
  {
    sources: [
      'Rank 2 or 3 NPC',
      'Something that would seriously wound a mortal',
      'Indirect or partially covered sunlight',
      'Brief contact with fire',
    ],
    lost: 2,
  },
  {
    sources: [
      'Rank 4 or 5 NPC',
      'Something that would mortally wound or kill a mortal',
      'Direct sunlight',
      'Prolonged exposure to fire',
    ],
    lost: 3,
  },
]

const clarityRows = [
  { gravity: 'Unsettling', lost: 1 },
  { gravity: 'Nightmarish', lost: 2 },
  { gravity: 'Soul-crushing', lost: 3 },
]
</script>

<template>
  <section aria-label="Damage and clarity-loss tables">
    <header class="section-head">
      <h2>
        Damage and Clarity loss
        <ManualRef ref-key="combat" />
      </h2>
    </header>

    <article class="table-card">
      <h3>
        Health lost by source of danger
        <ManualRef ref-key="health-harm" />
      </h3>
      <table>
        <thead>
          <tr>
            <th scope="col">Source of danger</th>
            <th scope="col" class="num">Health lost</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in healthRows" :key="row.lost">
            <td>
              <ul class="source-list">
                <li v-for="s in row.sources" :key="s">{{ s }}</li>
              </ul>
            </td>
            <td class="num">{{ row.lost }}</td>
          </tr>
        </tbody>
      </table>
      <p class="table-note">
        At 0 Health: Wounded, then Mangled, then the permanent Burden Scarred.
        <ManualRef ref-key="health-cascade" />
      </p>
      <p class="table-note">
        Mitigating Health loss: spend 1 Rush to lose 1 less, when safe and not yet Wounded.
        <ManualRef ref-key="mitigate-health" />
      </p>
    </article>

    <article class="table-card">
      <h3>
        Clarity lost by gravity of experience
        <ManualRef ref-key="clarity-harm" />
      </h3>
      <table>
        <thead>
          <tr>
            <th scope="col">Gravity of your experience</th>
            <th scope="col" class="num">Clarity lost</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in clarityRows" :key="row.gravity">
            <td>{{ row.gravity }}</td>
            <td class="num">{{ row.lost }}</td>
          </tr>
        </tbody>
      </table>
      <p class="table-note">
        At 0 Clarity: In Shock, then Tormented, then the permanent Burden Traumatized.
        <ManualRef ref-key="clarity-cascade" />
      </p>
      <p class="table-note">
        Mitigating Clarity loss: spend 1 Rush to lose 1 less, when safe and not yet In Shock.
        <ManualRef ref-key="mitigate-clarity" />
      </p>
    </article>
  </section>
</template>

<style scoped>
.section-head h2 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.table-card {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 0.5rem;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
}

.table-card h3 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.5rem;
}

table {
  width: 100%;
  margin: 0;
}

th,
td {
  padding: 0.45rem 0.5rem;
  vertical-align: top;
}

.num {
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  width: 1%;
}

.source-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.table-note {
  color: var(--pico-muted-color);
  font-size: 0.9rem;
  margin: 0.6rem 0 0;
}
</style>
