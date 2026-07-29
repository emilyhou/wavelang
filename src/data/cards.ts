import type { SpectrumCard } from '../game/types'

/**
 * Seed deck of spectrum cards, AI-industry flavoured.
 *
 * House rules borrowed from Wavelength: each card is two poles of ONE axis, not
 * two unrelated opposites, and the axis has to be arguable — if everyone would
 * place a given startup in the same spot, the card is dead. Cards where you can
 * picture people fighting about the middle are the good ones.
 */
export const CARDS: SpectrumCard[] = [
  { id: 'vaporware', left: 'Vaporware', right: 'Actually ships' },
  { id: 'wrapper', left: 'Thin wrapper', right: 'Real moat' },
  { id: 'doomer', left: 'Doomer', right: 'Accelerationist' },
  { id: 'lab', left: 'Research lab', right: 'Sales org' },
  { id: 'weights', left: 'Open weights', right: 'Locked down' },
  { id: 'hype', left: 'Overhyped', right: 'Underrated' },
  { id: 'demo', left: 'Demo magic', right: 'Production ready' },
  { id: 'toy', left: 'Toy', right: 'Infrastructure' },
  { id: 'retention', left: 'Signed up once', right: 'Use it daily' },
  { id: 'burn', left: 'Ramen profitable', right: 'Incinerating cash' },
  { id: 'enterprise', left: 'Prosumer', right: 'Enterprise sales motion' },
  { id: 'twitter', left: 'Never posts', right: 'Terminally online' },
  { id: 'moat2', left: 'Anyone could build this', right: 'Nobody could build this' },
  { id: 'boring', left: 'Boring but works', right: 'Exciting but broken' },
  { id: 'acquire', left: 'Acqui-hire bait', right: 'Generational company' },
  { id: 'ux', left: 'Command line energy', right: 'Designed to death' },
  { id: 'agents', left: 'Just a chatbot', right: 'Fully agentic' },
  { id: 'benchmark', left: 'Benchmaxxed', right: 'Vibes-based' },
  { id: 'compute', left: 'Runs on a laptop', right: 'Needs a datacenter' },
  { id: 'safety', left: 'Move fast', right: 'Red team everything' },
  { id: 'founder', left: 'Ex-PhD founders', right: 'Ex-growth-hacker founders' },
  { id: 'naming', left: 'Greek mythology name', right: 'Lowercase vibes name' },
  { id: 'pricing', left: 'Free forever', right: '"Contact sales"', },
  { id: 'devtool', left: 'Built for developers', right: 'Built for your mom' },
  { id: 'valuation', left: 'Fairly valued', right: 'Priced for perfection' },
  { id: 'moatdata', left: 'Model is the product', right: 'Data is the product' },
  { id: 'meme', left: 'Serious business', right: 'Runs on memes' },
  { id: 'incumbent', left: 'Google could kill it tomorrow', right: 'Google should be scared' },
  { id: 'humanloop', left: 'Fully automated', right: 'Humans in a call center' },
  { id: 'longevity', left: 'Dead in two years', right: 'Around in twenty' },
  { id: 'yc', left: 'Would get into YC', right: 'Would get rejected from YC' },
  { id: 'explain', left: 'Explains itself in five words', right: 'Needs a whitepaper' },
]

export const CARD_IDS: string[] = CARDS.map((c) => c.id)

const CARDS_BY_ID = new Map(CARDS.map((c) => [c.id, c]))

export const getCard = (id: string | null): SpectrumCard | null =>
  (id && CARDS_BY_ID.get(id)) || null
