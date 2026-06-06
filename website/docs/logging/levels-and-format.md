---
title: Levels & Format
description: Understand Lambda API's JSON log format, access logs, standard logging levels, and custom levels.
---

## Log Format

Logs are generated using Lambda API's standard JSON format. The log format can be customized using [Serializers](/docs/logging/serializers-and-detail).

**Standard log format (manual logging):**

```javascript
  {
    "level": "info", // log level
    "time": 1534724904910, // request timestamp
    "id": "41b45ea3-70b5-11e6-b7bd-69b5aaebc7d9", // awsRequestId
    "route": "/user/:userId", // route accessed
    "method": "GET", // request method
    "msg": "Some info about this route", // log message
    "timer": 2, // execution time up until log was generated
    "custom": "additional data", // addditional custom log detail
    "remaining": 2000, // remaining milliseconds until function timeout
    "function": "my-function-v1", // function name
    "memory": 2048, // allocated function memory
    "int": "apigateway", // interface used to access the Lambda function
    "sample": true // is generated during sampling request?
  }
```

## Access Logs

Access logs generate detailed information about the API request. Access logs are disabled by default, but can be enabled by setting the `access` property to `true` in the logging configuration object. If set to `false`, access logs will _only_ be generated when other log entries (`info`, `error`, etc.) are created. If set to the string `'never'`, access logs will never be generated.

Access logs use the same format as the standard logs above, but include additional information about the request. The access log format can be customized using [Serializers](/docs/logging/serializers-and-detail).

**Access log format (automatic logging):**

```javascript
  {
    ... Standard Log Data ...,
    "path": "/user/123", // path accessed
    "ip": "12.34.56.78", // client ip address
    "ua": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6)...", // User-Agent
    "version": "v1", // specified API version
    "device": "mobile", // client device (as determined by CloudFront)
    "country": "US", // client country (as determined by CloudFront)
    "qs": { // query string parameters
      "foo": "bar"
    }
  }
```

## Logging Levels

Logging "levels" allow you to add detailed logging to your functions based on severity. There are six standard log levels as specified in the table below along with their default priority.

| Level   | Priority |
| ------- | -------- |
| `trace` | 10       |
| `debug` | 20       |
| `info`  | 30       |
| `warn`  | 40       |
| `error` | 50       |
| `fatal` | 60       |

Logs are written to CloudWatch Logs _ONLY_ if they are the same or higher severity than specified in the `level` log configuration.

```javascript
// Logging level set to "warn"
const api = require('lambda-api')({ logger: { level: 'warn' } });

api.get('/', (req, res) => {
  req.log.trace('trace log message'); // ignored
  req.log.debug('debug log message'); // ignored
  req.log.info('info log message'); // ignored
  req.log.warn('warn log message'); // write to CloudWatch
  req.log.error('error log message'); // write to CloudWatch
  req.log.fatal('fatal log message'); // write to CloudWatch
  res.send({ hello: 'world' });
});
```

## Custom Logging Levels

Custom logging "levels" can be added by specifying an object containing "level names" as keys and their priorities as values. You can also adjust the priority of standard levels by adding it to the object.

```javascript
const api = require('lambda-api')({
  logger: {
    levels: {
      test: 5, // low priority 'test' level
      customLevel: 35, // between info and warn
      trace: 70, // set trace to the highest priority
    },
  },
});
```

In the example above, the `test` level would only generate logs if the priority was set to `test`. `customLevel` would generate logs if `level` was set to anything with the same or lower priority (e.g. `info`). `trace` now has the highest priority and would generate a log entry no matter what the level was set to.
