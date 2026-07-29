import { describe, expect, it } from 'vitest'
import { CARDS, CARD_IDS, getCard } from './cards'
import { STARTUPS, getStartup, searchStartups } from './startups'

describe('cards', () => {
  it('has unique ids', () => {
    expect(new Set(CARD_IDS).size).toBe(CARDS.length)
  })

  it('gives every card two distinct, non-empty poles', () => {
    for (const card of CARDS) {
      expect(card.left.trim().length).toBeGreaterThan(0)
      expect(card.right.trim().length).toBeGreaterThan(0)
      expect(card.left).not.toBe(card.right)
    }
  })

  it('looks cards up by id', () => {
    expect(getCard(CARDS[0].id)).toEqual(CARDS[0])
    expect(getCard('nope')).toBeNull()
    expect(getCard(null)).toBeNull()
  })
})

describe('startups', () => {
  it('has no duplicate names', () => {
    const names = STARTUPS.map((s) => s.name.toLowerCase())
    expect(new Set(names).size).toBe(names.length)
  })

  it('gives every entry a plausible domain', () => {
    for (const startup of STARTUPS) {
      expect(startup.domain, startup.name).toMatch(/^[a-z0-9.-]+\.[a-z]{2,}$/)
    }
  })
})

describe('searchStartups', () => {
  it('returns nothing for an empty query', () => {
    expect(searchStartups('')).toEqual([])
    expect(searchStartups('   ')).toEqual([])
  })

  it('puts name-prefix matches first', () => {
    expect(searchStartups('per')[0].name).toBe('Perplexity')
    expect(searchStartups('ra')[0].name).toBe('Rabbit')
    expect(searchStartups('anth')[0].name).toBe('Anthropic')
  })

  it('is case insensitive', () => {
    expect(searchStartups('OPENAI')[0].name).toBe('OpenAI')
  })

  it('matches on aliases', () => {
    expect(searchStartups('claude').map((s) => s.name)).toContain('Anthropic')
    expect(searchStartups('devin').map((s) => s.name)).toContain('Cognition')
    expect(searchStartups('chatgpt').map((s) => s.name)).toContain('OpenAI')
  })

  it('ignores punctuation and spaces', () => {
    expect(searchStartups('elevenlabs')[0].name).toBe('ElevenLabs')
    expect(searchStartups('eleven labs')[0].name).toBe('ElevenLabs')
    expect(searchStartups('character ai')[0].name).toBe('Character.AI')
  })

  it('respects the result limit', () => {
    expect(searchStartups('a', 5)).toHaveLength(5)
    expect(searchStartups('a', 3)).toHaveLength(3)
  })

  it('returns nothing for gibberish', () => {
    expect(searchStartups('zzzzqqq')).toEqual([])
  })
})

describe('getStartup', () => {
  it('resolves a clue string back to the company', () => {
    expect(getStartup('anthropic')?.domain).toBe('anthropic.com')
    expect(getStartup('Not A Company')).toBeNull()
    expect(getStartup(null)).toBeNull()
  })
})
