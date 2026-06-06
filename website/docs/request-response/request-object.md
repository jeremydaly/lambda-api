---
title: The REQUEST Object
description: Reference for the parsed and normalized REQUEST object provided by Lambda API on every request.
---

The `REQUEST` object contains a parsed and normalized request from API Gateway. It contains the following values by default:

- `app`: A reference to an instance of the app
- `version`: The version set at initialization
- `id`: The awsRequestId from the Lambda `context`
- `interface`: The interface being used to access Lambda (`apigateway`,`alb`, or `edge`)
- `params`: Dynamic path parameters parsed from the path (see [path parameters](/docs/core-concepts/path-parameters))
- `method`: The HTTP method of the request
- `path`: The path passed in by the request including the `base` and any `prefix` assigned to routes
- `query`: Querystring parameters parsed into an object
- `multiValueQuery`: Querystring parameters with multiple values parsed into an object with array values
- `headers`: An object containing the request headers (properties converted to lowercase for HTTP/2, see [rfc7540 8.1.2. HTTP Header Fields](https://tools.ietf.org/html/rfc7540)). Note that multi-value headers are concatenated with a comma per [rfc2616 4.2. Message Headers](https://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2).
- `rawHeaders`: An object containing the original request headers (property case preserved)
- `multiValueHeaders`: An object containing header values as multi-value arrays
- `body`: The body of the request. If the `isBase64Encoded` flag is `true`, it will be decoded automatically.
  - If the `content-type` header is `application/json`, it will attempt to parse the request using `JSON.parse()`
  - If the `content-type` header is `application/x-www-form-urlencoded`, it will attempt to parse a URL encoded string using `querystring`
  - Otherwise it will be plain text.
- `rawBody`: If the `isBase64Encoded` flag is `true`, this is a copy of the original, base64 encoded body
- `route`: The matched route of the request
- `requestContext`: The `requestContext` passed from the API Gateway
- `pathParameters`: The `pathParameters` passed from the API Gateway
- `stageVariables`: The `stageVariables` passed from the API Gateway
- `isBase64Encoded`: The `isBase64Encoded` boolean passed from the API Gateway
- `auth`: An object containing the `type` and `value` of an authorization header. Currently supports `Bearer`, `Basic`, `OAuth`, and `Digest` schemas. For the `Basic` schema, the object is extended with additional fields for username/password. For the `OAuth` schema, the object is extended with key/value pairs of the supplied OAuth 1.0 values.
- `namespace` or `ns`: A reference to modules added to the app's namespace (see [namespaces](/docs/core-concepts/namespaces))
- `cookies`: An object containing cookies sent from the browser (see the [cookie](/docs/request-response/headers-and-cookies) `RESPONSE` method)
- `context`: Reference to the `context` passed into the Lambda handler function
- `coldStart`: Boolean that indicates whether or not the current invocation was a cold start
- `requestCount`: Integer representing the total number of invocations of the current function container (how many times it has been reused)
- `ip`: The IP address of the client making the request
- `userAgent`: The `User-Agent` header sent by the client making the request
- `clientType`: Either `desktop`, `mobile`, `tv`, `tablet` or `unknown` based on CloudFront's analysis of the `User-Agent` header
- `clientCountry`: Two letter country code representing the origin of the requests as determined by CloudFront
- `stack`: An array of function names executed as part of a route's [Execution Stack](/docs/core-concepts/execution-stacks), which is useful for debugging

The request object can be used to pass additional information through the processing chain. For example, if you are using a piece of authentication middleware, you can add additional keys to the `REQUEST` object with information about the user. See [middleware](/docs/middleware-errors/middleware) for more information.
