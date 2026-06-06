---
title: Clean Up
description: Use the finally() method to run clean up logic after all middleware and routes complete.
---

The API has a built-in clean up method called 'finally()' that will execute after all middleware and routes have been completed, but before execution is complete. This can be used to close database connections or to perform other clean up functions. A clean up function can be defined using the `finally` method and requires a function with two parameters for the REQUEST and the RESPONSE as its only argument. For example:

```javascript
api.finally((req, res) => {
  // close unneeded database connections and perform clean up
});
```

:::note
The `RESPONSE` **CANNOT** be manipulated since it has already been generated. Only one `finally()` method can be defined and will execute after properly handled errors as well.
:::
