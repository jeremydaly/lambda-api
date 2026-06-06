---
title: Reusing Persistent Connections
description: Keep persistent database and cache connections alive across Lambda invocations.
---

If you are using persistent connections in your function routes (such as AWS RDS or Elasticache), be sure to set `context.callbackWaitsForEmptyEventLoop = false;` in your main handler. This will allow the freezing of connections and will prevent Lambda from hanging on open connections. See [here](https://www.jeremydaly.com/reuse-database-connections-aws-lambda/) for more information.
