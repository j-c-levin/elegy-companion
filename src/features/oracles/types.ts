export type OracleCategory =
  | 'general'
  | 'characters'
  | 'mystery'
  | 'story'
  | 'faction'
  | 'locations'
  | 'objects'
  | 'quick-victim'
  | 'ambience'

export type WeaponColumnId = 'modern' | 'antique' | 'improvised'

export interface ChainedRoll {
  table: string
  column?: WeaponColumnId
}

export interface OracleRow {
  min: number
  max: number
  label: string
  detail?: string
  examples?: string
  situation?: string
  names1?: string[]
  names2?: string[]
  cells?: Partial<Record<WeaponColumnId, string>>
  chained?: ChainedRoll[]
  rollTwice?: boolean
}

export interface YesNoOdds {
  id: string
  label: string
  max: number
}

export interface WeaponColumn {
  id: WeaponColumnId
  title: string
  note: string
}

export type OracleTableKind = 'standard' | 'yesno' | 'weapon' | 'duo' | 'faction'

export interface OracleTable {
  id: string
  title: string
  category: OracleCategory
  dice: string
  kind: OracleTableKind
  source: string
  rows: OracleRow[]
  odds?: YesNoOdds[]
  columns?: WeaponColumn[]
}

export interface CategoryInfo {
  id: OracleCategory
  label: string
}

export const ORACLE_CATEGORIES: CategoryInfo[] = [
  { id: 'general', label: 'General' },
  { id: 'characters', label: 'Characters' },
  { id: 'mystery', label: 'Mystery' },
  { id: 'story', label: 'Story' },
  { id: 'faction', label: 'Faction' },
  { id: 'locations', label: 'Locations' },
  { id: 'objects', label: 'Objects' },
  { id: 'quick-victim', label: 'Quick Victim' },
  { id: 'ambience', label: 'Ambience' }
]
