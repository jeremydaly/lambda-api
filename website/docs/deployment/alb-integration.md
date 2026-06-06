---
title: ALB Integration
description: Lambda API normalizes Application Load Balancer events so the same function works with API Gateway, ALB, or both.
---

AWS recently added support for Lambda functions as targets for Application Load Balancers. While the events from ALBs are similar to API Gateway, there are a number of differences that would require code changes based on implementation. Lambda API detects the event `interface` and automatically normalizes the `REQUEST` object. It also correctly formats the `RESPONSE` (supporting both multi-header and non-multi-header mode) for you. This allows you to call your Lambda function from API Gateway, ALB, or both, without requiring any code changes.

Please note that ALB events do not contain all of the same headers as API Gateway (such as `clientType`), but Lambda API provides defaults for seamless integration between the interfaces. ALB also automatically enables [binary support](/docs/request-response/files-and-downloads), giving you the ability to serve images and other binary file types. Lambda API reads the `path` parameter supplied by the ALB event and uses that to route your requests. If you specify a wildcard in your listener rule, then all matching paths will be forwarded to your Lambda function. Lambda API's routing system can be used to process these routes just like with API Gateway. This includes static paths, parameterized paths, wildcards, middleware, etc.

Sample ALB request and response events can be found [here](https://docs.aws.amazon.com/lambda/latest/dg/services-alb.html).
