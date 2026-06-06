---
title: Introduction
description: Lambda API is a lightweight, zero-dependency web framework for AWS Lambda using API Gateway or ALB.
---

Welcome to Lambda API! Lambda API is a lightweight web framework for AWS Lambda using AWS API Gateway Lambda Proxy Integration or ALB Lambda Target Support. This closely mirrors (and is based on) other web frameworks like Express.js and Fastify, but is significantly stripped down to maximize performance with Lambda's stateless, single run executions.

## Why another web framework?

Express.js, Fastify, Koa, Restify, and Hapi are just a few of the many amazing web frameworks out there for Node.js. So why build yet another one when there are so many great options already? One word: **DEPENDENCIES**.

These other frameworks are extremely powerful, but that benefit comes with the steep price of requiring several additional Node.js modules. Not only is this a bit of a security issue (see Beware of Third-Party Packages in [Securing Serverless](https://www.jeremydaly.com/securing-serverless-a-newbies-guide/)), but it also adds bloat to your codebase, filling your `node_modules` directory with a ton of extra files. For serverless applications that need to load quickly, all of these extra dependencies slow down execution and use more memory than necessary. Express.js has **30 dependencies**, Fastify has **12**, and Hapi has **17**! These numbers don't even include their dependencies' dependencies.

Lambda API has **ZERO** dependencies. _None_. _Zip_. _Zilch_.

Lambda API was written to be _extremely lightweight_ and built specifically for **SERVERLESS** applications using AWS Lambda and API Gateway. It provides support for API routing, serving up HTML pages, issuing redirects, serving binary files and much more. Worried about observability? Lambda API has a built-in logging engine that can even periodically sample requests for things like tracing and benchmarking. It has a powerful middleware and error handling system, allowing you to implement just about anything you can dream of. Best of all, it was designed to work with Lambda's Proxy Integration, automatically handling all the interaction with API Gateway for you. It parses **REQUESTS** and formats **RESPONSES**, allowing you to focus on your application's core functionality, instead of fiddling with inputs and outputs.

## Single Purpose Functions

You may have heard that a serverless "best practice" is to keep your functions small and limit them to a single purpose. I generally agree since building monolith applications is not what serverless was designed for. However, what exactly is a "single purpose" when it comes to building serverless APIs and web services? Should we create a separate function for our "create user" `POST` endpoint and then another one for our "update user" `PUT` endpoint? Should we create yet another function for our "delete user" `DELETE` endpoint? You certainly could, but that seems like a lot of repeated boilerplate code. On the other hand, you could create just one function that handled all your user management features. It may even make sense (in certain circumstances) to create one big serverless function handling several related components that can share your VPC database connections.

Whatever you decide is best for your use case, **Lambda API** is there to support you. Whether your function has over a hundred routes, or just one, Lambda API's small size and lightning fast load time has virtually no impact on your function's performance. You can even define global wildcard routes that will process any incoming request, allowing you to use API Gateway or ALB to determine the routing. Yet despite its small footprint, it gives you the power of a full-featured web framework.

:::tip
Ready to build? Head over to the [Quick Start](/docs/getting-started/quick-start) to get up and running in minutes.
:::
