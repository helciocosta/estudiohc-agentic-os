# 📋 Plano de Construção por Fases

## Fase 0 — Fundação ✅ (Já existe)

**Componentes já rodando:**

| Componente | Status | Detalhes |
|------------|--------|----------|
| OpenCode + Matrixx (Morpheus) | ✅ Rodando | Kernel do sistema |
| OmniRoute | ✅ Rodando | Gateway 237 LLMs |
| Hermes | ✅ Rodando | Agente + Kanban + Canais |
| BrowserOS | ✅ Rodando | Automação de navegador |
| ODS Stack | ✅ Instalado | Open WebUI + Qdrant + n8n + LiteLLM |

**Ação:** Manter e documentar a configuração atual.

---

## Fase 1 — Code Graph ✅

**Objetivo:** Integrar CodeGraph como camada de inteligência de código.

**Tarefas:**

- [x] Instalar CodeGraph v1.4.1 (@colbymchenry/codegraph-linux-x64, 234MB)
- [x] Configurar servidor MCP do CodeGraph (integrado ao OpenCode)
- [x] Conectar ao OpenCode como MCP tool
- [x] Indexar repositórios (6.377 arquivos, 147.750 nós, 172.183 arestas)
- [x] Adicionar CODEGRAPH_START ao AGENTS.md

**Benefício:** 82% menos tokens, 86% mais barato em operações de código.

---

## Fase 2 — Pantheon + Memória Unificada ✅

**Objetivo:** Integrar AgentOS (@framers) para personalidades e memória cognitiva.

**Tarefas:**

- [x] Instalar @framers/agentos@0.9.156 via npm
- [x] Configurar integração com OmniRoute como provider (baseUrl localhost:20128)
- [x] Mapear 8 personas HEXACO (Morpheus, Cipher, Oracle, Sentinel, Trinity, Operator, Niobe, Zion)
- [x] Implementar pipeline multi-agente (researcher → writer → reviewer)
- [x] Ativar 8 mecanismos de memória cognitiva (workingMemoryConsolidation, episodicMemory, semanticMemory, proceduralMemory, priming, associativeMemory, emotionalWeighting, reflectiveLoop)
- [x] Testar persistência cross-session (agente lembrou "favorite color is blue")

**Duração real:** ~2 horas

---

## Fase 3 — Dreaming Engine ✅

**Objetivo:** Agentes analisarem dados 24/7.

**Tarefas:**

- [x] Criar Dreamer Engine (dreamer.js): análise de sessões OpenCode DB via AgentOS/OmniRoute
- [x] Sistema de relatórios (report.js): viewers --all, --trends, --stats
- [x] Registrar como Hermes cron job (intervalo 60min, ~/.hermes/scripts/dreamer.sh)
- [x] Primeiro dream gerado: "The Builder's Pulse" — 9 sessões, 462 mensagens, 1.3M tokens
- [x] Armazenamento estruturado em dreaming/dreams/

**Duração real:** ~1 hora

---

## Fase 4 — Mission Control + Custos ✅

**Objetivo:** Painel centralizado com métricas e automação.

**Tarefas:**

- [x] Dashboard CLI (dashboard.js): status de 8+ serviços, tokens, dreams, kanban, modelos
- [x] Cost Tracker (cost-tracker.js): custos por período (24h, 7d, 30d, all), top modelos, top agentes
- [x] Integração OpenCode DB para métricas reais
- [x] Catálogo de modelos OmniRoute (full listing com --full)
- [x] Status de componentes em tempo real com latência

**Duração real:** ~1 hora

---

## Fase 5 — Dashboard Web + Desktop ✅

**Objetivo:** Interface web e scripts de entrada unificados.

**Tarefas:**

- [x] Dashboard web (server.js + public/index.html): Express + HTML/CSS nativo
- [x] API REST: /api/status, /api/tokens, /api/tokens/history, /api/dreams, /api/kanban, /api/models, /api/storage, /api/all
- [x] CLI mode: mesmo servidor roda como dashboard CLI (default)
- [x] Script unificado: scripts/agentic-os.sh com comandos status, dashboard, dream, dreams, cost
- [x] npm scripts: npm run os, npm run os:status, npm run os:dashboard
- [x] Links rápidos para Open WebUI (:3000), ODS Dashboard (:3001), OmniRoute, Portainer, SearXNG
- [x] Tema dark/light toggle
- [x] Auto-refresh a cada 30s

**Duração real:** ~30 minutos

---

## Resumo de Esforço

| Fase | Duração | Status | Risco |
|------|---------|--------|-------|
| F0 — Fundação | ✅ Já existia | 🟢 | 🟢 Baixo |
| F1 — Code Graph | ✅ ~15 min | 🟢 | 🟢 Baixo |
| F2 — Pantheon + Memória | ✅ ~2h | 🟢 | 🟡 Médio |
| F3 — Dreaming | ✅ ~1h | 🟢 | 🟡 Médio |
| F4 — Mission Control | ✅ ~1h | 🟢 | 🟢 Baixo |
| F5 — Dashboard Web | ✅ ~30 min | 🟢 | 🟢 Baixo |

**Todas as fases F0-F5 concluídas.**
