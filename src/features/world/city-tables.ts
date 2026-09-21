import { rollDie } from '@/features/oracles/roll'

export interface CityIdea {
  label: string
  summary: string
  seed: string
}

export const CITY_HIGHLIGHTS: readonly CityIdea[] = [
  { label: 'Job offers', summary: 'A dominant industry fuels the economy; workers move here for employment and local culture is built around it.', seed: 'What is the industry?' },
  { label: 'Historical site', summary: 'Ruins, museums and monuments from a past era are everywhere; tourism and academia feed on them.', seed: 'What era defines it, and what ruins or archeological pieces are the most famous?' },
  { label: '24-hour culture', summary: 'Nights are as active as days; most services run around the clock and the city never fully quiets down.', seed: 'What type of commerce can rarely be found open?' },
  { label: 'Vibrant nightlife', summary: 'Bars, clubs, live music venues and late-night gathering spots define the city’s reputation.', seed: 'What is the most famous nightlife spot in this city?' },
  { label: 'Art tradition', summary: 'A deep history of art production, exhibition and trade; galleries are part of the urban landscape.', seed: 'What kind of art is it known for?' },
  { label: 'Renowned academic institutions', summary: 'One or more university campuses are major references in the region; academic events are frequent.', seed: 'What academic field is the city most famous for?' },
  { label: 'Progressive social policies', summary: 'Citizens’ rights are enforced through public programs; inequality exists but is visibly less than elsewhere.', seed: 'What reflection of that can you see every night that is mindblowing to outsiders?' },
  { label: 'Good public infrastructure', summary: 'The city is well preserved and maintained; streets are clean, transit works, public buildings are functional.', seed: 'What public structure is the most famous for how well it works?' },
  { label: 'Security and low crime rate', summary: 'Life is much less dangerous here than elsewhere; outsiders are shocked at how easily you can walk the streets at night.', seed: 'What public safety measures allow this?' },
  { label: 'Exotic nature or geology', summary: 'The natural environments within or surrounding the city are unlike anything else; they shape its identity and tourism.', seed: 'What are these natural features?' },
]

export const CITY_UGLY_SIDES: readonly CityIdea[] = [
  { label: 'Abandoned industry', summary: 'The industry that once sustained the city collapsed; a large portion is crumbling and crime grows in the emptied areas.', seed: 'What new industry is being attempted here?' },
  { label: 'Tourism inversion', summary: 'Tourism has consumed the economy; residents can’t afford to eat or rent where they live, and authenticity lies elsewhere.', seed: 'What “traditional” experience do tourists seek the most here?' },
  { label: 'Surveillance state', summary: 'Privacy has been gutted, allegedly for security; no message transmitted here is actually secret and self-censorship is the norm.', seed: 'What device, platform, or medium do people use to communicate secretly?' },
  { label: 'Sprawl', summary: 'The city is too big for its own good; everything is far away, commutes are enormous, and transportation is expensive.', seed: 'What service do app drivers usually offer on the side to please their clients?' },
  { label: 'Bad water and sewage', summary: 'You can’t drink the tap water; gutters overflow in strong rains and any body of water near a populated neighborhood smells like a sewer.', seed: 'What body of water do you know that actually smells fine?' },
  { label: 'Total privatization', summary: 'Every public service has been sold off; better alternatives exist only for those who can pay.', seed: 'Which privatized service causes the most daily frustration?' },
  { label: 'Air pollution', summary: 'Breathing here is bad for your health; streets smell of exhaust, smog is frequent, and nights are brighter from reflected street lights.', seed: 'What do residents usually do to protect themselves?' },
  { label: 'Gang territory', summary: 'Much of the city is divided into territories controlled by heavily armed gangs; residents know which streets belong to whom.', seed: 'What do they trade in? Game? Vice? Illegal media?' },
  { label: 'Crime lord government', summary: 'The city’s politics are decided by organized crime families, out in the open; opponents are dealt with brutally and publicly.', seed: 'What horrendous method of execution is applied to enemies and traitors?' },
  { label: 'Pest plague', summary: 'The city is plagued by one or more animal species that are never properly dealt with and always return.', seed: 'What animal is it?' },
]

export function rollCityIdea(list: readonly CityIdea[]): CityIdea {
  return list[rollDie(10) - 1]
}
