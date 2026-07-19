#!/usr/bin/env node
/**
 * Mission Control Dashboard
 * Status consolidado de todos os componentes do Agentic OS.
 *
 * Uso:
 *   node dashboard.js         # Status resumido
 *   node dashboard.js --full  # Relatório completo
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_DIR = join(__dirname, '..');

const CHECKS = [
  { name: 'OpenCode (Morpheus)', port: 41651 },
  { name: 'OmniRoute (Gateway)', port: 20128, path: '/v1/models' },
  { name: 'Hermes/ODS', port: 9120 },
  { name: 'Ollama/llama.cpp', port: 11434 },
  { name: 'Open WebUI', port: 3000 },
  { name: 'LiteLLM', port: 4000 },
  { name: 'SearXNG', port: 8888 },
  { name: 'Portainer', port: 9000 },
];

async function checkService({ name, port, path }) {
  return new Promise((resolve) => {
    const url = `http://localhost:${port}${path || '/'}`;
    const req = http.get(url, { timeout: 3000 }, (res) => {
      resolve({ name, status: 'online', detail: `:${port}` });
    });
    req.on('error', () => resolve({ name, status: 'offline', detail: 'offline' }));
    req.on('timeout', () => { req.destroy(); resolve({ name, status: 'timeout', detail: 'timeout' }); });
  });
}

function getTokenUsage() {
  const dbPath = process.env.OPENCODE_DB || join(process.env.HOME, '.local/share/opencode/opencode.db');
  if (!existsSync(dbPath)) return null;
  try {
    const Database = require('better-sqlite3');
    const db = new Database(dbPath, { readonly: true });
    const stats = db.prepare(`
      SELECT COUNT(*) as sessions,
             COALESCE(SUM(tokens_input),0) as tokens_in,
             COALESCE(SUM(tokens_output),0) as tokens_out,
             COALESCE(SUM(cost),0) as cost
      FROM session WHERE time_created > ?
    `).get(Date.now() - 86400000);
    const modelStats = db.prepare(`
      SELECT model, COUNT(*) as count,
             COALESCE(SUM(tokens_input + tokens_output),0) as tokens
      FROM session WHERE time_created > ?
      GROUP BY model ORDER BY count DESC LIMIT 5
    `).all(Date.now() - 86400000);
    db.close();
    return { ...stats, models: modelStats };
  } catch { return null; }
}

function getDreams() {
  const dir = join(REPO_DIR, 'dreaming/dreams');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.json')).sort().reverse().slice(0, 3).map(f => {
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
    const tasks = db.prepare("SELECT COUNT(*) as total FROM tasks WHERE status != 'completed'").get();
    db.close();
    return tasks;
  } catch { return null; }
}

function getModelCount() {
  try {
    const body = http.get('http://localhost:20128/v1/models', { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {});
    });
    return '?';
  } catch { return '?'; }
}

function color(status) {
  if (status === 'online') return '\x1b[32m';     // green
  if (status === 'offline') return '\x1b[31m';     // red
  if (status === 'timeout') return '\x1b[33m';     // yellow
  return '\x1b[90m';                                // gray
}
function bold(s) { return `\x1b[1m${s}\x1b[22m`; }
function dim(s) { return `\x1b[2m${s}\x1b[22m`; }
function reset() { return '\x1b[0m'; }

async function main() {
  const full = process.argv.includes('--full');
  const border = '━'.repeat(56);
  const bar = '─'.repeat(56);

  console.log(`\n${border}`);
  console.log(`${bold('  MISSION CONTROL')}  ${dim('Agentic OS — EstudioHC')}`);
  console.log(`  ${new Date().toLocaleString()}`);
  console.log(`${border}\n`);

  // Services
  const results = await Promise.all(CHECKS.map(checkService));
  const online = results.filter(r => r.status === 'online').length;

  console.log(`${bold('  COMPONENTES')}`);
  for (const r of results) {
    const dot = r.status === 'online' ? '\x1b[32m●\x1b[0m' : '\x1b[31m○\x1b[0m';
    console.log(`  ${dot} ${r.name.padEnd(28)} ${dim(r.detail)}`);
  }
  console.log(`  ${bar}`);
  console.log(`  ${online}/${CHECKS.length} componentes ativos\n`);

  // Token usage
  const tokens = getTokenUsage();
  if (tokens) {
    console.log(`${bold('  USO (últimas 24h)')}`);
    console.log(`  Sessões:     ${tokens.sessions}`);
    console.log(`  Tokens in:   ${(tokens.tokens_in / 1000).toFixed(1)}K`);
    console.log(`  Tokens out:  ${(tokens.tokens_out / 1000).toFixed(1)}K`);
    console.log(`  Custo:       $${Number(tokens.cost).toFixed(4)}`);
    if (tokens.models?.length) {
      console.log(`  Modelos:`);
      for (const m of tokens.models) {
        const label = typeof m.model === 'string' ? m.model.substring(0, 35) : 'unknown';
        console.log(`    ${dim((m.count + 'x').padStart(4))} ${label}`);
      }
    }
    console.log();
  }

  // Dreams
  const dreams = getDreams();
  if (dreams.length > 0) {
    console.log(`${bold('  ÚLTIMOS DREAMS')}`);
    for (const d of dreams) {
      const ins = d.insights?.summary || '';
      console.log(`  ${d.date}  ${dim(`(${d.stats?.sessions || 0} sessões)`)}`);
      console.log(`  ${dim(ins.substring(0, 100))}${ins.length > 100 ? '...' : ''}\n`);
    }
  }

  // Kanban
  const kanban = getHermesKanban();
  if (kanban) {
    console.log(`${bold('  KANBAN (Hermes)')}`);
    console.log(`  Tarefas pendentes: ${kanban.total}`);
    console.log();
  }

  // Model catalog summary
  if (full) {
    console.log(`${bold('  CATÁLOGO DE MODELOS (OmniRoute)')}`);
    try {
      const res = await new Promise((resolve) => {
        http.get('http://localhost:20128/v1/models', { timeout: 5000 }, (res) => {
          let data = '';
          res.on('data', c => data += c);
          res.on('end', () => resolve(data));
        }).on('error', () => resolve(null));
      });
      if (res) {
        const parsed = JSON.parse(res);
        const models = parsed.data || [];
        const providers = {};
        for (const m of models) {
          const p = m.owned_by || 'unknown';
          providers[p] = (providers[p] || 0) + 1;
        }
        for (const [p, c] of Object.entries(providers).sort((a, b) => b[1] - a[1])) {
          console.log(`  ${p.padEnd(20)} ${c} modelos`);
        }
      }
    } catch {}
    console.log();
  }

  console.log(`${border}\n`);
}

main().catch(console.error);
