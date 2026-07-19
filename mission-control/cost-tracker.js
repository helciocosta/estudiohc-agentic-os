#!/usr/bin/env node
import { existsSync } from 'fs';
import { join } from 'path';
import Database from 'better-sqlite3';

const dbPath = process.env.OPENCODE_DB || join(process.env.HOME, '.local/share/opencode/opencode.db');

if (!existsSync(dbPath)) {
  console.error('OpenCode DB not found:', dbPath);
  process.exit(1);
}

const db = new Database(dbPath, { readonly: true });

const periods = {
  '24h': Date.now() - 86400000,
  '7d': Date.now() - 7 * 86400000,
  '30d': Date.now() - 30 * 86400000,
  all: 0,
};

console.log('\nCOST TRACKER\n');
console.log(`${'Periodo'.padEnd(10)} ${'Sessoes'.padEnd(8)} ${'Tokens In'.padEnd(12)} ${'Tokens Out'.padEnd(12)} ${'Total'.padEnd(12)} ${'Custo'}`);
console.log('-'.repeat(70));

for (const [label, since] of Object.entries(periods)) {
  let row;
  if (since === 0) {
    row = db.prepare(`SELECT COUNT(*) as s, COALESCE(SUM(tokens_input),0) as ti, COALESCE(SUM(tokens_output),0) as to_, COALESCE(SUM(cost),0) as c FROM session`).get();
  } else {
    row = db.prepare(`SELECT COUNT(*) as s, COALESCE(SUM(tokens_input),0) as ti, COALESCE(SUM(tokens_output),0) as to_, COALESCE(SUM(cost),0) as c FROM session WHERE time_created > ?`).get(since);
  }

  const total = row.ti + row.to_;
  console.log(
    `${label.padEnd(10)} ${String(row.s).padEnd(8)} ${(row.ti / 1000).toFixed(1).padStart(9) + 'K'.padEnd(2)} ${(row.to_ / 1000).toFixed(1).padStart(9) + 'K'.padEnd(2)} ${(total / 1000).toFixed(1).padStart(9) + 'K'.padEnd(2)} $${Number(row.c).toFixed(4)}`
  );
}

// Top models by tokens
console.log('\nTOP MODELOS (all time)\n');
const models = db.prepare(`
  SELECT model, COUNT(*) as count,
         COALESCE(SUM(tokens_input + tokens_output),0) as tokens,
         COALESCE(SUM(cost),0) as cost
  FROM session GROUP BY model ORDER BY tokens DESC LIMIT 10
`).all();

console.log(`${'Modelo'.padEnd(45)} ${'Vezes'.padEnd(6)} ${'Tokens'.padEnd(12)} ${'Custo'}`);
console.log('-'.repeat(75));
for (const m of models) {
  const label = typeof m.model === 'string' ? m.model.substring(0, 42) : 'unknown';
  const tokens = (m.tokens / 1000).toFixed(1) + 'K';
  console.log(`${label.padEnd(45)} ${String(m.count).padEnd(6)} ${tokens.padStart(10)} $${Number(m.cost).toFixed(4)}`);
}

// Top agents
console.log('\nTOP AGENTES (all time)\n');
const agents = db.prepare(`
  SELECT agent, COUNT(*) as count,
         COALESCE(SUM(tokens_input + tokens_output),0) as tokens
  FROM session GROUP BY agent ORDER BY count DESC LIMIT 10
`).all();

console.log(`${'Agente'.padEnd(30)} ${'Vezes'.padEnd(6)} ${'Tokens'.padEnd(12)}`);
console.log('-'.repeat(50));
for (const a of agents) {
  if (!a.agent) continue;
  const tokens = (a.tokens / 1000).toFixed(1) + 'K';
  console.log(`${a.agent.substring(0, 27).padEnd(30)} ${String(a.count).padEnd(6)} ${tokens.padStart(10)}`);
}

db.close();
console.log();
