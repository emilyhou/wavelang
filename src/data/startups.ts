import type { Startup } from '../game/types'

/**
 * The clue vocabulary: AI companies everyone in the room is likely to recognise.
 *
 * ~360 names, heading toward 500. Rules of thumb for adding: it has to be
 * nameable at a party without explanation, and it has to be *placeable* on a
 * spectrum — a company nobody has an opinion about makes a terrible clue.
 *
 * `domain` drives the logo lookup (see StartupLogo). `aliases` catch the other
 * things people type: old names, nicknames, the product instead of the company.
 *
 * Every domain here resolves in DNS — that's checked by hand when adding, since
 * a dead domain silently degrades to the letter-tile fallback. Two entries have
 * already needed it: Humane moved to humane.ai after the HP acquisition, and
 * Play.ht became PlayAI.
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
  { name: 'Humane', domain: 'humane.ai', aliases: ['Ai Pin'] },
  { name: 'Rabbit', domain: 'rabbit.tech', aliases: ['R1'] },
  { name: 'Friend', domain: 'friend.com' },
  { name: 'Cluely', domain: 'cluely.com' },
  { name: 'Sesame', domain: 'sesame.com', aliases: ['Maya'] },
  { name: 'Tolan', domain: 'portola.com', aliases: ['Portola'] },

  // More labs & model providers
  { name: 'Liquid AI', domain: 'liquid.ai', aliases: ['LFM'] },
  { name: 'Contextual AI', domain: 'contextual.ai' },
  { name: 'Arcee AI', domain: 'arcee.ai' },
  { name: 'Nomic AI', domain: 'nomic.ai', aliases: ['GPT4All'] },
  { name: 'Jina AI', domain: 'jina.ai' },
  { name: 'Voyage AI', domain: 'voyageai.com' },
  { name: 'Allen Institute for AI', domain: 'allenai.org', aliases: ['AI2', 'OLMo'] },
  { name: 'Hume AI', domain: 'hume.ai' },
  { name: 'Luma Labs', domain: 'lumalabs.ai', aliases: ['Ray'] },

  // Inference, GPUs, serving
  { name: 'RunPod', domain: 'runpod.io' },
  { name: 'Vast.ai', domain: 'vast.ai' },
  { name: 'Crusoe', domain: 'crusoe.ai' },
  { name: 'Nebius', domain: 'nebius.com' },
  { name: 'SF Compute', domain: 'sfcompute.com' },
  { name: 'Predibase', domain: 'predibase.com' },
  { name: 'OctoAI', domain: 'octo.ai' },
  { name: 'Lamini', domain: 'lamini.ai' },
  { name: 'Unsloth', domain: 'unsloth.ai' },
  { name: 'Tenstorrent', domain: 'tenstorrent.com' },
  { name: 'Rain AI', domain: 'rain.ai' },
  { name: 'Lightmatter', domain: 'lightmatter.co' },
  { name: 'Celestial AI', domain: 'celestial.ai' },
  { name: 'd-Matrix', domain: 'd-matrix.ai' },
  { name: 'Hailo', domain: 'hailo.ai' },
  { name: 'Axelera AI', domain: 'axelera.ai' },
  { name: 'FuriosaAI', domain: 'furiosa.ai' },
  { name: 'SiMa.ai', domain: 'sima.ai' },
  { name: 'Extropic', domain: 'extropic.ai' },
  { name: 'Normal Computing', domain: 'normalcomputing.ai' },
  { name: 'PsiQuantum', domain: 'psiquantum.com' },

  // Agent infrastructure & tooling
  { name: 'CrewAI', domain: 'crewai.com' },
  { name: 'Mastra', domain: 'mastra.ai' },
  { name: 'deepset', domain: 'deepset.ai', aliases: ['Haystack'] },
  { name: 'Composio', domain: 'composio.dev' },
  { name: 'Arcade', domain: 'arcade.dev' },
  { name: 'E2B', domain: 'e2b.dev' },
  { name: 'Daytona', domain: 'daytona.io' },
  { name: 'Browserbase', domain: 'browserbase.com' },
  { name: 'Browser Use', domain: 'browser-use.com' },
  { name: 'Firecrawl', domain: 'firecrawl.dev' },
  { name: 'Apify', domain: 'apify.com' },
  { name: 'Exa', domain: 'exa.ai', aliases: ['Metaphor'] },
  { name: 'Tavily', domain: 'tavily.com' },
  { name: 'Bright Data', domain: 'brightdata.com' },
  { name: 'MultiOn', domain: 'multion.ai' },
  { name: 'Lindy', domain: 'lindy.ai' },
  { name: 'Dust', domain: 'dust.tt' },
  { name: 'Relevance AI', domain: 'relevanceai.com' },
  { name: 'Zapier', domain: 'zapier.com' },
  { name: 'Make', domain: 'make.com', aliases: ['Integromat'] },
  { name: 'n8n', domain: 'n8n.io' },

  // Evals, observability, guardrails
  { name: 'Galileo', domain: 'galileo.ai' },
  { name: 'Patronus AI', domain: 'patronus.ai' },
  { name: 'Comet ML', domain: 'comet.com', aliases: ['Opik'] },
  { name: 'Neptune.ai', domain: 'neptune.ai' },
  { name: 'Lakera', domain: 'lakera.ai' },
  { name: 'HiddenLayer', domain: 'hiddenlayer.com' },
  { name: 'Protect AI', domain: 'protectai.com' },
  { name: 'Robust Intelligence', domain: 'robustintelligence.com' },

  // Vectors, databases, data stack
  { name: 'Qdrant', domain: 'qdrant.tech' },
  { name: 'Zilliz', domain: 'zilliz.com', aliases: ['Milvus'] },
  { name: 'Vespa', domain: 'vespa.ai' },
  { name: 'Turbopuffer', domain: 'turbopuffer.com' },
  { name: 'Neon', domain: 'neon.tech' },
  { name: 'PlanetScale', domain: 'planetscale.com' },
  { name: 'ClickHouse', domain: 'clickhouse.com' },
  { name: 'MotherDuck', domain: 'motherduck.com', aliases: ['DuckDB'] },
  { name: 'Tinybird', domain: 'tinybird.co' },
  { name: 'dbt Labs', domain: 'getdbt.com', aliases: ['dbt'] },
  { name: 'Fivetran', domain: 'fivetran.com' },
  { name: 'Airbyte', domain: 'airbyte.com' },
  { name: 'Dagster', domain: 'dagster.io' },
  { name: 'Astronomer', domain: 'astronomer.io', aliases: ['Airflow'] },
  { name: 'Confluent', domain: 'confluent.io', aliases: ['Kafka'] },
  { name: 'Hightouch', domain: 'hightouch.com' },
  { name: 'Sigma Computing', domain: 'sigmacomputing.com' },
  { name: 'Monte Carlo', domain: 'montecarlodata.com' },
  { name: 'Atlan', domain: 'atlan.com' },
  { name: 'Redis', domain: 'redis.io' },
  { name: 'MongoDB', domain: 'mongodb.com' },

  // Coding, more
  { name: 'Continue', domain: 'continue.dev' },
  { name: 'Aider', domain: 'aider.chat' },
  { name: 'Cline', domain: 'cline.bot' },
  { name: 'Zed', domain: 'zed.dev' },
  { name: 'Qodo', domain: 'qodo.ai', aliases: ['CodiumAI'] },
  { name: 'CodeRabbit', domain: 'coderabbit.ai' },
  { name: 'Greptile', domain: 'greptile.com' },
  { name: 'Graphite', domain: 'graphite.dev' },
  { name: 'Codegen', domain: 'codegen.com' },
  { name: 'Factory', domain: 'factory.ai', aliases: ['Droids'] },
  { name: 'Tessl', domain: 'tessl.io' },
  { name: 'Base44', domain: 'base44.com' },
  { name: 'Bubble', domain: 'bubble.io' },
  { name: 'Webflow', domain: 'webflow.com' },
  { name: 'Framer', domain: 'framer.com' },
  { name: 'Pydantic', domain: 'pydantic.dev' },

  // Writing & marketing
  { name: 'Jasper', domain: 'jasper.ai' },
  { name: 'Writer', domain: 'writer.com' },
  { name: 'Copy.ai', domain: 'copy.ai' },
  { name: 'Typeface', domain: 'typeface.ai' },
  { name: 'Sudowrite', domain: 'sudowrite.com' },
  { name: 'Tome', domain: 'tome.app' },
  { name: 'Coda', domain: 'coda.io' },
  { name: 'Mem', domain: 'mem.ai' },
  { name: 'Guru', domain: 'getguru.com' },

  // Creative tools
  { name: 'Canva', domain: 'canva.com' },
  { name: 'Krea', domain: 'krea.ai' },
  { name: 'Recraft', domain: 'recraft.ai' },
  { name: 'Playground AI', domain: 'playground.com' },
  { name: 'Freepik', domain: 'freepik.com' },
  { name: 'Magnific', domain: 'magnific.ai' },
  { name: 'Topaz Labs', domain: 'topazlabs.com' },
  { name: 'Vizcom', domain: 'vizcom.ai' },
  { name: 'Spline', domain: 'spline.design' },
  { name: 'Genmo', domain: 'genmo.ai', aliases: ['Mochi'] },
  { name: 'Haiper', domain: 'haiper.ai' },
  { name: 'Moonvalley', domain: 'moonvalley.com' },
  { name: 'Higgsfield', domain: 'higgsfield.ai' },
  { name: 'Opus Clip', domain: 'opus.pro' },

  // Speech & audio, more
  { name: 'Speechmatics', domain: 'speechmatics.com' },
  { name: 'Gladia', domain: 'gladia.io' },
  { name: 'Rime', domain: 'rime.ai' },
  { name: 'Resemble AI', domain: 'resemble.ai' },
  { name: 'PlayAI', domain: 'playht.com', aliases: ['Play.ht'] },
  { name: 'WellSaid Labs', domain: 'wellsaidlabs.com' },
  { name: 'Murf AI', domain: 'murf.ai' },
  { name: 'Speechify', domain: 'speechify.com' },
  { name: 'Krisp', domain: 'krisp.ai' },
  { name: 'Rev', domain: 'rev.com' },

  // Meetings & knowledge work
  { name: 'Read AI', domain: 'read.ai' },
  { name: 'Circleback', domain: 'circleback.ai' },
  { name: 'Fathom', domain: 'fathom.video' },
  { name: 'Hebbia', domain: 'hebbia.com' },
  { name: 'Rogo', domain: 'rogodata.com' },
  { name: 'AlphaSense', domain: 'alpha-sense.com' },
  { name: 'Consensus', domain: 'consensus.app' },

  // Support & go-to-market
  { name: 'Lorikeet', domain: 'lorikeetcx.ai' },
  { name: 'Pylon', domain: 'usepylon.com' },
  { name: 'Maven AGI', domain: 'mavenagi.com' },
  { name: 'Forethought', domain: 'forethought.ai' },
  { name: 'Ada', domain: 'ada.cx' },
  { name: 'Apollo.io', domain: 'apollo.io' },
  { name: 'Outreach', domain: 'outreach.io' },
  { name: 'Gong', domain: 'gong.io' },
  { name: 'Attention', domain: 'attention.com' },
  { name: 'Nooks', domain: 'nooks.ai' },
  { name: 'Unify', domain: 'unifygtm.com' },

  // Fintech & back office
  { name: 'Persona', domain: 'withpersona.com' },
  { name: 'Alloy', domain: 'alloy.com' },
  { name: 'Pilot', domain: 'pilot.com' },
  { name: 'Digits', domain: 'digits.com' },
  { name: 'Sardine', domain: 'sardine.ai' },
  { name: 'Drata', domain: 'drata.com' },
  { name: 'Delve', domain: 'delve.co' },

  // Legal
  { name: 'Spellbook', domain: 'spellbook.legal' },
  { name: 'Luminance', domain: 'luminance.com' },
  { name: 'Robin AI', domain: 'robinai.com' },
  { name: 'Ironclad', domain: 'ironcladapp.com' },
  { name: 'Clio', domain: 'clio.com' },
  { name: 'Eve', domain: 'eve.legal' },

  // Healthcare, more
  { name: 'Suki', domain: 'suki.ai' },
  { name: 'Corti', domain: 'corti.ai' },
  { name: 'DeepScribe', domain: 'deepscribe.ai' },
  { name: 'Freed', domain: 'getfreed.ai' },
  { name: 'Heidi Health', domain: 'heidihealth.com' },
  { name: 'Commure', domain: 'commure.com' },
  { name: 'Tennr', domain: 'tennr.com' },
  { name: 'Anterior', domain: 'anterior.com' },
  { name: 'Cohere Health', domain: 'coherehealth.com' },

  // Bio & science, more
  { name: 'Xaira Therapeutics', domain: 'xaira.com' },
  { name: 'Generate Biomedicines', domain: 'generatebiomedicines.com' },
  { name: 'Profluent', domain: 'profluent.bio' },
  { name: 'Arc Institute', domain: 'arcinstitute.org' },

  // Security
  { name: 'Wiz', domain: 'wiz.io' },
  { name: 'Snyk', domain: 'snyk.io' },
  { name: 'Abnormal Security', domain: 'abnormal.ai' },
  { name: 'Chainguard', domain: 'chainguard.dev' },
  { name: 'Semgrep', domain: 'semgrep.dev' },
  { name: 'Socket', domain: 'socket.dev' },
  { name: 'Dropzone AI', domain: 'dropzone.ai' },

  // Robotics, more
  { name: 'Apptronik', domain: 'apptronik.com' },
  { name: 'Agility Robotics', domain: 'agilityrobotics.com', aliases: ['Digit'] },
  { name: 'Sanctuary AI', domain: 'sanctuary.ai' },
  { name: 'Unitree', domain: 'unitree.com' },
  { name: 'Boston Dynamics', domain: 'bostondynamics.com', aliases: ['Spot', 'Atlas'] },
  { name: 'Dexterity', domain: 'dexterity.ai' },

  // Autonomy & defense, more
  { name: 'Shield AI', domain: 'shield.ai' },
  { name: 'Saronic', domain: 'saronic.com' },
  { name: 'Hadrian', domain: 'hadrian.co' },
  { name: 'Helsing', domain: 'helsing.ai' },
  { name: 'Skydio', domain: 'skydio.com' },
  { name: 'Zipline', domain: 'flyzipline.com' },
  { name: 'Aurora', domain: 'aurora.tech' },
  { name: 'Kodiak Robotics', domain: 'kodiak.ai' },
  { name: 'Gatik', domain: 'gatik.ai' },
  { name: 'Motional', domain: 'motional.com' },
  { name: 'Pony.ai', domain: 'pony.ai' },
  { name: 'WeRide', domain: 'weride.ai' },

  // Consumer & education
  { name: 'Replika', domain: 'replika.com' },
  { name: 'Duolingo', domain: 'duolingo.com' },
  { name: 'Speak', domain: 'speak.com' },
  { name: 'Khan Academy', domain: 'khanacademy.org', aliases: ['Khanmigo'] },
  { name: 'MagicSchool AI', domain: 'magicschool.ai' },
  { name: 'Delphi', domain: 'delphi.ai' },
  { name: 'Eight Sleep', domain: 'eightsleep.com' },
]

/** Strips punctuation and spaces so "11 labs", "11labs" and "11-labs" agree. */
const normalize = (s: string) => s.toLowerCase().replace(/[.\s\-&]/g, '')

