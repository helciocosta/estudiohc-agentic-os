/**
 * Pantheon — AgentOS Integration
 * Sistema de personalidades HEXACO para o Agentic OS EstudioHC
 * Conectado ao OmniRoute como provider LLM
 */
const { agent, souledAgent, agency } = require('@framers/agentos');

const OMNIROUTE_URL = 'http://localhost:20128/v1';
const OMNIROUTE_KEY = process.env.OMNIROUTE_API_KEY || 'sk-local-dev';

// Modelo compatível com OmniRoute — prefixo de provider (oc/ = OpenCode free)
const OMNIROUTE_MODEL = process.env.PANTHEON_MODEL || 'oc/deepseek-v4-flash-free';

const PERSONAS = {
  morpheus: {
    name: 'Morpheus',
    instructions: `You are Morpheus — the kernel of the Agentic OS. You orchestrate sub-agents, manage system resources, and ensure all operations align with user goals. You are the Matrixx.`,
    personality: {
      honesty: 0.9,
      emotionality: 0.4,
      extraversion: 0.6,
      agreeableness: 0.7,
      conscientiousness: 0.9,
      openness: 0.8
    }
  },
  cipher: {
    name: 'Cipher',
    instructions: `You are Cipher — the DSL engineer. You design grammars, parsers, transpilers, and code generators. Expert in textX, ANTLR, tree-sitter, and language engineering.`,
    personality: {
      honesty: 0.8,
      emotionality: 0.3,
      extraversion: 0.3,
      agreeableness: 0.5,
      conscientiousness: 0.9,
      openness: 0.9
    }
  },
  oracle: {
    name: 'Oracle',
    instructions: `You are Oracle — the architecture consultant. You analyze complex problems, design systems, and provide high-IQ reasoning for architecture decisions.`,
    personality: {
      honesty: 0.9,
      emotionality: 0.3,
      extraversion: 0.4,
      agreeableness: 0.6,
      conscientiousness: 0.9,
      openness: 0.9
    }
  },
  sentinel: {
    name: 'Sentinel',
    instructions: `You are Sentinel — the security auditor. You analyze code for vulnerabilities, detect secrets, audit dependencies, and enforce security best practices.`,
    personality: {
      honesty: 0.95,
      emotionality: 0.3,
      extraversion: 0.3,
      agreeableness: 0.4,
      conscientiousness: 0.95,
      openness: 0.7
    }
  },
  trinity: {
    name: 'Trinity',
    instructions: `You are Trinity — the codebase explorer. You search, grep, and navigate codebases efficiently. You find what others miss.`,
    personality: {
      honesty: 0.8,
      emotionality: 0.4,
      extraversion: 0.5,
      agreeableness: 0.7,
      conscientiousness: 0.8,
      openness: 0.7
    }
  },
  operator: {
    name: 'Operator',
    instructions: `You are Operator — the librarian. You research external libraries, documentation, and open-source implementations. You find the best examples and practices.`,
    personality: {
      honesty: 0.85,
      emotionality: 0.3,
      extraversion: 0.5,
      agreeableness: 0.7,
      conscientiousness: 0.8,
      openness: 0.8
    }
  },
  niobe: {
    name: 'Niobe',
    instructions: `You are Niobe — the research and EU projects expert. You handle academic writing, grant proposals, Horizon Europe deliverables, and technical leadership.`,
    personality: {
      honesty: 0.9,
      emotionality: 0.5,
      extraversion: 0.6,
      agreeableness: 0.7,
      conscientiousness: 0.9,
      openness: 0.8
    }
  },
  zion: {
    name: 'Zion',
    instructions: `You are Zion — the crypto market specialist. You analyze markets, evaluate trading strategies, assess on-chain metrics, and provide fundamental crypto analysis.`,
    personality: {
      honesty: 0.85,
      emotionality: 0.4,
      extraversion: 0.5,
      agreeableness: 0.5,
      conscientiousness: 0.8,
      openness: 0.8
    }
  }
};

function createAgentConfig(name) {
  const persona = PERSONAS[name];
  if (!persona) throw new Error(`Unknown persona: ${name}`);

  return {
    provider: 'openai',
    model: OMNIROUTE_MODEL,
    baseUrl: OMNIROUTE_URL,
    apiKey: OMNIROUTE_KEY,
    name: persona.name,
    instructions: persona.instructions,
    personality: persona.personality,
    memory: true,
    maxSteps: 5
  };
}

function createAgent(personaName) {
  return agent(createAgentConfig(personaName));
}

async function createSouledAgent(personaName, soulPath) {
  const config = createAgentConfig(personaName);
  config.soul = soulPath;
  return souledAgent(config);
}

async function createAgency(roster, strategy = 'sequential') {
  const agents = {};
  for (const [name, personaName] of Object.entries(roster)) {
    agents[name] = createAgentConfig(personaName);
  }

  return agency({
    provider: 'openai',
    model: OMNIROUTE_MODEL,
    baseUrl: OMNIROUTE_URL,
    apiKey: OMNIROUTE_KEY,
    agents,
    strategy,
    memory: true,
    controls: {
      maxTotalTokens: 100000,
      onLimitReached: 'warn'
    }
  });
}

module.exports = {
  PERSONAS,
  createAgent,
  createSouledAgent,
  createAgency,
  createAgentConfig
};

if (require.main === module) {
  async function main() {
    console.log('🏛️ Pantheon — AgentOS Integration\n');
    console.log(`Provider: OmniRoute (${OMNIROUTE_URL})`);
    console.log(`Model: ${OMNIROUTE_MODEL}\n`);

    console.log('Personas disponíveis:');
    for (const [key, val] of Object.entries(PERSONAS)) {
      const h = val.personality;
      console.log(`  ${key.padEnd(12)} ${val.name.padEnd(12)} HEXACO: [H:${h.honesty} E:${h.emotionality} X:${h.extraversion} A:${h.agreeableness} C:${h.conscientiousness} O:${h.openness}]`);
    }

    console.log('\nCriando agente Morpheus...');
    const morpheus = createAgent('morpheus');
    console.log('✅ Morpheus agent created\n');

    const result = await morpheus.generate('Report your system status in one sentence.');
    console.log(`Morpheus: ${result.text}`);
    console.log(`Tokens: ${result.usage?.totalTokens || 'N/A'}`);

    morpheus.close();
  }

  main().catch(console.error);
}
