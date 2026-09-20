export const ATTRIBUTE_KEYS = ['body', 'mind', 'charm', 'soul'] as const

export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number]

export type Attributes = Record<AttributeKey, number>

export type MeterKey = 'health' | 'clarity' | 'blood' | 'rush'

export interface Meter {
  value: number
  max: number
}

export interface RushMeter extends Meter {
  base: number
}

export interface GameMeters {
  health: Meter
  clarity: Meter
  blood: Meter
  rush: RushMeter
}

export interface CharacterIdentity {
  name: string
  apparentAge: string
  realAge: string
  occupation: string
  look: string
  progenitor: string
  home: string
  possessions: string[]
}

export interface ListItem {
  id: string
  text: string
}

export interface GameState {
  version: number
  identity: CharacterIdentity
  attributes: Attributes
  meters: GameMeters
  xp: number
  activeConditions: string[]
  lists: Record<string, ListItem[]>
}
