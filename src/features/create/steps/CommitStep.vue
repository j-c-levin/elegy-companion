<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import ManualRef from '@/components/ManualRef.vue'
import { game, resetGame } from '@/store'
import { commitDraft, hasValidAttributeSpread, type CreationDraft } from '../draft'

const props = defineProps<{ draft: CreationDraft }>()
const emit = defineEmits<{ committed: [] }>()

const spreadValid = computed(() => hasValidAttributeSpread(props.draft.attributes))
const existingName = computed(() => game.identity.name)

const armed = ref(false)
const committed = ref(false)
const committedName = ref('')
let disarmTimer: number | undefined

function commit(): void {
  if (committed.value || !spreadValid.value) return
  if (existingName.value && !armed.value) {
    armed.value = true
    disarmTimer = window.setTimeout(() => {
      armed.value = false
    }, 4000)
    return
  }
  window.clearTimeout(disarmTimer)
  armed.value = false
  if (existingName.value) resetGame()
  commitDraft(props.draft)
  committedName.value = props.draft.name
  committed.value = true
  emit('committed')
}

onUnmounted(() => window.clearTimeout(disarmTimer))

const attributesSummary = computed(() =>
  `Body +${props.draft.attributes.body}, Mind +${props.draft.attributes.mind}, Charm +${props.draft.attributes.charm}, Soul +${props.draft.attributes.soul}`,
)

const powersSummary = computed(() => [...props.draft.gifts, ...props.draft.mysteries].filter(Boolean).join(', '))

const rows = computed(() => [
  { label: 'Occupation in life', value: props.draft.occupation },
  { label: 'Apparent age', value: props.draft.apparentAge },
  { label: 'Progenitor', value: props.draft.progenitor },
  { label: 'Reason for turning', value: props.draft.turningReason },
  { label: 'Gifts and Mysteries', value: powersSummary.value },
  { label: 'Aspects', value: props.draft.aspects.filter(Boolean).join(', ') },
  { label: 'Attributes', value: attributesSummary.value },
  { label: 'Name', value: props.draft.name },
  { label: 'Looks and vibe', value: props.draft.look },
  { label: 'Home', value: props.draft.home },
  { label: 'Possessions', value: props.draft.possessions.join(', ') },
  { label: 'Relationships', value: props.draft.relationships.filter(Boolean).join('; ') },
])
</script>

<template>
  <section aria-labelledby="step-commit">
    <h2 id="step-commit">Commit character</h2>

    <template v-if="!committed">
      <article v-if="existingName" class="warning-card">
        <h3>A character already exists</h3>
        <p>
          <strong>{{ existingName }}</strong> lives on the sheet. Committing erases them —
          meters, XP, lists, everything — and replaces the sheet with this draft.
        </p>
      </article>
      <p v-else class="cite">Write the draft onto the blank sheet.</p>

      <dl class="summary">
        <template v-for="row in rows" :key="row.label">
          <div v-if="row.value" class="summary-row">
            <dt>{{ row.label }}</dt>
            <dd>{{ row.value }}</dd>
          </div>
        </template>
      </dl>
      <p v-if="!spreadValid" class="spread-warn" role="status">
        Finish the Attributes step first: the values must be exactly +3/+2/+2/+1 (manual
        1942–1946).
      </p>
      <button
        type="button"
        class="commit-btn"
        :class="{ armed }"
        :disabled="!spreadValid"
        @click="commit"
      >
        <template v-if="!spreadValid">Attributes incomplete</template>
        <template v-else-if="armed">This erases {{ existingName }}. Commit anyway?</template>
        <template v-else>Commit character</template>
      </button>
    </template>

    <article v-else class="success-card">
      <h3>{{ committedName || 'Your vampire' }} rises</h3>
      <p>The sheet is live. Next steps:</p>
      <ul>
        <li>
          Note each Aspect's starting ability — browse the
          <RouterLink to="/aspects">Aspect Database</RouterLink>.
        </li>
        <li>
          Add your two Connections with their Rank in the
          <RouterLink to="/connections">Connections</RouterLink> tool (manual 1880–1939).
        </li>
        <li>
          Track your first favor on <RouterLink to="/tracks">Progress Tracks</RouterLink>.
        </li>
        <li>Record XP tallies in the <RouterLink to="/session?view=xp">Session</RouterLink> tool.</li>
      </ul>
      <p class="finishing-cite">
        Meters were set to creation defaults: Rush 2 of 10, Health 5, Clarity 5, Blood 4 (manual
        2047–2055 <ManualRef ref-key="creation-finishing" />).
      </p>
    </article>
  </section>
</template>

<style scoped>
.warning-card {
  border: 2px solid var(--pico-primary);
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
  background: var(--pico-card-background-color);
}

.warning-card h3 {
  font-size: 1rem;
  margin-bottom: 0.3rem;
}

.summary {
  margin: 0 0 1rem;
}

.summary-row {
  display: flex;
  gap: 0.75rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid var(--pico-muted-border-color);
}

.summary-row dt {
  flex: 0 0 10rem;
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}

.summary-row dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.spread-warn {
  color: var(--pico-muted-color);
  font-size: 0.9rem;
}

.commit-btn {
  width: 100%;
  min-height: 3rem;
  font-weight: 700;
}

.commit-btn.armed {
  background: var(--pico-primary-background);
  border-color: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
  animation: pulse 1s ease infinite;
}

@keyframes pulse {
  50% {
    filter: brightness(1.25);
  }
}

.success-card {
  border: 1px solid var(--pico-primary);
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  background: var(--pico-card-background-color);
}

.success-card h3 {
  font-size: 1.1rem;
}

.finishing-cite {
  color: var(--pico-muted-color);
  font-size: 0.85rem;
  margin-bottom: 0;
}
</style>
