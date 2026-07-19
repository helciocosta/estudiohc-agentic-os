# 🧠 EstudioHC Agentic OS

**Arquitetura Híbrida de Orquestração Inteligente de Agentes**

> Unificando OpenCode + Matrixx, OmniRoute, Hermes, CodeGraph e AgentOS em um único sistema operacional de agentes.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-helciocosta-181717?logo=github)](https://github.com/helciocosta/estudiohc-agentic-os)

---

## 🏗️ Visão Geral

O **Agentic OS EstudioHC** é uma arquitetura híbrida que integra as melhores ferramentas de agente de IA existentes em um ecossistema coeso:

```
┌─────────────────────────────────────────────────────────┐
│                   AGENTIC OS (Camada de Orquestração)   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🧠 Kernel — OpenCode + Matrixx (Morpheus)              │
│  ├─ Subagentes como processos do sistema               │
│  ├─ Skills como syscalls                               │
│  └─ Plugins como drivers                               │
│                                                          │
│  🌐 Gateway — OmniRoute (237 provedores LLM)            │
│  ├─ Roteamento inteligente por provedor                 │
│  ├─ Fallback automático                                 │
│  └─ Controle de custos por requisição                   │
│                                                          │
│  🧠 Dreaming Engine — Hermes + Cron                     │
│  ├─ Análise 24/7 de conversas e dados                   │
│  ├─ Identificação de padrões cross-session              │
│  └─ Geração de insights diários                         │
│                                                          │
│  🏛️ Pantheon — AgentOS (@framers)                       │
│  ├─ Sistema de personalidade HEXACO                     │
│  ├─ 8 mecanismos de memória cognitiva                   │
│  └─ 88 skills + runtime tool forging                    │
│                                                          │
│  📊 Mission Control — Hermes Kanban + n8n               │
│  ├─ Scheduler de tarefas                                │
│  ├─ Workflows automatizados                             │
│  └─ Métricas e custos                                   │
│                                                          │
│  🔧 Code Graph — CodeGraph (via MCP)                    │
│  ├─ 42 ferramentas MCP de inteligência de código        │
│  ├─ Grafo semântico multi-linguagem (38 linguagens)     │
│  └─ Análise de impacto e PR review                      │
│                                                          │
│  💾 Memória Unificada — Qdrant + Mem0 + Cognitive       │
│  ├─ Vector DB (Qdrant via ODS)                          │
│  ├─ Memória episódica (Mem0)                            │
│  └─ Memória cognitiva (AgentOS)                         │
│                                                          │
│  💻 Desktop + Dashboard — Open WebUI + Antigravity      │
│  ├─ Interface web (Open WebUI via ODS)                  │
│  └─ IDE (Antigravity)                                   │
│                                                          │
│  📱 Canais — Hermes (TG, Discord, Slack, WhatsApp)      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Capacidades

| Capacidade | Status | Componente |
|------------|--------|------------|
| 🧠 Orquestração Multi-Agente | ✅ Ativo | OpenCode + Matrixx |
| 🌐 Gateway 237 LLMs | ✅ Ativo | OmniRoute |
| 🧠 Dreaming (análise 24/7) | 📋 Planejado | Hermes + Cron |
| 🏛️ Pantheon (personas) | 📋 Planejado | AgentOS/@framers |
| 🔧 Code Graph | 📋 Planejado | CodeGraph MCP |
| 📊 Mission Control | 📋 Planejado | Hermes Kanban + n8n |
| 💾 Memória Unificada | 🔄 Em andamento | Qdrant + Mem0 + AgentOS |
| 📱 Canais | ✅ Ativo | Hermes (TG, DC, Slack, WA) |
| 💻 Desktop App | 📋 Planejado | Open WebUI / Tauri |
| 🔒 Segurança | 📋 Planejado | Múltiplas camadas |

## 🚀 Começando

### Pré-requisitos

- Node.js v22+
- TypeScript
- Acesso aos repositórios dos componentes (ver `docs/ARCHITECTURE.md`)

### Instalação Rápida

```bash
# Clone o projeto
git clone https://github.com/helciocosta/estudiohc-agentic-os.git
cd estudiohc-agentic-os

# Veja a arquitetura
cat docs/ARCHITECTURE.md

# Siga cada fase em docs/PHASES.md
```

## 📁 Estrutura do Projeto

```
estudiohc-agentic-os/
├── kernel/              # OpenCode + Matrixx config
├── agents/              # Subagentes e skills
├── gateway/             # OmniRoute config
├── memory/              # Memória unificada (Qdrant, Mem0, Cognitive)
├── code-graph/          # CodeGraph MCP integration
├── dreaming/            # Dreaming Engine (Hermes)
├── mission-control/     # Mission Control (n8n, kanban)
├── channels/            # Canais de comunicação
├── desktop/             # UI / Dashboard
├── docs/                # Documentação
│   ├── ARCHITECTURE.md  # Arquitetura detalhada
│   └── PHASES.md        # Plano de construção por fases
└── scripts/             # Scripts de automação
```

## 📋 Fases de Construção

| Fase | O quê | Status |
|------|-------|--------|
| **F0** | Fundação (já existe: OpenCode, OmniRoute, Hermes) | ✅ Completo |
| **F1** | Code Graph (CodeGraph via MCP) | 📋 Pendente |
| **F2** | Pantheon + Memória (AgentOS + Qdrant) | 📋 Pendente |
| **F3** | Dreaming Engine (Hermes cron) | 📋 Pendente |
| **F4** | Mission Control + Dashboard + Custos | 📋 Pendente |
| **F5** | Desktop App (Tauri / Open WebUI) | 📋 Pendente |

Detalhes em [docs/PHASES.md](docs/PHASES.md).

## 🛠️ Stack

- **Runtime**: Node.js / TypeScript
- **Orquestração**: OpenCode + Matrixx
- **Gateway LLM**: OmniRoute (237 provedores)
- **Agentes**: Hermes, AgentOS (@framers)
- **Memória**: Qdrant, Mem0, Cognitive Memory
- **Code Graph**: CodeGraph (Rust/C via MCP)
- **Workflows**: n8n
- **Desktop**: Open WebUI / Tauri
- **Canais**: Telegram, Discord, Slack, WhatsApp

## 📄 Licença

MIT © 2026 EstudioHC

---

**Construído sobre o que já existe, integrando o que há de melhor.**
