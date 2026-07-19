#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_DIR = join(__dirname, '..');
const PORT = 3456;

const CHECKS = [
  { id: 'opencode',     name: 'OpenCode (Morpheus)',       port: 41651, icon: '🧠' },
  { id: 'omniroute',    name: 'OmniRoute (Gateway)',       port: 20128, path: '/v1/models', icon: '🌐' },
  { id: 'hermes',       name: 'Hermes (Agent)',            port: 9120,  icon: '🤖' },
  { id: 'llamacpp',     name: 'llama.cpp (Local LLM)',     port: 11434, icon: '🦙' },
  { id: 'openwebui',    name: 'Open WebUI',                port: 3000,  icon: '💬' },
  { id: 'litellm',      name: 'LiteLLM (ODS)',             port: 4000,  icon: '⚡' },
  { id: 'searxng',      name: 'SearXNG (Search)',           port: 8888,  icon: '🔍' },
  { id: 'portainer',    name: 'Portainer (Docker UI)',     port: 9000,  icon: '🐳' },
  { id: 'ods-dash',     name: 'ODS Dashboard',             port: 3001,  icon: '📊' },
];

async function checkService({ name, port, path: p }) {
  const url = `http://localhost:${port}${p || '/'}`;
  const start = Date.now();
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 3000 }, (res) => {
      resolve({ name, status: 'online', latency: Date.now() - start, detail: `:${port}` });
    });
    req.on('error', () => resolve({ name, status: 'offline', latency: 0, detail: 'offline' }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ name, status: 'timeout', latency: 3000, detail: 'timeout' });
    });
  });
}

function getTokenUsage(since = 86400000) {
  try {
    const dbPath = process.env.OPENCODE_DB || join(process.env.HOME, '.local/share/opencode/opencode.db');
    if (!existsSync(dbPath)) return null;
    const Database = require('better-sqlite3');
    const db = new Database(dbPath, { readonly: true });
    const stats = db.prepare(`
      SELECT COUNT(*) as sessions,
             COALESCE(SUM(tokens_input),0) as tokens_in,
             COALESCE(SUM(tokens_output),0) as tokens_out,
             COALESCE(SUM(cost),0) as cost
      FROM session WHERE time_created > ?
    `).get(since);
    const modelStats = db.prepare(`
      SELECT model, COUNT(*) as count,
             COALESCE(SUM(tokens_input + tokens_output),0) as tokens,
             COALESCE(SUM(cost),0) as cost
      FROM session WHERE time_created > ?
      GROUP BY model ORDER BY count DESC LIMIT 10
    `).all(since);
    const agentStats = db.prepare(`
      SELECT agent, COUNT(*) as count,
             COALESCE(SUM(tokens_input + tokens_output),0) as tokens
      FROM session WHERE agent IS NOT NULL AND agent != '' AND time_created > ?
      GROUP BY agent ORDER BY count DESC LIMIT 10
    `).all(since);
    db.close();
    return { ...stats, models: modelStats, agents: agentStats };
  } catch (e) {
    return { error: e.message };
  }
}

function getOpenCodeDbSize() {
  try {
    const p = process.env.OPENCODE_DB || join(process.env.HOME, '.local/share/opencode/opencode.db');
    return existsSync(p) ? statSync(p).size : 0;
  } catch { return 0; }
}

function getDreams(limit = 3) {
  const dir = join(REPO_DIR, 'dreaming/dreams');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.json')).sort().reverse().slice(0, limit).map(f => {
    try { return JSON.parse(readFileSync(join(dir, f), 'utf-8')); }
    catch { return null; }
  }).filter(Boolean);
}

function getHermesKanban() {
  try {
    const dbPath = join(process.env.HOME, '.hermes/kanban.db');
    if (!existsSync(dbPath)) return null;
    const Database = require('better-sqlite3');
    const db = new Database(dbPath, { readonly: true });
    const data = {
      total: db.prepare("SELECT COUNT(*) as c FROM tasks").get()?.c || 0,
      pending: db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status != 'completed' AND status != 'done'").get()?.c || 0,
      completed: db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status = 'completed' OR status = 'done'").get()?.c || 0,
    };
    db.close();
    return data;
  } catch { return null; }
}

