---
title: Caching & ETags
description: RESPONSE methods for controlling client caching with ETags, cache-control, and last-modified headers in Lambda API.
---

## etag([boolean])

Enables Etag generation for the response if at value of `true` is passed in. Lambda API will generate an Etag based on the body of the response and return the appropriate header. If the request contains an `If-No-Match` header that matches the generated Etag, a `304 Not Modified` response will be returned with a blank body.

## cache([age] [, private])

Adds `cache-control` header to responses. If the first parameter is an `integer`, it will add a `max-age` to the header. The number should be in milliseconds. If the first parameter is `true`, it will add the cache headers with `max-age` set to `0` and use the current time for the `expires` header. If set to false, it will add a cache header with `no-cache, no-store, must-revalidate` as the value. You can also provide a custom string that will manually set the value of the `cache-control` header. And optional second argument takes a `boolean` and will set the `cache-control` to `private` This method is chainable.

```javascript
res.cache(false).send(); // 'cache-control': 'no-cache, no-store, must-revalidate'
res.cache(1000).send(); // 'cache-control': 'max-age=1'
res.cache(30000, true).send(); // 'cache-control': 'private, max-age=30'
```

## modified(date)

Adds a `last-modified` header to responses. A value of `true` will set the value to the current date and time. A JavaScript `Date` object can also be passed in. Note that it will be converted to UTC if not already. A `string` can also be passed in and will be converted to a date if JavaScript's `Date()` function is able to parse it. A value of `false` will prevent the header from being generated, but will not remove any existing `last-modified` headers.
