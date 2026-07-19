#!/usr/bin/env node
/**
 * Dreamer — Dreaming Engine Core
 *
 * Analisa conversas do OpenCode DB periodicamente, extrai padrões,
 * identifica tendências e gera insights acionáveis.
 *
 * Uso:
 *   node dreamer.js              # Dream completo (últimas 24h)
 *   node dreamer.js --last       # Mostra último dream salvo
 *   node dreamer.js --all        # Dream de TODO histórico
 *   node dreamer.js --hours=48   # Dream de últimas 48h
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { agent } from '@framers/agentos';
import Database from 'better-sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────
const CONFIG = {
  opencodeDb: process.env.OPENCODE_DB || join(os.homedir(), '.local/share/opencode/opencode.db'),
  dreamsDir: join(__dirname, 'dreams'),
  omniRouteUrl: process.env.OMNIROUTE_URL || 'http://localhost:20128/v1',
  defaultHours: parseInt(process.env.DREAM_HOURS || '24'),
  defaultModel: 'oc/deepseek-v4-flash-free',
};

// ── DB Query ────────────────────────────────────────────────────────
function queryOpenCode(dbPath, hours) {
  const db = new Database(dbPath, { readonly: true });
  const since = hours === Infinity ? 0 : Date.now() - hours * 3600 * 1000;

  const sessions = db.prepare(`
    SELECT id, title, model, agent, time_created, time_updated,
           tokens_input, tokens_output, tokens_reasoning, tokens_cache_read,
           tokens_cache_write, cost
    FROM session
    WHERE time_created > ?
    ORDER BY time_created DESC
  `).all(since);

  const sessionIds = sessions.map(s => s.id);
  const messages = [];
  if (sessionIds.length > 0) {
    const placeholders = sessionIds.map(() => '?').join(',');
    const rows = db.prepare(`
      SELECT session_id, time_created, data
      FROM message
      WHERE session_id IN (${placeholders})
      ORDER BY session_id, time_created
    `).all(...sessionIds);

    for (const row of rows) {
      try {
        const parsed = JSON.parse(row.data);
        messages.push({
          sessionId: row.session_id,
          timeCreated: row.time_created,
          role: parsed.role,
          agent: parsed.agent,
          model: parsed.model,
          content: typeof parsed.summary?.diffs?.[0]?.patch === 'string'
            ? parsed.summary.diffs[0].patch.substring(0, 500)
            : parsed.content?.substring?.(0, 500) || '',
          hasDiffs: !!parsed.summary?.diffs?.length,
          diffCount: parsed.summary?.diffs?.length || 0,
          filesChanged: parsed.summary?.diffs?.map?.(d => d.file) || [],
        });
      } catch { /* skip unparseable */ }
    }
  }

  db.close();
  return { sessions, messages };
}

// ── Analytics ────────────────────────────────────────────────────────
function analyze(sessions, messages) {
  const models = {};
  const agents = {};
  const topics = {};
  const hours = {};
  let totalTokensInput = 0;
  let totalTokensOutput = 0;
  let totalCost = 0;
  let totalDiffs = 0;
  const filesMap = {};

  for (const s of sessions) {
    const m = typeof s.model === 'string' ? s.model : s.model?.modelID || JSON.stringify(s.model);
    models[m] = (models[m] || 0) + 1;
    agents[s.agent || 'unknown'] = (agents[s.agent || 'unknown'] || 0) + 1;

    const h = new Date(s.time_created).getHours();
    hours[h] = (hours[h] || 0) + 1;

    totalTokensInput += s.tokens_input || 0;
    totalTokensOutput += s.tokens_output || 0;
    totalCost += s.cost || 0;

    // Topic extraction from title
    const words = (s.title || '').toLowerCase().split(/\s+/);
    for (const w of words) {
      if (w.length > 3 && !['with','that','this','from','what','when','where','which'].includes(w)) {
        topics[w] = (topics[w] || 0) + 1;
      }
    }
  }

  for (const m of messages) {
    totalDiffs += m.diffCount || 0;
    for (const f of (m.filesChanged || [])) {
      filesMap[f] = (filesMap[f] || 0) + 1;
    }
  }

  const sortedModels = Object.entries(models).sort((a, b) => b[1] - a[1]);
  const sortedAgents = Object.entries(agents).sort((a, b) => b[1] - a[1]);
  const sortedTopics = Object.entries(topics).sort((a, b) => b[1] - a[1]).slice(0, 15);
  const peakHour = Object.entries(hours).sort((a, b) => b[1] - a[1])[0];
  const sortedFiles = Object.entries(filesMap).sort((a, b) => b[1] - a[1]).slice(0, 20);

  return {
    period: {
      sessions: sessions.length,
      messages: messages.length,
      filesChanged: Object.keys(filesMap).length,
      diffsGenerated: totalDiffs,
    },
    usage: {
      totalTokensInput,
      totalTokensOutput,
      totalTokens: totalTokensInput + totalTokensOutput,
      totalCost,
      topModels: sortedModels.slice(0, 5),
      topAgents: sortedAgents.slice(0, 5),
    },
    patterns: {
      peakHour: peakHour ? { hour: parseInt(peakHour[0]), sessions: peakHour[1] } : null,
      topTopics: sortedTopics.slice(0, 10),
      topFiles: sortedFiles,
    },
  };
}

