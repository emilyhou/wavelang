import type { Startup } from '../game/types'

/**
 * The clue vocabulary: AI companies everyone in the room is likely to recognise.
 *
 * This is the ~120-name starter list; the plan is to grow it toward 500. Rules
 * of thumb for adding: it has to be nameable at a party without explanation,
 * and it has to be *placeable* on a spectrum — a company nobody has an opinion
 * about makes a terrible clue.
 *
 * `domain` drives the logo lookup (see StartupLogo). `aliases` catch the other
 * things people type: old names, nicknames, the product instead of the company.
 */
export const STARTUPS: Startup[] = [
  // Frontier labs
  { name: 'OpenAI', domain: 'openai.com', aliases: ['ChatGPT', 'GPT'] },
  { name: 'Anthropic', domain: 'anthropic.com', aliases: ['Claude'] },
  { name: 'Google DeepMind', domain: 'deepmind.google', aliases: ['DeepMind', 'Gemini'] },
  { name: 'xAI', domain: 'x.ai', aliases: ['Grok'] },
  { name: 'Meta AI', domain: 'ai.meta.com', aliases: ['Llama', 'FAIR'] },
  { name: 'Mistral AI', domain: 'mistral.ai', aliases: ['Le Chat'] },
  { name: 'Cohere', domain: 'cohere.com' },
  { name: 'AI21 Labs', domain: 'ai21.com', aliases: ['Jurassic'] },
  { name: 'Reka AI', domain: 'reka.ai' },
  { name: 'Aleph Alpha', domain: 'aleph-alpha.com' },
  { name: 'Safe Superintelligence', domain: 'ssi.inc', aliases: ['SSI', 'Ilya'] },
  { name: 'Thinking Machines Lab', domain: 'thinkingmachines.ai', aliases: ['Mira Murati'] },
  { name: 'Reflection AI', domain: 'reflection.ai' },
  { name: 'Inflection AI', domain: 'inflection.ai', aliases: ['Pi'] },
  { name: 'Imbue', domain: 'imbue.com', aliases: ['Generally Intelligent'] },
  { name: 'Adept AI', domain: 'adept.ai', aliases: ['ACT-1'] },
  { name: 'Character.AI', domain: 'character.ai', aliases: ['c.ai'] },
  { name: 'World Labs', domain: 'worldlabs.ai', aliases: ['Fei-Fei Li'] },
  { name: 'EleutherAI', domain: 'eleuther.ai', aliases: ['GPT-Neo'] },
  { name: 'Nous Research', domain: 'nousresearch.com', aliases: ['Hermes'] },

  // China / rest of world
  { name: 'DeepSeek', domain: 'deepseek.com', aliases: ['R1'] },
  { name: 'Moonshot AI', domain: 'moonshot.cn', aliases: ['Kimi'] },
  { name: 'Zhipu AI', domain: 'zhipuai.cn', aliases: ['GLM'] },
  { name: 'MiniMax', domain: 'minimax.io', aliases: ['Hailuo'] },
  { name: '01.AI', domain: '01.ai', aliases: ['Yi', 'Kai-Fu Lee'] },
  { name: 'Baichuan AI', domain: 'baichuan-ai.com' },
  { name: 'Sakana AI', domain: 'sakana.ai' },

  // Products people actually open
  { name: 'Perplexity', domain: 'perplexity.ai', aliases: ['Comet'] },
  { name: 'You.com', domain: 'you.com' },
  { name: 'Phind', domain: 'phind.com' },
  { name: 'Elicit', domain: 'elicit.com' },
  { name: 'Hugging Face', domain: 'huggingface.co', aliases: ['HF'] },
  { name: 'Ollama', domain: 'ollama.com' },
  { name: 'Poe', domain: 'poe.com', aliases: ['Quora'] },

  // Coding
  { name: 'Cursor', domain: 'cursor.com', aliases: ['Anysphere'] },
  { name: 'Windsurf', domain: 'windsurf.com', aliases: ['Codeium'] },
  { name: 'Cognition', domain: 'cognition.ai', aliases: ['Devin'] },
  { name: 'Replit', domain: 'replit.com', aliases: ['Replit Agent'] },
  { name: 'Lovable', domain: 'lovable.dev', aliases: ['GPT Engineer'] },
  { name: 'Bolt.new', domain: 'bolt.new', aliases: ['StackBlitz'] },
  { name: 'Vercel', domain: 'vercel.com', aliases: ['v0', 'Next.js'] },
  { name: 'Magic', domain: 'magic.dev' },
  { name: 'Poolside', domain: 'poolside.ai' },
  { name: 'Augment Code', domain: 'augmentcode.com' },
  { name: 'Sourcegraph', domain: 'sourcegraph.com', aliases: ['Cody', 'Amp'] },
  { name: 'Tabnine', domain: 'tabnine.com' },
  { name: 'Warp', domain: 'warp.dev' },
  { name: 'All Hands AI', domain: 'all-hands.dev', aliases: ['OpenHands', 'OpenDevin'] },

  // Compute, inference, serving
  { name: 'Groq', domain: 'groq.com', aliases: ['LPU'] },
  { name: 'Cerebras', domain: 'cerebras.net', aliases: ['wafer scale'] },
  { name: 'SambaNova', domain: 'sambanova.ai' },
  { name: 'CoreWeave', domain: 'coreweave.com' },
  { name: 'Lambda', domain: 'lambdalabs.com', aliases: ['Lambda Labs'] },
  { name: 'Together AI', domain: 'together.ai' },
  { name: 'Fireworks AI', domain: 'fireworks.ai' },
  { name: 'Baseten', domain: 'baseten.co' },
  { name: 'Replicate', domain: 'replicate.com' },
  { name: 'Modal', domain: 'modal.com' },
  { name: 'Anyscale', domain: 'anyscale.com', aliases: ['Ray'] },
  { name: 'Modular', domain: 'modular.com', aliases: ['Mojo'] },
  { name: 'Etched', domain: 'etched.com', aliases: ['Sohu'] },

  // Data, evals, orchestration
  { name: 'Databricks', domain: 'databricks.com', aliases: ['MosaicML'] },
  { name: 'Scale AI', domain: 'scale.com' },
  { name: 'Surge AI', domain: 'surgehq.ai' },
  { name: 'Mercor', domain: 'mercor.com' },
  { name: 'Labelbox', domain: 'labelbox.com' },
  { name: 'Snorkel AI', domain: 'snorkel.ai' },
  { name: 'LangChain', domain: 'langchain.com', aliases: ['LangSmith', 'LangGraph'] },
  { name: 'LlamaIndex', domain: 'llamaindex.ai' },
  { name: 'Braintrust', domain: 'braintrust.dev' },
  { name: 'Langfuse', domain: 'langfuse.com' },
  { name: 'Arize AI', domain: 'arize.com', aliases: ['Phoenix'] },
  { name: 'Weights & Biases', domain: 'wandb.ai', aliases: ['wandb', 'W&B'] },
  { name: 'Pinecone', domain: 'pinecone.io' },
  { name: 'Weaviate', domain: 'weaviate.io' },
  { name: 'Chroma', domain: 'trychroma.com' },
  { name: 'LanceDB', domain: 'lancedb.com' },
  { name: 'Supabase', domain: 'supabase.com' },

  // Image, video, audio, music
  { name: 'Midjourney', domain: 'midjourney.com' },
  { name: 'Stability AI', domain: 'stability.ai', aliases: ['Stable Diffusion'] },
  { name: 'Black Forest Labs', domain: 'blackforestlabs.ai', aliases: ['Flux'] },
  { name: 'Ideogram', domain: 'ideogram.ai' },
  { name: 'Leonardo AI', domain: 'leonardo.ai' },
  { name: 'Runway', domain: 'runwayml.com', aliases: ['Gen-3'] },
  { name: 'Luma AI', domain: 'lumalabs.ai', aliases: ['Dream Machine'] },
  { name: 'Pika', domain: 'pika.art' },
  { name: 'HeyGen', domain: 'heygen.com' },
  { name: 'Synthesia', domain: 'synthesia.io' },
  { name: 'Captions', domain: 'captions.ai' },
  { name: 'Photoroom', domain: 'photoroom.com' },
  { name: 'Descript', domain: 'descript.com' },
  { name: 'ElevenLabs', domain: 'elevenlabs.io', aliases: ['11 Labs'] },
  { name: 'Suno', domain: 'suno.com' },
  { name: 'Udio', domain: 'udio.com' },
  { name: 'Cartesia', domain: 'cartesia.ai', aliases: ['Sonic'] },
  { name: 'Deepgram', domain: 'deepgram.com' },
  { name: 'AssemblyAI', domain: 'assemblyai.com' },

  // Voice agents & support
  { name: 'Sierra', domain: 'sierra.ai', aliases: ['Bret Taylor'] },
  { name: 'Decagon', domain: 'decagon.ai' },
  { name: 'Cresta', domain: 'cresta.com' },
  { name: 'Parloa', domain: 'parloa.com' },
  { name: 'Vapi', domain: 'vapi.ai' },
  { name: 'Retell AI', domain: 'retellai.com' },
  { name: 'Bland AI', domain: 'bland.ai' },
  { name: 'Intercom', domain: 'intercom.com', aliases: ['Fin'] },
  { name: '11x', domain: '11x.ai' },

  // Vertical AI
  { name: 'Harvey', domain: 'harvey.ai' },
  { name: 'Legora', domain: 'legora.com' },
  { name: 'EvenUp', domain: 'evenuplaw.com' },
  { name: 'Abridge', domain: 'abridge.com' },
  { name: 'Ambience Healthcare', domain: 'ambiencehealthcare.com' },
  { name: 'OpenEvidence', domain: 'openevidence.com' },
  { name: 'Hippocratic AI', domain: 'hippocraticai.com' },
  { name: 'Nabla', domain: 'nabla.com' },
  { name: 'Glean', domain: 'glean.com' },
  { name: 'Clay', domain: 'clay.com' },

  // Robotics, autonomy, defense
  { name: 'Figure', domain: 'figure.ai' },
  { name: '1X', domain: '1x.tech', aliases: ['Neo'] },
  { name: 'Physical Intelligence', domain: 'physicalintelligence.company', aliases: ['Pi Zero'] },
  { name: 'Skild AI', domain: 'skild.ai' },
  { name: 'Covariant', domain: 'covariant.ai' },
  { name: 'Waymo', domain: 'waymo.com' },
  { name: 'Wayve', domain: 'wayve.ai' },
  { name: 'Nuro', domain: 'nuro.ai' },
  { name: 'Zoox', domain: 'zoox.com' },
  { name: 'Anduril', domain: 'anduril.com', aliases: ['Lattice'] },
  { name: 'Applied Intuition', domain: 'appliedintuition.com' },

  // Bio & science
  { name: 'Isomorphic Labs', domain: 'isomorphiclabs.com', aliases: ['AlphaFold'] },
  { name: 'EvolutionaryScale', domain: 'evolutionaryscale.ai', aliases: ['ESM3'] },
  { name: 'Chai Discovery', domain: 'chaidiscovery.com' },
  { name: 'Recursion', domain: 'recursion.com' },
  { name: 'Insilico Medicine', domain: 'insilico.com' },
  { name: 'Cradle', domain: 'cradle.bio' },

  // Work tools that went all-in on AI
  { name: 'Notion', domain: 'notion.com' },
  { name: 'Linear', domain: 'linear.app' },
  { name: 'Figma', domain: 'figma.com' },
  { name: 'Granola', domain: 'granola.ai' },
  { name: 'Limitless', domain: 'limitless.ai', aliases: ['Rewind'] },
  { name: 'Otter.ai', domain: 'otter.ai' },
  { name: 'Fireflies.ai', domain: 'fireflies.ai' },
  { name: 'Gamma', domain: 'gamma.app' },
  { name: 'Raycast', domain: 'raycast.com' },
  { name: 'The Browser Company', domain: 'thebrowser.company', aliases: ['Arc', 'Dia'] },
  { name: 'Sana', domain: 'sana.ai' },
  { name: 'Hex', domain: 'hex.tech' },
  { name: 'Retool', domain: 'retool.com' },

  // Fintech & ops darlings in the same orbit
  { name: 'Ramp', domain: 'ramp.com' },
  { name: 'Mercury', domain: 'mercury.com' },
  { name: 'Brex', domain: 'brex.com' },
  { name: 'Rippling', domain: 'rippling.com' },
  { name: 'Deel', domain: 'deel.com' },
  { name: 'Vanta', domain: 'vanta.com' },

  // Consumer AI, for better or worse
  { name: 'Humane', domain: 'humane.com', aliases: ['Ai Pin'] },
  { name: 'Rabbit', domain: 'rabbit.tech', aliases: ['R1'] },
  { name: 'Friend', domain: 'friend.com' },
  { name: 'Cluely', domain: 'cluely.com' },
  { name: 'Sesame', domain: 'sesame.com', aliases: ['Maya'] },
  { name: 'Tolan', domain: 'portola.com', aliases: ['Portola'] },
]

