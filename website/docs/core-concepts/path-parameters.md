---
title: Path Parameters
description: Capture dynamic values from request paths in Lambda API using colon-prefixed path parameters.
---

Path parameters are extracted from the path sent in by API Gateway. Although API Gateway supports path parameters, the API doesn't use these values but insteads extracts them from the actual path. This gives you more flexibility with the API Gateway configuration. Path parameters are defined in routes using a colon `:` as a prefix.

```javascript
api.get('/users/:userId', (req, res) => {
  res.send('User ID: ' + req.params.userId);
});
```

Path parameters act as wildcards that capture the value into the `params` object. The example above would match `/users/123` and `/users/test`. The system always looks for static paths first, so if you defined paths for `/users/test` and `/users/:userId`, exact path matches would take precedence. Path parameters only match the part of the path they are defined on. E.g. `/users/456/test` would not match `/users/:userId`. You would either need to define `/users/:userId/test` as its own path, or create another path with an additional path parameter, e.g. `/users/:userId/:anotherParam`.

A path can contain as many parameters as you want. E.g. `/users/:param1/:param2/:param3`.

For matching arbitrary or deep paths, see [Wildcard Routes](/docs/core-concepts/wildcard-routes).
