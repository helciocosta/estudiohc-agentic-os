# 🏗️ Arquitetura do Agentic OS EstudioHC

## Filosofia

**Integrar, não substituir.** O Agentic OS não é um novo framework do zero — é a camada de orquestração que unifica ferramentas existentes já rodando no ambiente.

## Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                     AGENTIC OS KERNEL                           │
│               OpenCode + Matrixx (Morpheus)                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │                   ORQUESTRADOR                       │       │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │       │
│  │  │ Subagent │ │ Subagent │ │ Subagent │ │  Tool  │ │       │
│  │  │  Manager │ │  Router  │ │  Sched.  │ │  Exec  │ │       │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
│  ┌────────────┐ ┌──────────────┐ ┌────────────────────────┐     │
│  │  🔧 MCP    │ │  🧩 Skills   │ │  🔌 Plugins           │     │
│  │  Server    │ │  Library     │ │  Registry              │     │
│  └────────────┘ └──────────────┘ └────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   🌐 GATEWAY    │ │   💾 MEMÓRIA   │ │   🔧 CODE      │
│   OmniRoute     │ │   Unificada    │ │   Graph (MCP)   │
│   237 LLMs      │ │   Qdrant+Mem0  │ │   CodeGraph     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   🧠 DREAMING   │ │   📊 MISSION    │ │   📱 CANAIS    │
│   Hermes+Cron   │ │   Control       │ │   Hermes        │
│   Análise 24/7  │ │   Kanban+n8n    │ │   TG/DC/Slack   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Camadas

### 1. Kernel (OpenCode + Matrixx)

O kernel do sistema é o OpenCode rodando com o agente Morpheus (Matrixx). Ele gerencia:

- **Subagentes** como processos do sistema operacional
- **Skills** como syscalls (operações privilegiadas do sistema)
- **Plugins/MCP** como drivers de dispositivo
- **Memória de curto prazo** — contexto da sessão atual

**Componentes:**
- `~/.opencode/` — Configuração do OpenCode
- `~/.config/opencode/` — Skills, MCP servers, config.json
- `~/.local/share/opencode/opencode.db` — Banco de dados (conversas, estado)

### 2. Gateway (OmniRoute)

Camada de comunicação com LLMs. Roteia requisições para o melhor provedor com base em:

- Custo por token
- Latência
- Capacidade do modelo
- Disponibilidade

**Componentes:**
- `localhost:20128/v1` — Endpoint OmniRoute
- 237 provedores configurados
- 90+ gratuitos
- Fallback automático entre provedores

### 3. Dreaming Engine (Hermes + Cron)

Análise assíncrona 24/7 que opera enquanto o usuário não está interagindo. Processa:

- Conversas de todas as sessões (OpenCode DB, Claude, Grok, Gemini)
- Identificação de padrões recorrentes
- Sugestões de melhoria de workflow
- Resumo diário de insights

**Componentes:**
- Hermes rodando em `localhost:9120`
- Kanban para gerenciamento de tarefas
- Cron jobs para execução periódica

### 4. Pantheon (AgentOS/@framers)

Sistema de personalidades para agentes baseado no modelo HEXACO:

- **H** — Honestidade-Humildade
- **E** — Emocionalidade
- **X** — Extroversão
- **A** — Amabilidade
- **C** — Conscienciosidade
- **O** — Abertura a experiência

Cada persona do sistema (Morpheus, Oracle, Cipher, etc.) mapeia para um perfil HEXACO.

**Componentes:**
- `@framers/agentos` — Framework TypeScript
- 8 mecanismos de memória cognitiva
- 88 skills + runtime tool forging
- 6 estratégias de orquestração multi-agente

### 5. Code Graph (CodeGraph)

Camada de inteligência de código via 42 ferramentas MCP:

- Grafo semântico do código fonte
- Análise multi-linguagem (38 linguagens via tree-sitter)
- Busca semântica (BM25 + BGE embeddings)
- Análise de impacto de mudanças
- PR review automation

**Componentes:**
- CodeGraph rodando como servidor MCP
- Conectado ao OpenCode via config MCP
- Memória persistente em RocksDB

### 6. Memória Unificada

Três níveis de memória integrados:

| Nível | Tecnologia | Persistência | Uso |
|-------|------------|-------------|-----|
| Episódica | Mem0 | Sessões | Conversas recentes |
| Semântica | Qdrant (ODS) | Longa | Conhecimento do domínio |
| Cognitiva | AgentOS | Contextual | Personalidade e padrões |

### 7. Mission Control (Hermes Kanban + n8n)

Painel central de controle e automação:

- **Kanban**: Tarefas dos agentes (Hermes)
- **Workflows**: Automação de processos (n8n — 400+ integrações)
- **Métricas**: Custos por provedor, tokens gastos, requisições
- **Scheduler**: Jobs recorrentes (Hermes cron)

### 8. Canais (Hermes)

Comunicação multi-plataforma:

- Telegram
- Discord
- Slack
- WhatsApp
- Extensível via adaptadores

## Fluxo de Dados

```
Usuário → Canal (TG/DC/Slack) 
        → Kernel (OpenCode/Morpheus) 
        → Gateway (OmniRoute) 
        → LLM Provider
        → Resposta → Memória (Qdrant + Cognitive)
        → Code Graph (se código envolvido)
        → Dreaming (análise assíncrona)
        → Missão registrada (n8n + Kanban)
        → Resposta ao usuário
```

## Segurança

- **Autenticação**: API keys via OmniRoute
- **Isolamento**: Subagentes rodam em processos separados
- **Auditoria**: Logs centralizados
- **Controle de custos**: Budget tracking por provedor
- **Multitenância**: Canais isolados por workspace

## Próximos Passos

Ver [PHASES.md](PHASES.md) para o plano de implementação detalhado.
