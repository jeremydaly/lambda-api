---
title: Serializers & Detail
description: Add extra detail to log entries and customize log output with Lambda API serializers.
---

## Adding Additional Detail

Manual logging also allows you to specify additional detail with each log entry. Details can be added by suppling _any variable type_ as a second parameter to the logger function.

```javascript
req.log.info('This is the main log message', 'some other detail'); // string
req.log.info('This is the main log message', {
  foo: 'bar',
  isAuthorized: someVar,
}); // object
req.log.info('This is the main log message', 25); // number
req.log.info('This is the main log message', ['val1', 'val2', 'val3']); // array
req.log.info('This is the main log message', true); // boolean
```

If an `object` is provided, the keys will be merged into the main log entry's JSON. If any other `type` is provided, the value will be assigned to a key using the the `customKey` setting as its property name. If `nested` is set to `true`, objects will be nested under the value of `customKey` as well.

## Serializers

Serializers allow you to customize log formats as well as add additional data from your application. Serializers can be defined by adding a `serializers` property to the `logger` configuration object. A property named for an available serializer (`main`, `req`, `res`, `context` or `custom`) needs to return an anonymous function that takes one argument and returns an object. The returned object will be merged into the main JSON log entry. Existing properties can be removed by returning `undefined` as their values.

```javascript
const api = require('lambda-api')({
  logger: {
    serializers: {
      req: (req) => {
        return {
          apiId: req.requestContext.apiId, // add the apiId
          stage: req.requestContext.stage, // add the stage
          qs: undefined, // remove the query string
        };
      },
    },
  },
});
```

Serializers are passed one argument that contains their corresponding object. `req` _and_ `main` receive the `REQUEST` object, `res` receives the `RESPONSE` object, `context` receives the `context` object passed into the main `run` function, and `custom` receives custom data passed in to the logging methods. Note that only custom `objects` will trigger the `custom` serializer.

If the `nested` option is set to true in the `logger` configuration, then JSON log entries will be generated with properties for `req`, `res`, `context` and `custom` with their serialized data as nested objects.
