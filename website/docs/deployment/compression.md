---
title: Compression
description: Return Gzip, Deflate, or Brotli compressed responses from your Lambda API function.
---

Currently, API Gateway HTTP APIs do not support automatic compression, but that doesn't mean the Lambda can't return a compressed response. Lambda API supports compression out of the box:

```javascript
const api = require('lambda-api')({
  compression: true,
});
```

The response will automatically be compressed based on the `Accept-Encoding` header in the request. Supported compressions are Gzip and Deflate, with opt-in support for Brotli:

```javascript
const api = require('lambda-api')({
  compression: ['br', 'gzip'],
});
```

:::caution

Brotli compression is significantly slower than Gzip due to its CPU intensive algorithm. Please test extensively before enabling on a production environment.

:::

For full control over the response compression, instantiate the API with `isBase64` set to true, and a custom serializer that returns a compressed response as a base64 encoded string. Also, don't forget to set the correct `content-encoding` header:

```javascript
const zlib = require('zlib');

const api = require('lambda-api')({
  isBase64: true,
  headers: {
    'content-encoding': ['gzip'],
  },
  serializer: (body) => {
    const json = JSON.stringify(body);
    return zlib.gzipSync(json).toString('base64');
  },
});
```