/** Longest-name-first so the picker's ranking is stable across ties. */
const SEARCHABLE = STARTUPS.map((startup) => ({
  startup,
  haystack: [startup.name, ...(startup.aliases ?? [])].map((s) => s.toLowerCase()),
}))

const normalize = (s: string) => s.toLowerCase().replace(/[.\s-]/g, '')

/**
 * Autocomplete search.
 *
 * Ranking is deliberately simple: name-prefix matches come first (typing "per"
 * should surface Perplexity before anything that merely contains "per"), then
 * alias-prefix, then substring anywhere. Punctuation and spaces are ignored so
 * "11labs", "elevenlabs" and "eleven labs" all land on ElevenLabs.
 */
export function searchStartups(query: string, limit = 8): Startup[] {
  const q = normalize(query)
  if (q.length === 0) return []

  const scored: Array<{ startup: Startup; rank: number }> = []
  for (const { startup, haystack } of SEARCHABLE) {
    const [name, ...aliases] = haystack
    let rank = Infinity

    if (normalize(name).startsWith(q)) rank = 0
    else if (aliases.some((a) => normalize(a).startsWith(q))) rank = 1
    else if (normalize(name).includes(q)) rank = 2
    else if (aliases.some((a) => normalize(a).includes(q))) rank = 3

    if (rank !== Infinity) scored.push({ startup, rank })
  }

  scored.sort((a, b) => a.rank - b.rank || a.startup.name.localeCompare(b.startup.name))
  return scored.slice(0, limit).map((s) => s.startup)
}

const BY_NAME = new Map(STARTUPS.map((s) => [s.name.toLowerCase(), s]))

export const getStartup = (name: string | null): Startup | null =>
  (name && BY_NAME.get(name.toLowerCase())) || null
