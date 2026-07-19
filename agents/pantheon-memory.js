const { agent } = require('@framers/agentos');
const { createAgentConfig } = require('./pantheon');
const path = require('path');

const MEMORY_DIR = process.env.PANTHEON_MEMORY_DIR || path.join(__dirname, '..', 'memory');

async function main() {
  const cfg = createAgentConfig('morpheus');

  cfg.memory = true;

  cfg.cognitiveMechanisms = {
    workingMemoryConsolidation: { enabled: true, intervalSeconds: 300, maxItems: 20 },
    episodicMemory:             { enabled: true, maxEpisodes: 100 },
    semanticMemory:             { enabled: true },
    proceduralMemory:           { enabled: true },
    priming:                    { enabled: true },
    associativeMemory:          { enabled: true, associationStrength: 0.7 },
    emotionalWeighting:         { enabled: true },
    reflectiveLoop:             { enabled: true, intervalSeconds: 600 }
  };

  console.log('Config memory+cognition:',
    JSON.stringify({
      memory: cfg.memory,
      cognitiveMechanisms: cfg.cognitiveMechanisms ? Object.keys(cfg.cognitiveMechanisms) : undefined
    }, null, 2));

  const chatAgent = agent(cfg);
  console.log('✅ Agent created with full memory\n');

  const result = await chatAgent.generate('Remember that my favorite color is blue.');
  console.log(`Response: ${result.text}`);
  console.log(`Tokens: ${result.usage?.totalTokens}`);

  chatAgent.close();
}

main().catch(console.error);
