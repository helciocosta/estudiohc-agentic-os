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

## Fase 1 — Code Graph 📋 (Próxima)

**Objetivo:** Integrar CodeGraph como camada de inteligência de código.

**Tarefas:**

- [ ] Clonar/instalar CodeGraph (github.com/codegraph-ai/CodeGraph)
- [ ] Configurar servidor MCP do CodeGraph
- [ ] Conectar ao OpenCode como MCP tool
- [ ] Validar busca semântica no codebase
- [ ] Testar análise de impacto

**Duração estimada:** 1-2 dias

**Benefício:** 82% menos tokens, 86% mais barato em operações de código.

---

## Fase 2 — Pantheon + Memória Unificada 📋

**Objetivo:** Integrar AgentOS (@framers) para personalidades e memória cognitiva.

**Tarefas:**

- [ ] Instalar @framers/agentos via npm
- [ ] Configurar integração com OmniRoute como provider
- [ ] Mapear subagentes existentes como personas HEXACO
- [ ] Conectar Qdrant (ODS) como vector store
- [ ] Integrar Mem0 para memória episódica
- [ ] Unificar 3 níveis de memória
- [ ] Testar persistência cross-session

**Duração estimada:** 2-3 dias

---

## Fase 3 — Dreaming Engine 📋

**Objetivo:** Agentes analisarem dados 24/7.

**Tarefas:**

- [ ] Configurar Hermes cron para execução periódica
- [ ] Criar scripts de análise de conversas (OpenCode DB, Claude, Grok, Gemini)
- [ ] Implementar identificação de padrões cross-session
- [ ] Gerar relatório diário de insights
- [ ] Dashboard de descobertas

**Duração estimada:** 2-3 dias

---

## Fase 4 — Mission Control + Custos 📋

**Objetivo:** Painel centralizado com métricas e automação.

**Tarefas:**

- [ ] Unificar Hermes kanban + ODS WebUI
- [ ] Configurar n8n workflows
- [ ] Implementar tracking de custos por provedor
- [ ] Dashboard de métricas (tokens, requisições, latência)
- [ ] Alertas de budget

**Duração estimada:** 2 dias

---

## Fase 5 — Desktop App 📋

**Objetivo:** Interface desktop unificada.

**Opções:**

- [ ] **Opção A:** Open WebUI (já existe via ODS) — estender com plugins
- [ ] **Opção B:** Tauri 2.0 — app nativo (como OpenFang)
- [ ] **Opção C:** Antigravity como IDE central

**Duração estimada:** 3-5 dias (dependendo da opção)

---

## Resumo de Esforço

| Fase | Duração | Dependências | Risco |
|------|---------|-------------|-------|
| F0 — Fundação | ✅ Pronto | Nenhuma | 🟢 Baixo |
| F1 — Code Graph | 1-2 dias | Nenhuma | 🟢 Baixo |
| F2 — Pantheon + Memória | 2-3 dias | OmniRoute | 🟡 Médio |
| F3 — Dreaming | 2-3 dias | Hermes rodando | 🟡 Médio |
| F4 — Mission Control | 2 dias | ODS, Hermes | 🟢 Baixo |
| F5 — Desktop | 3-5 dias | F4 completo | 🔴 Alto |

**Total estimado:** 10-16 dias para MVP completo.