function getOmniRouteModels() {
  return new Promise((resolve) => {
    http.get('http://localhost:20128/v1/models', { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ total: parsed.data?.length || 0, models: parsed.data || [] });
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function getCodeGraphInfo() {
  const cgDir = join(process.env.HOME, '.codegraph');
  if (!existsSync(cgDir)) return null;
  try {
    const dbPath = join(cgDir, 'codegraph.db');
    const hasDb = existsSync(dbPath);
    return { dir: cgDir, dbSize: hasDb ? statSync(dbPath).size : 0 };
  } catch { return null; }
}

function getRepoSize() {
  try {
    let total = 0;
    function walk(dir) {
      if (!existsSync(dir)) return;
      for (const e of readdirSync(dir)) {
        if (e === 'node_modules' || e === '.git') continue;
        const full = join(dir, e);
        try {
          if (statSync(full).isDirectory()) walk(full);
          else total += statSync(full).size;
        } catch {}
      }
    }
    walk(REPO_DIR);
    return total;
  } catch { return 0; }
}

function color(s) {
  if (s === 'online') return '\x1b[32m';
  if (s === 'offline') return '\x1b[31m';
  if (s === 'timeout') return '\x1b[33m';
  return '\x1b[90m';
}
function bold(s) { return `\x1b[1m${s}\x1b[22m`; }
function dim(s) { return `\x1b[2m${s}\x1b[22m`; }
function reset() { return '\x1b[0m'; }

async function showDashboard() {
  const border = '━'.repeat(56);
  const bar = '─'.repeat(56);

  console.log(`\n${border}`);
  console.log(`${bold('  AGENTIC OS DASHBOARD')}  ${dim('EstudioHC')}`);
  console.log(`  ${new Date().toLocaleString()}`);
  console.log(`${border}\n`);

  const results = await Promise.all(CHECKS.map(checkService));
  const online = results.filter(r => r.status === 'online').length;

  console.log(`${bold('  COMPONENTES')}`);
  for (const r of results) {
    const dot = r.status === 'online' ? '\x1b[32m●\x1b[0m' : '\x1b[31m○\x1b[0m';
    const lat = r.status === 'online' ? dim(` ${r.latency}ms`) : '';
    console.log(`  ${dot} ${r.name.padEnd(30)} ${color(r.status)}${r.status}${reset()}${lat}`);
  }
  console.log(`  ${bar}`);
  console.log(`  ${bold(String(online))}/${CHECKS.length} componentes ativos\n`);

  const tokens = getTokenUsage();
  if (tokens && !tokens.error) {
    console.log(`${bold('  USO (últimas 24h)')}`);
    console.log(`  Sessões:     ${tokens.sessions}`);
    console.log(`  Tokens in:   ${(tokens.tokens_in / 1000).toFixed(1)}K`);
    console.log(`  Tokens out:  ${(tokens.tokens_out / 1000).toFixed(1)}K`);
    console.log(`  Custo total: $${Number(tokens.cost).toFixed(4)}`);
    if (tokens.models?.length) {
      console.log(`  Modelos top:`);
      for (const m of tokens.models.slice(0, 5)) {
        const label = typeof m.model === 'string' ? m.model.substring(0, 35) : 'unknown';
        console.log(`    ${dim((m.count + 'x').padStart(4))} ${label}`);
      }
    }
    console.log();
  }

  const dreams = getDreams(2);
  if (dreams.length > 0) {
    console.log(`${bold('  ÚLTIMOS DREAMS')}`);
    for (const d of dreams) {
      console.log(`  ${d.date || '?'}  ${dim(`(${d.stats?.sessions || 0} sessões)`)}`);
      const s = d.insights?.summary || '';
      console.log(`  ${dim(s.substring(0, 100))}${s.length > 100 ? '...' : ''}\n`);
    }
  }

  const kanban = getHermesKanban();
  if (kanban) {
    console.log(`${bold('  KANBAN (Hermes)')}`);
    console.log(`  ${kanban.pending} pendentes · ${kanban.completed} concluídas · ${kanban.total} total`);
    console.log();
  }

  const dbSize = getOpenCodeDbSize();
  console.log(`${bold('  ARMAZENAMENTO')}`);
  console.log(`  OpenCode DB:  ${(dbSize / 1048576).toFixed(0)}MB`);
  console.log(`  Repositório:  ${(getRepoSize() / 1048576).toFixed(0)}MB`);

  console.log(`\n${border}`);
  console.log(`  ${dim('Web UI: node server.js --web')}`);
  console.log(`${border}\n`);
}

async function startWebServer(port) {
  const express = (await import('express')).default;
  const app = express();

  app.use(express.static(join(__dirname, 'public')));

  app.get('/api/status', async (req, res) => {
    const results = await Promise.all(CHECKS.map(async (c) => {
      const r = await checkService(c);
      return { ...r, id: c.id, icon: c.icon };
    }));
    const online = results.filter(r => r.status === 'online').length;
    res.json({ timestamp: new Date().toISOString(), services: results, online, total: CHECKS.length });
  });

  app.get('/api/tokens', (req, res) => {
    const period = parseInt(req.query.since) || 86400000;
    res.json(getTokenUsage(period) || { error: 'unavailable' });
  });

  app.get('/api/tokens/history', (req, res) => {
    const periods = {
      '24h': 86400000,
      '7d': 7 * 86400000,
      '30d': 30 * 86400000,
      all: 0,
    };
    const data = {};
    for (const [label, since] of Object.entries(periods)) {
      const d = getTokenUsage(since);
      if (d && !d.error) {
        data[label] = { sessions: d.sessions, tokens_in: d.tokens_in, tokens_out: d.tokens_out, total: d.tokens_in + d.tokens_out, cost: d.cost };
      }
    }
    res.json(data);
  });

  app.get('/api/dreams', (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    res.json(getDreams(limit));
  });

  app.get('/api/kanban', (req, res) => {
    res.json(getHermesKanban() || { error: 'unavailable' });
  });

  app.get('/api/models', async (req, res) => {
    const data = await getOmniRouteModels();
    res.json(data || { error: 'unavailable' });
  });

  app.get('/api/storage', (req, res) => {
    res.json({
      opencodeDb: getOpenCodeDbSize(),
      repoSize: getRepoSize(),
      codegraph: getCodeGraphInfo(),
    });
  });

  app.get('/api/all', async (req, res) => {
    const [statusResult, modelsResult] = await Promise.all([
      Promise.all(CHECKS.map(async (c) => {
        const r = await checkService(c);
        return { ...r, id: c.id, icon: c.icon };
      })),
      getOmniRouteModels(),
    ]);
    const online = statusResult.filter(r => r.status === 'online').length;
    res.json({
      timestamp: new Date().toISOString(),
      services: statusResult,
      online,
      total: CHECKS.length,
      tokens: getTokenUsage() || null,
      dreams: getDreams(3),
      kanban: getHermesKanban() || null,
      models: modelsResult?.total || 0,
      storage: {
        opencodeDb: getOpenCodeDbSize(),
        repoSize: getRepoSize(),
        codegraph: getCodeGraphInfo(),
      },
    });
  });

  app.listen(port, () => {
    console.log(`\n  🧠 Agentic OS Dashboard`);
    console.log(`  ─────────────────────`);
    console.log(`  Local:   http://localhost:${port}`);
    console.log(`  API:     http://localhost:${port}/api/all`);
    console.log(`  WebUI:   http://localhost:3000`);
    console.log(`  ODS:     http://localhost:3001`);
    console.log(`\n  Pressione Ctrl+C para parar\n`);
  });
}

const args = process.argv.slice(2);

if (args.includes('--web')) {
  const portIdx = args.indexOf('--port');
  const port = portIdx >= 0 ? parseInt(args[portIdx + 1]) : PORT;
  const shouldOpen = args.includes('--open');
  startWebServer(port);
  if (shouldOpen) {
    import('child_process').then(cp => cp.exec(`xdg-open http://localhost:${port}`));
  }
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  Agentic OS Dashboard

  Uso:
    node server.js                        CLI dashboard
    node server.js --web                  Web server (:3456)
    node server.js --web --port 8080      Custom port
    node server.js --web --open           + open browser
    node server.js -h, --help             Help
  `);
} else {
  showDashboard().catch(console.error);
}