// ── Dream Insight Generation (via AgentOS) ──────────────────────────
async function generateDream(analysisData, existingDreams) {
  const dreamPrompt = `You are the Dreaming Engine of an Agentic Operating System. 
You analyze conversation patterns and generate deep insights.

## Current Period Analysis
\`\`\`json
${JSON.stringify(analysisData, null, 2)}
\`\`\`

${existingDreams.length > 0 ? `## Previous Dreams (context for continuity)
${existingDreams.slice(-3).map(d => `- ${d.date}: ${d.insights?.summary || 'No summary'}`).join('\n')}` : ''}

## Your Task
Generate a "dream" — an insightful analysis of this period's activity. Include:

1. **Summary** (1-2 sentences): What happened this period?
2. **Patterns Detected**: Work patterns, model preferences, peak times
3. **Trends**: Changes vs previous periods
4. **Anomalies**: Unusual activity or deviations
5. **Recommendations**: Actionable suggestions for improvement
6. **Code Health**: Files most changed, areas of focus

Be concise (max 400 words). Focus on actionable intelligence.`;

  const dreamer = agent({
    name: 'Dreamer',
    model: CONFIG.defaultModel,
    provider: 'openai',
    baseUrl: CONFIG.omniRouteUrl,
    apiKey: process.env.OMNIROUTE_API_KEY || 'sk-local-dev',
    instructions: 'You are a pattern-recognition engine. Analyze data and extract insights.',
  });

  const response = await dreamer.generate(dreamPrompt);
  const content = response?.text || response?.content || JSON.stringify(response);

  // Try to parse structured output
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = { raw: content };
  }

  return {
    date: new Date().toISOString().split('T')[0],
    timestamp: Date.now(),
    periodStart: new Date(Date.now() - analysisData.period.sessions > 0
      ? Date.now() - CONFIG.defaultHours * 3600 * 1000 : Date.now()).toISOString(),
    periodEnd: new Date().toISOString(),
    stats: analysisData.period,
    usage: analysisData.usage,
    patterns: analysisData.patterns,
    insights: typeof parsed === 'object' && !parsed.raw ? parsed : { summary: content.substring(0, 500) },
    model: CONFIG.defaultModel,
  };
}

// ── Save/Load ───────────────────────────────────────────────────────
function loadDreams() {
  const dir = CONFIG.dreamsDir;
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .map(f => {
      try {
        return JSON.parse(readFileSync(join(dir, f), 'utf-8'));
      } catch { return null; }
    })
    .filter(Boolean);
  return files;
}

function saveDream(dream) {
  const dir = CONFIG.dreamsDir;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const filePath = join(dir, `${dream.date}.json`);
  writeFileSync(filePath, JSON.stringify(dream, null, 2), 'utf-8');
  return filePath;
}

function showLastDream() {
  const dreams = loadDreams();
  if (dreams.length === 0) {
    console.log('Nenhum dream registrado ainda.');
    return;
  }
  const last = dreams[dreams.length - 1];
  console.log(JSON.stringify(last, null, 2));
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--last')) {
    showLastDream();
    return;
  }

  const hoursArg = args.find(a => a.startsWith('--hours='));
  const hours = hoursArg ? parseInt(hoursArg.split('=')[1]) : CONFIG.defaultHours;
  const allTime = args.includes('--all');

  const dbPath = CONFIG.opencodeDb;
  if (!existsSync(dbPath)) {
    console.error(`OpenCode DB não encontrado: ${dbPath}`);
    console.error('Defina OPENCODE_DB ou verifique o caminho.');
    process.exit(1);
  }

  console.log('🌙 Dreaming Engine — Iniciando análise...');
  console.log(`   DB: ${dbPath}`);
  console.log(`   Período: ${allTime ? 'TODO HISTÓRICO' : `últimas ${hours}h`}`);

  // 1. Query
  const { sessions, messages } = queryOpenCode(dbPath, allTime ? Infinity : hours);
  console.log(`   Sessões: ${sessions.length}, Mensagens: ${messages.length}`);

  if (sessions.length === 0) {
    console.log('   Nenhuma sessão no período. Pulando...');
    return;
  }

  // 2. Analyze
  const analysis = analyze(sessions, messages);

  // 3. Generate dream
  const existingDreams = loadDreams();
  console.log('   Gerando insights via AgentOS...');
  const dream = await generateDream(analysis, existingDreams);

  // 4. Save
  const path = saveDream(dream);
  console.log(`   ✅ Dream salvo: ${path}`);

  // 5. Summary
  console.log('\n📋 RESUMO DO DREAM');
  console.log(`   Período: ${dream.stats.sessions} sessões, ${dream.stats.messages} mensagens`);
  console.log(`   Tokens: ${(dream.usage.totalTokens / 1000).toFixed(1)}K total`);
  console.log(`   Custo: $${dream.usage.totalCost.toFixed(4)}`);
  if (dream.patterns.peakHour) {
    console.log(`   Pico: ${dream.patterns.peakHour.hour}:00 (${dream.patterns.peakHour.sessions} sessões)`);
  }
  console.log(`   Modelos top: ${dream.usage.topModels.map(m => `${m[0]}(${m[1]})`).join(', ')}`);
  const insight = typeof dream.insights === 'object' ? dream.insights.summary : dream.insights;
  if (insight) console.log(`\n   💭 ${insight.substring(0, 200)}...`);
}

main().catch(err => {
  console.error('Dreaming Engine error:', err);
  process.exit(1);
});
