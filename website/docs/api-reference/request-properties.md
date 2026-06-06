---
title: Request Properties
description: Reference table of all properties available on the lambda-api REQUEST object.
---

The `REQUEST` object contains a parsed and normalized request from API Gateway. It contains the following values by default.

| Property | Description |
| -------- | ----------- |
| `app` | A reference to an instance of the app |
| `version` | The version set at initialization |
| `id` | The `awsRequestId` from the Lambda `context` |
| `interface` | The interface being used to access Lambda (`apigateway`, `alb`, or `edge`) |
| `params` | Dynamic path parameters parsed from the path (see [path parameters](/docs/core-concepts/path-parameters)) |
| `method` | The HTTP method of the request |
| `path` | The path passed in by the request including the `base` and any `prefix` assigned to routes |
| `query` | Querystring parameters parsed into an object |
| `multiValueQuery` | Querystring parameters with multiple values parsed into an object with array values |
| `headers` | An object containing the request headers (keys lowercased for HTTP/2; multi-value headers concatenated with a comma) |
| `rawHeaders` | An object containing the original request headers (property case preserved) |
| `multiValueHeaders` | An object containing header values as multi-value arrays |
| `body` | The body of the request, automatically decoded if base64-encoded and parsed based on `content-type` (`JSON.parse` for JSON, `querystring` for URL-encoded, otherwise plain text) |
| `rawBody` | If `isBase64Encoded` is `true`, a copy of the original, base64-encoded body |
| `route` | The matched route of the request |
| `requestContext` | The `requestContext` passed from the API Gateway |
| `pathParameters` | The `pathParameters` passed from the API Gateway |
| `stageVariables` | The `stageVariables` passed from the API Gateway |
| `isBase64Encoded` | The `isBase64Encoded` boolean passed from the API Gateway |
| `auth` | An object with the `type` and `value` of an authorization header. Supports `Bearer`, `Basic`, `OAuth`, and `Digest` schemas |
| `namespace` or `ns` | A reference to modules added to the app's namespace (see [namespaces](/docs/core-concepts/namespaces)) |
| `cookies` | An object containing cookies sent from the browser |
| `context` | Reference to the `context` passed into the Lambda handler function |
| `coldStart` | Boolean indicating whether the current invocation was a cold start |
| `requestCount` | Integer of total invocations of the current function container (how many times it has been reused) |
| `ip` | The IP address of the client making the request |
| `userAgent` | The `User-Agent` header sent by the client making the request |
| `clientType` | Either `desktop`, `mobile`, `tv`, `tablet`, or `unknown` based on CloudFront's analysis of the `User-Agent` header |
| `clientCountry` | Two-letter country code representing the origin of the request as determined by CloudFront |
| `stack` | An array of function names executed as part of a route's Execution Stack, useful for debugging |

See the full [Request Object](/docs/request-response/request-object) guide for details and examples.