/** Splits on word boundaries, including the camelCase humps in "ElevenLabs". */
function words(s: string): string[] {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[\s\-.&/]+/)
    .map(normalize)
    .filter(Boolean)
}

interface Searchable {
  startup: Startup
  nameNorm: string
  nameWords: string[]
  aliasNorms: string[]
  aliasWords: string[]
}

const SEARCHABLE: Searchable[] = STARTUPS.map((startup) => {
  const aliases = startup.aliases ?? []
  return {
    startup,
    nameNorm: normalize(startup.name),
    nameWords: words(startup.name),
    aliasNorms: aliases.map(normalize),
    aliasWords: aliases.flatMap(words),
  }
})

/** Lower is better. Kept as named constants because the ordering *is* the UX. */
const RANK = {
  namePrefix: 0,
  nameWordPrefix: 1,
  aliasPrefix: 2,
  nameSubstring: 3,
  aliasSubstring: 4,
} as const

/**
 * Autocomplete search, ranked the way people expect a search box to behave.
 *
 * Word-start matches beat mid-word ones. Typing "ra" should offer Ramp, Rabbit
 * and Rain AI — not Auro*ra* or Anysc*a*le, which merely contain the letters.
 * That distinction didn't matter at 150 names; past 350 it's the difference
 * between a usable picker and a bag of noise. Mid-word substrings still match,
 * but only to fill slots the better tiers left empty.
 *
 * Punctuation and spacing are ignored throughout, so "11labs", "eleven labs"
 * and "ElevenLabs" all land on the same company.
 */
