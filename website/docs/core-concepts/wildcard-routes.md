---
title: Wildcard Routes
description: Match arbitrary and deep paths in Lambda API using wildcard routes, including OPTIONS handling and CORS use cases.
---

Wildcard routes are supported for matching arbitrary paths. Wildcards only work at the _end of a route definition_ such as `/*` or `/users/*`. Wildcards within a path, e.g. `/users/*/posts` are not supported. Wildcard routes do support parameters, however, so `/users/:id/*` would capture the `:id` parameter in your wildcard handler.

Wildcard routes will match any deep paths after the wildcard. For example, a `GET` method for path `/users/*` would match `/users/1/posts/latest`. The only exception is for the `OPTIONS` method. A path **must** exist for a wildcard on an `OPTIONS` route in order to execute the handler. If a wildcard route is defined for another method higher up the path, then the `OPTIONS` handler will fire. For example, if there was a `POST` method defined on `/users/*`, then an `OPTIONS` method for `/users/2/posts/*` would fire as it assumes that the `POST` path would exist.

In most cases, [Path Parameters](/docs/core-concepts/path-parameters) should be used in favor of wildcard routes. However, if you need to support unpredictable path lengths, or your are building single purpose functions and will be mapping routes from API Gateway, the wildcards are a powerful pattern. Another good use case is to use the `OPTIONS` method to provide CORS headers.

```javascript
api.options('/*', (req, res) => {
  // Return CORS headers
  res.cors().send({});
});
```
