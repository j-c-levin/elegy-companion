import type { CreationDraft } from './draft'

export interface StepProps {
  draft: CreationDraft
}

export type StepPatch = Partial<CreationDraft>

export interface StepEmits {
  patch: [patch: StepPatch]
}
