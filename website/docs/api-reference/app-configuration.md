---
title: App Configuration Options
description: Reference table of options passed when initializing a lambda-api instance.
---

These options are passed to `require('lambda-api')({ ... })` when you instantiate the API.

| Property             | Type                  | Description                                                                                                                                                                                               |
| -------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| base                 | `String`              | Base path for all routes, e.g. `base: 'v1'` would prefix all routes with `/v1`                                                                                                                            |
| callbackName         | `String`              | Override the default callback query parameter name for JSONP calls                                                                                                                                        |
| logger               | `boolean` or `object` | Enables default [logging](/docs/logging/overview) or allows for configuration through a Logging Configuration object.                                                                                     |
| mimeTypes            | `Object`              | Name/value pairs of additional MIME types to be supported by the `type()`. The key should be the file extension (without the `.`) and the value should be the expected MIME type, e.g. `application/json` |
| serializer           | `Function`            | Optional object serializer function. This function receives the `body` of a response and must return a string. Defaults to `JSON.stringify`                                                               |
| version              | `String`              | Version number accessible via the `REQUEST` object                                                                                                                                                        |
| errorHeaderWhitelist | `Array`               | Array of headers to maintain on errors                                                                                                                                                                    |
| s3Config             | `Object`              | Optional object to provide as config to S3 sdk. [S3ClientConfig](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/s3clientconfig.html)                                 |

See the full [Configuration](/docs/core-concepts/configuration) guide for details and examples.
