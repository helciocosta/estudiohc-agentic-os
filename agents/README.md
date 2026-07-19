# Agentes — Pantheon + AgentOS

Subagentes Matrixx/OpenCode mapeados como personas HEXACO via AgentOS (@framers/agentos).

## Personas HEXACO

| Persona | Papel | HEXACO |
|---------|-------|--------|
| Morpheus | Kernel/Orquestrador | H:0.9 E:0.4 X:0.6 A:0.7 C:0.9 O:0.8 |
| Cipher | DSL Engineer | H:0.8 E:0.3 X:0.3 A:0.5 C:0.9 O:0.9 |
| Oracle | Arquiteto | H:0.9 E:0.3 X:0.4 A:0.6 C:0.9 O:0.9 |
| Sentinel | Seguranca | H:0.95 E:0.3 X:0.3 A:0.4 C:0.95 O:0.7 |
| Trinity | Explorador | H:0.8 E:0.4 X:0.5 A:0.7 C:0.8 O:0.7 |
| Operator | Librarian | H:0.85 E:0.3 X:0.5 A:0.7 C:0.8 O:0.8 |
| Niobe | Research/EU | H:0.9 E:0.5 X:0.6 A:0.7 C:0.9 O:0.8 |
| Zion | Crypto | H:0.85 E:0.4 X:0.5 A:0.5 C:0.8 O:0.8 |
| Smith | Revisor | H:0.9 E:0.3 X:0.4 A:0.5 C:0.9 O:0.8 |

## Provider

OmniRoute (`http://localhost:20128/v1`) — modelo `oc/deepseek-v4-flash-free`.

## Uso

```bash
node agents/pantheon.js              # Teste agente unico
node agents/pantheon-memory.js       # Teste memoria cognitiva
node agents/pantheon-agency.js       # Teste agencia multi-agente
```

## API

```js
const { createAgent, createAgency } = require('./pantheon');

const ag = createAgent('morpheus');
const result = await ag.generate('Report status.');

const team = await createAgency({ researcher: 'operator', writer: 'niobe' });
const reply = await team.generate('Research topic X.');
```
