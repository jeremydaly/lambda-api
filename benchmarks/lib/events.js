'use strict';

/**
 * Synthetic API Gateway event builders for the benchmark suite.
 *
 * Seeded from the real shapes in __tests__/sample-event-apigateway-v{1,2}.json but
 * trimmed to the fields that lambda-api and the comparison adapters actually read, so
 * every framework performs equivalent work. The method / path / body are overridden per
 * scenario; everything else is realistic boilerplate.
 *
 * @author Benchmark suite for lambda-api (issue #34)
 * @license MIT
 */

const V1_HEADERS = {
  'content-type': 'application/json',
  accept: 'application/json',
  host: 'wt6mne2s9k.execute-api.us-west-2.amazonaws.com',
  'user-agent': 'lambda-api-benchmarks',
  'x-forwarded-for': '192.168.100.1',
  'x-forwarded-port': '443',
  'x-forwarded-proto': 'https'
};

const V2_HEADERS = {
  'content-type': 'application/json',
  accept: 'application/json',
  host: 'id.execute-api.us-east-1.amazonaws.com',
  'user-agent': 'lambda-api-benchmarks',
  'x-forwarded-for': '192.168.100.1',
  'x-forwarded-port': '443',
  'x-forwarded-proto': 'https'
};

function serializeBody(body) {
  if (body === null || body === undefined) return null;
  return typeof body === 'string' ? body : JSON.stringify(body);
}

/**
 * Build an API Gateway REST (v1 / proxy) event.
 * @param {{ method?: string, path?: string, body?: any }} opts
 */
function apiGatewayV1({ method = 'GET', path = '/', body = null } = {}) {
  const multiValueHeaders = {};
  for (const key of Object.keys(V1_HEADERS)) multiValueHeaders[key] = [V1_HEADERS[key]];

  return {
    resource: path,
    path,
    httpMethod: method,
    headers: { ...V1_HEADERS },
    multiValueHeaders,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '123456789012',
      stage: 'test',
      httpMethod: method,
      path,
      resourcePath: path,
      identity: { sourceIp: '192.168.100.12' },
      requestId: 'bench-request-id',
      apiId: 'wt6mne2s9k'
    },
    body: serializeBody(body),
    isBase64Encoded: false
  };
}

/**
 * Build an API Gateway HTTP (v2) event.
 * @param {{ method?: string, path?: string, body?: any }} opts
 */
function apiGatewayV2({ method = 'GET', path = '/', body = null } = {}) {
  return {
    version: '2.0',
    routeKey: '$default',
    rawPath: path,
    rawQueryString: '',
    headers: { ...V2_HEADERS },
    requestContext: {
      accountId: '123456789012',
      apiId: 'api-id',
      domainName: 'id.execute-api.us-east-1.amazonaws.com',
      domainPrefix: 'id',
      http: {
        method,
        path,
        protocol: 'HTTP/1.1',
        sourceIp: '192.168.100.12',
        userAgent: 'lambda-api-benchmarks'
      },
      requestId: 'bench-request-id',
      routeKey: '$default',
      stage: '$default',
      time: '12/Mar/2020:19:03:58 +0000',
      timeEpoch: 1583348638390
    },
    body: serializeBody(body),
    isBase64Encoded: false
  };
}

module.exports = { apiGatewayV1, apiGatewayV2 };
