'use strict';

/**
 * Idempotently writes the Benchmarks section into the root README.md.
 *
 * The whole section lives between BENCHMARKS:START / BENCHMARKS:END markers and is
 * regenerated in place on every run (so the README — already large — never accumulates
 * duplicate sections). Inside it, a compact History table keeps one row per lambda-api
 * version: a new version appends a row; re-running for the same version replaces its row.
 * If the markers are absent, the section is appended once at the end of the file.
 */

const fs = require('fs');
const { renderTables, opsPerSec, fmtOps } = require('./table');

const START = '<!-- BENCHMARKS:START -->';
const END = '<!-- BENCHMARKS:END -->';
const H_START = '<!-- BENCHMARKS:HISTORY:START -->';
const H_END = '<!-- BENCHMARKS:HISTORY:END -->';

// Representative cell used for the compact history table.
const HISTORY_FORMAT = 'v2';
const HISTORY_SCENARIO = 'get-json';
const HISTORY_FRAMEWORKS = [
  { name: 'baseline', header: 'baseline' },
  { name: 'lambda-api', header: 'lambda-api' },
  { name: 'fastify', header: 'fastify' },
  { name: 'hono', header: 'hono' },
  { name: 'middy', header: 'middy' },
  { name: 'serverless-express', header: 'express' }
];

function rowCells(line) {
  return line
    .split('|')
    .slice(1, -1)
    .map((c) => c.trim());
}

function stripVersion(v) {
  return String(v).replace(/`/g, '').trim();
}

function extractHistoryRows(readme) {
  const s = readme.indexOf(H_START);
  const e = readme.indexOf(H_END);
  if (s === -1 || e === -1 || e < s) return [];
  const block = readme.slice(s + H_START.length, e);
  const lines = block
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|'));
  // [0] = header, [1] = separator, rest = data rows
  return lines
    .slice(2)
    .filter((l) => !/^\|\s*-/.test(l))
    .map(rowCells);
}

function opsFor(results, framework) {
  const c = results.find(
    (r) => r.framework === framework && r.format === HISTORY_FORMAT && r.scenario === HISTORY_SCENARIO
  );
  return c && c.ok && c.stats ? fmtOps(opsPerSec(c.stats)) : 'n/a';
}

function buildHistoryRow(results, env) {
  return [
    env.lambdaApiVersion,
    env.dateShort,
    env.node,
    ...HISTORY_FRAMEWORKS.map((f) => opsFor(results, f.name))
  ];
}

function renderHistoryTable(prevRows, current) {
  const header = ['version', 'date', 'node', ...HISTORY_FRAMEWORKS.map((f) => f.header)];
  const rows = [];
  let replaced = false;
  for (const r of prevRows) {
    if (stripVersion(r[0]) === stripVersion(current[0])) {
      rows.push(current);
      replaced = true;
    } else {
      rows.push(r);
    }
  }
  if (!replaced) rows.push(current);

  const lines = [
    H_START,
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...rows.map((r) => `| ${r.join(' | ')} |`),
    H_END
  ];
  return lines.join('\n');
}

function buildSection(results, env, historyTable) {
  return [
    START,
    '## Benchmarks',
    '',
    'In-process micro-benchmarks of lambda-api against other AWS Lambda web frameworks. ' +
      'The numbers measure **framework overhead only** (event → route → middleware → response, ' +
      'in a single Node VM) — not end-to-end Lambda timings. Absolute values vary by machine, so ' +
      'compare the **relative** ranking rather than the raw ops/sec. See ' +
      '[`benchmarks/`](./benchmarks) for the methodology and how to reproduce.',
    '',
    renderTables(results, env).trim(),
    '',
    '#### History',
    '',
    `Throughput for the \`${HISTORY_SCENARIO}\` scenario on ${HISTORY_FORMAT.toUpperCase()} events (ops/sec), one row per release:`,
    '',
    historyTable,
    '',
    END
  ].join('\n');
}

/**
 * @param {{ readmePath: string, results: Array, env: object }} args
 * @returns {{ changed: boolean, action: 'replaced'|'appended' }}
 */
function updateReadme({ readmePath, results, env }) {
  const existing = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf8') : '';

  const prevRows = extractHistoryRows(existing);
  const current = buildHistoryRow(results, env);
  const historyTable = renderHistoryTable(prevRows, current);
  const section = buildSection(results, env, historyTable);

  const s = existing.indexOf(START);
  const e = existing.indexOf(END);

  let next;
  let action;
  if (s !== -1 && e !== -1 && e > s) {
    next = existing.slice(0, s) + section + existing.slice(e + END.length);
    action = 'replaced';
  } else {
    const prefix = existing.length ? existing.replace(/\s*$/, '') + '\n\n' : '';
    next = prefix + section + '\n';
    action = 'appended';
  }

  const changed = next !== existing;
  if (changed) fs.writeFileSync(readmePath, next);
  return { changed, action };
}

module.exports = { updateReadme, START, END };
