#!/usr/bin/env node
/**
 * Status Check — Agentic OS EstudioHC
 * Verifica quais componentes estão rodando no sistema.
 */

const http = require('http');

const CHECKS = [
  { name: 'OmniRoute', url: 'http://localhost:20128/v1/models', port: 20128 },
  { name: 'Hermes', url: 'http://localhost:9120/health', port: 9120 },
  { name: 'Ollama/llama.cpp', url: 'http://localhost:11434/api/version', port: 11434 },
  { name: 'OpenCode', port: 41651 },
];

async function checkUrl({ name, url }) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 3000 }, (res) => {
      resolve({ name, status: res.statusCode < 400 ? '✅' : '❌', detail: res.statusCode });
    });
    req.on('error', () => resolve({ name, status: '❌', detail: 'offline' }));
    req.on('timeout', () => { req.destroy(); resolve({ name, status: '❌', detail: 'timeout' }); });
  });
}

async function main() {
  console.log('\n🔍 Agentic OS — Status dos Componentes\n');

  const results = await Promise.all(CHECKS.map(checkUrl));

  const statusMap = {
    '✅': 'Rodando',
    '❌': 'Offline',
  };

  results.forEach((r) => {
    const icon = r.status === '✅' ? '🟢' : '🔴';
    console.log(`  ${icon} ${r.name.padEnd(25)} ${r.status}  (${r.detail})`);
  });

  const running = results.filter((r) => r.status === '✅').length;
  console.log(`\n  📊 ${running}/${results.length} componentes ativos\n`);
}

main();
