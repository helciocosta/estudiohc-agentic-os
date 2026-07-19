#!/usr/bin/env node
/**
 * Report — Visualizador de Dreams
 *
 * Mostra histórico de dreams em formato legível.
 *
 * Uso:
 *   node report.js              # Último dream
 *   node report.js --all        # Todos os dreams
 *   node report.js --trends     # Análise de tendências entre dreams
 *   node report.js --stats      # Estatísticas agregadas
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dreamsDir = join(__dirname, 'dreams');

function loadAllDreams() {
  if (!existsSync(dreamsDir)) return [];
  return readdirSync(dreamsDir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .map(f => {
      try {
        return { ...JSON.parse(readFileSync(join(dreamsDir, f), 'utf-8')), _file: f };
      } catch { return null; }
    })
    .filter(Boolean);
}

function showDream(dream, index) {
  if (!dream) return;

  const border = '━'.repeat(60);
  console.log(`\n${border}`);
  console.log(`  🌙 DREAM #${index + 1}  —  ${dream.date}`);
  console.log(border);

  console.log(`  Período: ${dream.stats?.sessions || '?'} sessões`);
  console.log(`  Mensagens: ${dream.stats?.messages || '?'}`);
  console.log(`  Arquivos alterados: ${dream.stats?.filesChanged || '?'}`);
  console.log(`  Diffs gerados: ${dream.stats?.diffsGenerated || '?'}`);

  console.log(`\n  📊 USO`);
  console.log(`  Tokens input:  ${((dream.usage?.totalTokensInput || 0) / 1000).toFixed(1)}K`);
  console.log(`  Tokens output: ${((dream.usage?.totalTokensOutput || 0) / 1000).toFixed(1)}K`);
  console.log(`  Custo total:   $${(dream.usage?.totalCost || 0).toFixed(4)}`);

  if (dream.usage?.topModels?.length) {
    console.log(`\n  🧠 MODELOS`);
    for (const [model, count] of dream.usage.topModels) {
      console.log(`  ${'  '.repeat(2)}${model.padEnd(35)} ${count}x`);
    }
  }

  if (dream.usage?.topAgents?.length) {
    console.log(`\n  🤖 AGENTES`);
    for (const [agent, count] of dream.usage.topAgents) {
      console.log(`  ${'  '.repeat(2)}${agent.padEnd(35)} ${count}x`);
    }
  }

  if (dream.patterns?.peakHour) {
    console.log(`\n  ⏰ PADRÕES`);
    console.log(`  Pico de atividade: ${dream.patterns.peakHour.hour}:00 (${dream.patterns.peakHour.sessions} sessões)`);
  }

  if (dream.patterns?.topTopics?.length) {
    console.log(`  Tópicos frequentes: ${dream.patterns.topTopics.slice(0, 5).map(t => t[0]).join(', ')}`);
  }

  if (dream.insights) {
    const ins = dream.insights;
    console.log(`\n  💭 INSIGHTS`);
    if (ins.summary) console.log(`  ${ins.summary}`);
    if (ins.recommendations) {
      const recs = Array.isArray(ins.recommendations) ? ins.recommendations : [ins.recommendations];
      console.log(`\n  Recomendações:`);
      for (const r of recs.slice(0, 3)) console.log(`    • ${r}`);
    }
  }
}

function showTrends(dreams) {
  console.log('\n📈 TENDÊNCIAS ENTRE DREAMS\n');
  console.log('  Data       | Sessões | Msgs  | Tokens(K) | Custo   | Modelo principal');
  console.log('  ' + '─'.repeat(75));

  for (const d of dreams) {
    const topModel = d.usage?.topModels?.[0]?.[0]?.substring(0, 25) || '?';
    const tokens = Math.round((d.usage?.totalTokens || 0) / 1000);
    console.log(
      `  ${d.date} | ${String(d.stats?.sessions || '?').padStart(7)} | ${String(d.stats?.messages || '?').padStart(5)} | ${String(tokens).padStart(9)} | $${(d.usage?.totalCost || 0).toFixed(4)} | ${topModel}`
    );
  }
}

function showStats(dreams) {
  const total = dreams.reduce((acc, d) => ({
    sessions: acc.sessions + (d.stats?.sessions || 0),
    messages: acc.messages + (d.stats?.messages || 0),
    tokensInput: acc.tokensInput + (d.usage?.totalTokensInput || 0),
    tokensOutput: acc.tokensOutput + (d.usage?.totalTokensOutput || 0),
    cost: acc.cost + (d.usage?.totalCost || 0),
    diffs: acc.diffs + (d.stats?.diffsGenerated || 0),
    files: acc.files + (d.stats?.filesChanged || 0),
  }), { sessions: 0, messages: 0, tokensInput: 0, tokensOutput: 0, cost: 0, diffs: 0, files: 0 });

  console.log('\n📊 ESTATÍSTICAS AGREGADAS\n');
  console.log(`  Período total:      ${dreams.length} dreams (${dreams[0]?.date} — ${dreams[dreams.length - 1]?.date})`);
  console.log(`  Total sessões:      ${total.sessions}`);
  console.log(`  Total mensagens:    ${total.messages}`);
  console.log(`  Tokens input:       ${(total.tokensInput / 1000).toFixed(1)}K`);
  console.log(`  Tokens output:      ${(total.tokensOutput / 1000).toFixed(1)}K`);
  console.log(`  Custo total:        $${total.cost.toFixed(4)}`);
  console.log(`  Diffs gerados:      ${total.diffs}`);
  console.log(`  Arquivos tocados:   ${total.files}`);
  console.log(`  Média sessão/dia:   ${(total.sessions / dreams.length).toFixed(1)}`);
}

function main() {
  const args = process.argv.slice(2);
  const dreams = loadAllDreams();

  if (dreams.length === 0) {
    console.log('Nenhum dream encontrado. Rode `node dreamer.js` primeiro.');
    return;
  }

  if (args.includes('--trends')) {
    showTrends(dreams);
  } else if (args.includes('--stats')) {
    showStats(dreams);
  } else if (args.includes('--all')) {
    dreams.forEach((d, i) => showDream(d, i));
  } else {
    showDream(dreams[dreams.length - 1], dreams.length - 1);
  }

  console.log('');
}

main();
