---
title: Lambda Proxy Integration
description: How Lambda API parses API Gateway Lambda Proxy Integration events into a normalized request object.
---

Lambda Proxy Integration is an option in API Gateway that allows the details of an API request to be passed as the `event` parameter of a Lambda function. A typical API Gateway request event with Lambda Proxy Integration enabled can be found [here](https://docs.aws.amazon.com/lambda/latest/dg/eventsources.html#eventsources-api-gateway-request).

Lambda API automatically parses this information to create a normalized `REQUEST` object. The request can then be [routed](/docs/core-concepts/routes-and-methods) using the APIs methods.
