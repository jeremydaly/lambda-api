'use strict';

/**
 * lambda-api benchmark runner.
 *
 * Invokes each framework's compiled aws-lambda handler IN-PROCESS with identical synthetic
 * API Gateway events and measures framework overhead with mitata. This deliberately avoids
 * LocalStack / a real Lambda deploy: those wrap the sub-millisecond work we care about in
 * Docker, the runtime bootstrap and network latency — tens of milliseconds of noise that
 * would swamp the signal and measure the emulator, not the framework. See README.md.
 *
 * Usage:
 *   node run.js                         run every framework, print tables to stdout
 *   node run.js --framework lambda-api  run a single framework (clean JIT isolation)
 *   node run.js --md results/RESULTS.md write the markdown report to a file
 *   node run.js --json results/raw.json dump raw per-cell stats (machine-readable)
 *   node run.js --update-readme         refresh the Benchmarks section in ../README.md
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

const { apiGatewayV1, apiGatewayV2 } = require('./lib/events');
const { scenarios } = require('./lib/scenarios');
const validate = require('./lib/validate');
const { renderTables } = require('./lib/table');
const { updateReadme } = require('./lib/update-readme');

const ALL_FRAMEWORKS = ['baseline', 'lambda-api', 'serverless-express', 'fastify', 'hono', 'middy'];

const FORMATS = [
  { id: 'v1', build: apiGatewayV1 },
  { id: 'v2', build: apiGatewayV2 }
];

// Minimal but realistic Lambda context. Some adapters read getRemainingTimeInMillis().
const CONTEXT = {
  awsRequestId: 'benchmark-request',
  functionName: 'lambda-api-benchmark',
  functionVersion: '$LATEST',
  memoryLimitInMB: '1024',
  callbackWaitsForEmptyEventLoop: false,
  getRemainingTimeInMillis: () => 30000
};

function parseArgs(argv) {
  const opts = { md: null, json: null, updateReadme: false, framework: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--md') opts.md = argv[++i];
    else if (a === '--json') opts.json = argv[++i];
    else if (a === '--update-readme') opts.updateReadme = true;
    else if (a === '--framework') opts.framework = argv[++i];
    else if (a === '--help' || a === '-h') opts.help = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  return opts;
}

function collectEnv() {
  const cpus = os.cpus();
  const now = new Date();
  return {
    lambdaApiVersion: process.env.LAMBDA_API_VERSION || require('../package.json').version,
    node: process.version.replace(/^v/, ''),
    platform: process.platform,
    arch: process.arch,
    cpu: cpus && cpus.length ? `${cpus[0].model.trim()} (${cpus.length} cores)` : 'unknown',
    date: now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    dateShort: now.toISOString().slice(0, 10)
  };
}

function eventFor(format, scenario) {
  return format.build({ method: scenario.method, path: scenario.path, body: scenario.body || null });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(6, 24).join('\n'));
    return;
  }

  const names = opts.framework ? [opts.framework] : ALL_FRAMEWORKS;
  const env = collectEnv();

  // mitata is ESM-only; load it from CommonJS via dynamic import.
  const { measure } = await import('mitata');

  console.error(`\nlambda-api benchmarks — Node ${env.node} on ${env.cpu}`);
  console.error(`frameworks: ${names.join(', ')}\n`);

  const results = [];

  for (const name of names) {
    const fw = require(`./frameworks/${name}`);
    const handler = await fw.build();
    console.error(`▸ ${name}${fw.version !== '-' ? ' ' + fw.version : ''}`);

    for (const format of FORMATS) {
      for (const scenario of scenarios) {
        const event = eventFor(format, scenario);
        const ctx = `${name}/${format.id}/${scenario.id}`;

        // Correctness gate first — never time a handler that fails the contract.
        let ok = true;
        try {
          const res = await handler(event, CONTEXT);
          validate(res, scenario.expect, ctx);
        } catch (err) {
          ok = false;
          console.error(`  ! skipped ${format.id}/${scenario.id}: ${err.message}`);
        }

        let stats = null;
        if (ok) {
          // mitata detects the returned Promise and awaits it; handles warmup + batching.
          stats = await measure(() => handler(event, CONTEXT));
          const ops = Math.round(1e9 / stats.avg).toLocaleString('en-US');
          console.error(`  ✓ ${format.id}/${scenario.id}: ${ops} ops/sec`);
        }

        results.push({
          framework: name,
          version: fw.version,
          format: format.id,
          scenario: scenario.id,
          ok,
          stats: stats && {
            avg: stats.avg,
            min: stats.min,
            max: stats.max,
            p50: stats.p50,
            p75: stats.p75,
            p99: stats.p99
          }
        });
      }
    }
  }

  const markdown = renderTables(results, env);
  console.log('\n' + markdown);

  if (opts.md) {
    const dest = path.resolve(__dirname, opts.md);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, `# lambda-api benchmark results\n\n${markdown}`);
    console.error(`\nwrote ${opts.md}`);
  }

  if (opts.json) {
    const dest = path.resolve(__dirname, opts.json);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, JSON.stringify({ env, results }, null, 2));
    console.error(`wrote ${opts.json}`);
  }

  if (opts.updateReadme) {
    if (opts.framework) {
      console.error('refusing --update-readme with --framework (partial results)');
    } else {
      const readmePath = path.resolve(__dirname, '..', 'README.md');
      const { changed, action } = updateReadme({ readmePath, results, env });
      console.error(`README.md ${changed ? action : 'unchanged'}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
