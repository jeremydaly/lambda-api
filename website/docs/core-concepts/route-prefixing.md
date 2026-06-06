---
title: Route Prefixing
description: Use register() to load routes from external files and prefix them, enabling multiple API versions without rewriting routes.
---

Lambda API makes it easy to create multiple versions of the same api without changing routes by hand. The `register()` method allows you to load routes from an external file and prefix all of those routes using the `prefix` option. For example:

```javascript
// handler.js
const api = require('lambda-api')();

api.register(require('./routes/v1/products'), { prefix: '/v1' });
api.register(require('./routes/v2/products'), { prefix: '/v2' });

module.exports.handler = (event, context, callback) => {
  api.run(event, context, callback);
};
```

```javascript
// routes/v1/products.js
module.exports = (api, opts) => {
  api.get('/product', handler_v1);
};
```

```javascript
// routes/v2/products.js
module.exports = (api, opts) => {
  api.get('/product', handler_v2);
};
```

Even though both modules create a `/product` route, Lambda API will add the `prefix` to them, creating two unique routes. Your users can now access:

- `/v1/product`
- `/v2/product`

You can use `register()` as many times as you want AND it is recursive, so if you nest `register()` methods, the routes will build upon each other. For example:

```javascript
module.exports = (api, opts) => {
  api.get('/product', handler_v1);
  api.register(require('./v2/products.js'), { prefix: '/v2' });
};
```

This would create a `/v1/product` and `/v1/v2/product` route. You can also use `register()` to load routes from an external file without the `prefix`. This will just add routes to your `base` path.

:::note
Prefixed routes are built off of your `base` path if one is set. If your `base` was set to `/api`, then the first example above would produce the routes: `/api/v1/product` and `/api/v2/product`.
:::
