'use strict';

/**
 * Renders benchmark results into GitHub-flavored markdown.
 *
 * Layout: one throughput table per event format (rows = framework, columns = scenario),
 * each followed by a collapsible latency table (avg / p99). Rows are sorted by the
 * `get-json` throughput, descending.
 *
 * @author Benchmark suite for lambda-api (issue #34)
 * @license MIT
 */

const { scenarios } = require('./scenarios');

const FORMAT_LABELS = {
  v1: 'API Gateway REST (v1)',
  v2: 'API Gateway HTTP (v2)'
};

function opsPerSec(stats) {
  return stats && stats.avg ? 1e9 / stats.avg : 0;
}

function fmtOps(n) {
  if (!n) return 'n/a';
  return Math.round(n).toLocaleString('en-US');
}

function fmtUs(ns) {
  if (!ns) return 'n/a';
  const us = ns / 1000;
  if (us >= 100) return us.toFixed(0);
  if (us >= 10) return us.toFixed(1);
  return us.toFixed(2);
}

function cell(results, framework, format, scenarioId) {
  return results.find(
    (r) => r.framework === framework && r.format === format && r.scenario === scenarioId
  );
}

// Unique framework metadata ({ name, version }) in the order first seen.
function frameworkMeta(results) {
  const seen = new Map();
  for (const r of results) {
    if (!seen.has(r.framework)) seen.set(r.framework, { name: r.framework, version: r.version });
  }
  return [...seen.values()];
}

function label(meta) {
  return meta.version && meta.version !== '-' ? `${meta.name} \`${meta.version}\`` : meta.name;
}

function toMarkdown(header, rows) {
  const lines = [];
  lines.push(`| ${header.join(' | ')} |`);
  lines.push(`| ${header.map(() => '---').join(' | ')} |`);
  for (const row of rows) lines.push(`| ${row.join(' | ')} |`);
  return lines.join('\n');
}

function buildTable(results, frameworks, format, render) {
  const ordered = [...frameworks].sort((a, b) => {
    const ca = cell(results, a.name, format, 'get-json');
    const cb = cell(results, b.name, format, 'get-json');
    return opsPerSec(cb && cb.stats) - opsPerSec(ca && ca.stats);
  });

  const header = ['Framework', ...scenarios.map((s) => s.id)];
  const rows = ordered.map((meta) => {
    const cells = scenarios.map((s) => {
      const c = cell(results, meta.name, format, s.id);
      return c && c.ok && c.stats ? render(c.stats) : 'n/a';
    });
    return [label(meta), ...cells];
  });
  return toMarkdown(header, rows);
}

function envHeader(env) {
  return (
    `_Generated ${env.date} · lambda-api v${env.lambdaApiVersion} · ` +
    `Node ${env.node} · ${env.cpu} · ${env.platform}/${env.arch}_`
  );
}

/**
 * @param {Array} results - the runner's result rows
 * @param {object} env - environment metadata from the runner
 * @param {string[]} formats - event format ids to render (default ['v1','v2'])
 * @returns {string} markdown
 */
function renderTables(results, env, formats = ['v1', 'v2']) {
  const frameworks = frameworkMeta(results);
  const out = [envHeader(env), ''];

  for (const format of formats) {
    out.push(`#### ${FORMAT_LABELS[format] || format} — throughput (ops/sec, higher is better)`);
    out.push('');
    out.push(buildTable(results, frameworks, format, (s) => fmtOps(opsPerSec(s))));
    out.push('');
    out.push(`<details><summary>${FORMAT_LABELS[format] || format} — latency (avg / p99, µs, lower is better)</summary>`);
    out.push('');
    out.push(buildTable(results, frameworks, format, (s) => `${fmtUs(s.avg)} / ${fmtUs(s.p99)}`));
    out.push('');
    out.push('</details>');
    out.push('');
  }

  return out.join('\n').trim() + '\n';
}

module.exports = { renderTables, opsPerSec, fmtOps, fmtUs, FORMAT_LABELS };
