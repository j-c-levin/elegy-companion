import type { OracleCategory, OracleTable } from '@/features/oracles/types'

import action from './action.json'
import descriptor from './descriptor.json'
import theme from './theme.json'
import yesNo from './yes-no.json'
import femaleName from './female-name.json'
import maleName from './male-name.json'
import subject from './subject.json'
import firstLook from './first-look.json'
import initialDisposition from './initial-disposition.json'
import characterGoal from './character-goal.json'
import relationships from './relationships.json'
import revealedCharacteristic from './revealed-characteristic.json'
import mortalOccupation from './mortal-occupation.json'
import expertisesEdges from './expertises-edges.json'
import turningWho from './turning-who.json'
import turningWhy from './turning-why.json'
import vampirePower from './vampire-power.json'
import mystery from './mystery.json'
import witchSchool from './witch-school.json'
import clue from './clue.json'
import combatAction from './combat-action.json'
import faction from './faction.json'
import factionRelationship from './faction-relationship.json'
import sampleFactions from './sample-factions.json'
import urbanPlace from './urban-place.json'
import naturalPlace from './natural-place.json'
import historicalPlace from './historical-place.json'
import secretLocation from './secret-location.json'
import vampireHome from './vampire-home.json'
import placeQuirk from './place-quirk.json'
import districtType from './district-type.json'
import ancientRelic from './ancient-relic.json'
import mortalPersonalTreasure from './mortal-personal-treasure.json'
import weapon from './weapon.json'
import nightlife from './nightlife.json'
import streets from './streets.json'
import busyStreet from './busy-street.json'
import clubsAndBars from './clubs-and-bars.json'
import abandonedPlace from './abandoned-place.json'
import ordinaryHome from './ordinary-home.json'
import sumptuousPlace from './sumptuous-place.json'

export const ORACLE_TABLES = [
  action,
  descriptor,
  theme,
  yesNo,
  femaleName,
  maleName,
  subject,
  firstLook,
  initialDisposition,
  characterGoal,
  relationships,
  revealedCharacteristic,
  mortalOccupation,
  expertisesEdges,
  turningWho,
  turningWhy,
  vampirePower,
  mystery,
  witchSchool,
  clue,
  combatAction,
  faction,
  factionRelationship,
  sampleFactions,
  urbanPlace,
  naturalPlace,
  historicalPlace,
  secretLocation,
  vampireHome,
  placeQuirk,
  districtType,
  ancientRelic,
  mortalPersonalTreasure,
  weapon,
  nightlife,
  streets,
  busyStreet,
  clubsAndBars,
  abandonedPlace,
  ordinaryHome,
  sumptuousPlace
] as unknown as OracleTable[]

export const ORACLE_TABLES_BY_ID: Readonly<Record<string, OracleTable>> = Object.fromEntries(
  ORACLE_TABLES.map((t) => [t.id, t])
)

export const TABLES_BY_CATEGORY: Readonly<Record<OracleCategory, OracleTable[]>> = ORACLE_TABLES.reduce(
  (acc, table) => {
    ;(acc[table.category] ??= []).push(table)
    return acc
  },
  {} as Record<OracleCategory, OracleTable[]>
)