export function searchStartups(query: string, limit = 8): Startup[] {
  const q = normalize(query)
  if (q.length === 0) return []

  const scored: Array<{ startup: Startup; rank: number }> = []

  for (const entry of SEARCHABLE) {
    let rank: number | null = null

    if (entry.nameNorm.startsWith(q)) rank = RANK.namePrefix
    else if (entry.nameWords.some((w) => w.startsWith(q))) rank = RANK.nameWordPrefix
    else if (
      entry.aliasNorms.some((a) => a.startsWith(q)) ||
      entry.aliasWords.some((w) => w.startsWith(q))
    ) {
      rank = RANK.aliasPrefix
    } else if (entry.nameNorm.includes(q)) rank = RANK.nameSubstring
    else if (entry.aliasNorms.some((a) => a.includes(q))) rank = RANK.aliasSubstring

    if (rank !== null) scored.push({ startup: entry.startup, rank })
  }

  // Alphabetical within a tier: arbitrary, but stable, so the list doesn't
  // reshuffle under the user's finger as they type.
  scored.sort((a, b) => a.rank - b.rank || a.startup.name.localeCompare(b.startup.name))
  return scored.slice(0, limit).map((s) => s.startup)
}

const BY_NAME = new Map(STARTUPS.map((s) => [s.name.toLowerCase(), s]))

export const getStartup = (name: string | null): Startup | null =>
  (name && BY_NAME.get(name.toLowerCase())) || null
