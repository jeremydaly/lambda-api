---
title: Namespaces
description: Map modules to namespaces in Lambda API and access them from the REQUEST object without requiring them in every file.
---

Lambda API allows you to map specific modules to namespaces that can be accessed from the `REQUEST` object. This is helpful when using the pattern in which you create a module that exports middleware, error, or route functions. In the example below, the `data` namespace is added to the API and then accessed by reference within an included module.

The main handler file might look like this:

```javascript
// Use app() function to add 'data' namespace
api.app('data', require('./lib/data.js'));

// Create a get route to load user details
api.get('/users/:userId', require('./lib/users.js'));
```

The users.js module might look like this:

```javascript
module.exports = (req, res) => {
  let userInfo = req.namespace.data.getUser(req.params.userId);
  res.json({ userInfo: userInfo });
};
```

By saving references in namespaces, you can access them without needing to require them in every module. Namespaces can be added using the `app()` method of the API. `app()` accepts either two parameters: a string representing the name of the namespace and a function reference _OR_ an object with string names as keys and function references as the values. For example:

```javascript
api.app('namespace', require('./lib/ns-functions.js'));

// OR

api.app({
  namespace1: require('./lib/ns1-functions.js'),
  namespace2: require('./lib/ns2-functions.js'),
});
```
