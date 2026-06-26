'use strict';

/**
 * Correctness gate. Runs once per (framework, scenario, event format) BEFORE timing.
 *
 * Guarantees we never benchmark a handler that is silently returning the wrong status,
 * throwing, or emitting the wrong body — a classic way framework comparisons become
 * dishonest. Throws a descriptive Error on any mismatch; the runner catches it, marks
 * that cell as failed, and excludes it from the results (rather than crashing the suite).
 */

/**
 * @param {object} response - the Lambda proxy response returned by the handler
 * @param {{ status: number, body?: object }} expect - expected status and (optional) body fields
 * @param {string} ctx - "framework/format/scenario" label for error messages
 */
function validate(response, expect, ctx) {
  if (!response || typeof response !== 'object') {
    throw new Error(`${ctx}: handler returned ${typeof response}, expected a response object`);
  }

  if (response.statusCode !== expect.status) {
    throw new Error(`${ctx}: expected statusCode ${expect.status}, got ${response.statusCode}`);
  }

  if (expect.body) {
    let parsed;
    try {
      parsed = JSON.parse(response.body);
    } catch (err) {
      throw new Error(`${ctx}: response body is not valid JSON (${err.message}): ${response.body}`);
    }

    for (const key of Object.keys(expect.body)) {
      const got = JSON.stringify(parsed[key]);
      const want = JSON.stringify(expect.body[key]);
      if (got !== want) {
        throw new Error(`${ctx}: body.${key} expected ${want}, got ${got}`);
      }
    }
  }

  return true;
}

module.exports = validate;
