---
title: CORS Support
description: Implement CORS in Lambda API using wildcard OPTIONS routes or the cors() convenience method.
---

CORS can be implemented using the [wildcard routes](/docs/core-concepts/wildcard-routes) feature. A typical implementation would be as follows:

```javascript
api.options('/*', (req, res) => {
  // Add CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With'
  );
  res.status(200).send({});
});
```

You can also use the `cors()` ([see here](/docs/request-response/redirects-and-cors)) convenience method to add CORS headers.

Conditional route support could be added via middleware or with conditional logic within the `OPTIONS` route.
