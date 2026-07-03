# lambda-api benchmarks

A repeatable comparison of **lambda-api** against other popular frameworks running on AWS
Lambda.

This is an isolated package — its (heavy) comparison-framework dependencies live here and
never touch the zero-dependency root library. It is excluded from the published npm tarball
by the root `package.json` `files` whitelist.

```bash
cd benchmarks
npm install
npm run bench            # print results to stdout
npm run bench:md         # also write results/RESULTS.md
npm run bench:release    # write md + json and refresh the README Benchmarks section
```

## What this measures

Each framework's compiled `aws-lambda` handler is invoked **in-process** — in the same Node
VM — with identical synthetic API Gateway events. We measure the **framework overhead** of a
request: parse the event → match a route → run middleware → serialize the response. That is
the work the maintainer clocked at ~0.68 ms per request, and the thing this suite resolves.

For every `(framework × scenario × event format)` cell, the handler is first run once and its
response is checked by a **correctness gate** (`lib/validate.js`) — status code, and body
fields where applicable. Only cells that pass are timed, so we never publish a number for a
framework that is silently 404-ing, throwing, or returning the wrong shape.

Measurement uses [mitata](https://github.com/evanwashere/mitata), which calibrates clock
overhead, warms up the JIT, and auto-tunes iteration counts for sub-microsecond accuracy.

## Why in-process, and not LocalStack or a real Lambda deploy

The signal we care about is sub-millisecond. LocalStack and real Lambda wrap that signal in:

- Docker / Firecracker container startup and the Node runtime bootstrap (cold start),
- the Lambda Runtime API request loop,
- network latency to the function URL / API Gateway.

That is **tens of milliseconds of noise** — 10–100× the thing we are trying to compare. Worse,
LocalStack would be benchmarking the _emulator_, not the framework, and shared CI runners make
absolute numbers non-reproducible. So the in-process harness is the right primary tool: it
isolates framework overhead, is deterministic, needs no Docker, and runs in seconds.

End-to-end Lambda timings (cold/warm `Duration`, `Init Duration`) are a **different, valid**
question — see the [real-Lambda appendix](#appendix-end-to-end-real-lambda-numbers) below — but
they answer "how fast is my whole deployment", not "how much overhead does the framework add".

## Frameworks compared

| key                  | package                                 | adapter                |
| -------------------- | --------------------------------------- | ---------------------- |
| `baseline`           | — (hand-written handler)                | none — the lower bound |
| `lambda-api`         | this repo (loaded from the working tree)| native `api.run()`     |
| `serverless-express` | `express` + `@vendia/serverless-express`| `serverlessExpress()`  |
| `fastify`            | `fastify` + `@fastify/aws-lambda`       | `awsLambdaFastify()`   |
| `hono`               | `hono`                                  | `hono/aws-lambda`      |
| `middy`              | `@middy/core` + `@middy/http-router`    | `httpRouterHandler()`  |

`baseline` is a raw handler with zero routing abstraction; every other framework's overhead is
read as the gap above it.

## Scenarios

Each framework registers the **same** canonical routes, configured as minimally and equally as
possible (JSON responses, no extra middleware). All scenarios run against both **API Gateway
REST (v1)** and **HTTP API (v2)** events.

| id           | request                              | checks            |
| ------------ | ------------------------------------ | ----------------- |
| `get-json`   | `GET /`                              | 200, `{hello}`    |
| `path-param` | `GET /users/42`                      | 200, `{id:'42'}`  |
| `post-json`  | `POST /users` with a JSON body       | 200, echoes body  |
| `routing-50` | `GET /r49/x` (50 routes registered)  | 200 — routing cost|
| `not-found`  | `GET /does-not-exist`                | 404               |

## Fairness notes

- Frameworks are configured minimally and equivalently — the goal is to compare core overhead,
  not feature sets. Defaults still differ (e.g. lambda-api computes an `ETag` and handles
  serialization itself; Express needs an explicit `express.json()` and a 404 handler; Middy is a
  middleware engine wired with only `http-router` + a per-route JSON body parser + an error
  handler, and is otherwise a very thin layer), and those differences are part of what the numbers
  reflect. Read the `frameworks/*.js` to see exactly how each is set up.
- Absolute ops/sec depend on the machine. **Compare the relative ranking**, not raw numbers.
- All frameworks run in one process by default. Pass `--framework <name>` to run a single one in
  its own process — used for published numbers — to avoid cross-framework JIT interference.

## CLI

```
node run.js [options]

  --framework <name>   run a single framework (baseline | lambda-api | serverless-express
                       | fastify | hono | middy); also gives clean per-process JIT isolation
  --md <path>          write the markdown report to a file (relative to benchmarks/)
  --json <path>        dump raw per-cell stats as JSON
  --update-readme      refresh the Benchmarks section in ../README.md (full run only)
```

The version label recorded in the README history can be overridden with the
`LAMBDA_API_VERSION` environment variable (the release workflow sets this from the release tag).

## How the README stays up to date

`.github/workflows/benchmark.yml` runs on every published release (and via manual dispatch). It
runs the suite on Node 20, calls `--update-readme`, Prettier-formats the README, commits it back
to the default branch, and uploads `results/` as an artifact. The Benchmarks section lives
between `<!-- BENCHMARKS:START -->` / `<!-- BENCHMARKS:END -->` markers and is regenerated in
place, with one history row appended per release. Move that marker block anywhere in the README
once; future runs respect its position.

## Adding a framework

1. Create `frameworks/<name>.js` exporting `{ name, version, build }`, where `build()` returns
   (or resolves to) an async `(event, context) => apiGatewayResponse` handler with the canonical
   routes registered. Use `await import()` for ESM-only packages (see `frameworks/hono.js`).
2. Add `<name>` to `ALL_FRAMEWORKS` in `run.js`.
3. Add its dependency to `package.json` and re-run `npm install`.

## Appendix: end-to-end (real Lambda) numbers

To measure cold/warm start and total billed duration — which include infrastructure, not just
framework overhead — deploy each `frameworks/*.js` handler behind API Gateway with AWS SAM or the
Serverless Framework, then:

- drive warm throughput with a load tool (e.g. `autocannon` / `artillery`) against the API URL, or
- loop `aws lambda invoke` for controlled single invocations,
- and read `Duration` / `Init Duration` from the CloudWatch `REPORT` log lines.

These are deliberately **not** part of the in-process suite: they answer a different question and
are not reproducible on shared CI. Label any such results clearly as end-to-end, infra-inclusive.
