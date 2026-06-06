---
title: Debugging Routes
description: Inspect configured routes in Lambda API using the routes() method, including array output and console table form.
---

Lambda API has a `routes()` method that can be called on the main instance that will return an array containing the `METHOD` and full `PATH` of every configured route. This will include base paths and prefixed routes. This is helpful for debugging your routes.

```javascript
const api = require('lambda-api')();

api.get('/', (req, res) => {});
api.post('/test', (req, res) => {});

api.routes(); // => [ [ 'GET', '/' ], [ 'POST', '/test' ] ]
```

You can also log the paths in table form to the console by passing in `true` as the only parameter.

```javascript
 const api = require('lambda-api')()

 api.get('/', (req,res) => {})
 api.post('/test', (req,res) => {})

 api.routes(true)

// Outputs to console
╔═══════════╤═════════════════╗
║  METHOD   │  ROUTE          ║
╟───────────┼─────────────────╢
║  GET      │  /              ║
╟───────────┼─────────────────╢
║  POST     │  /test          ║
╚═══════════╧═════════════════╝
```
