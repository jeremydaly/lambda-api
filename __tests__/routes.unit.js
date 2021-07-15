"use strict";

// Init API instance
const api = require("../index")({ version: "v1.0", logger: false });
const api2 = require("../index")({ version: "v1.0", logger: false });
const api3 = require("../index")({ version: "v1.0", logger: false });
const api4 = require("../index")({ version: "v1.0", logger: false });
const api5 = require("../index")({ version: "v1.0", logger: false });
const api6 = require("../index")({ version: "v1.0", logger: false });
const api7 = require("../index")({ version: "v1.0", logger: false });

let event = {
  httpMethod: "get",
  path: "/test",
  body: {},
  multiValueHeaders: {
    "content-type": ["application/json"],
  },
};

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

api.get("/", function (req, res) {
  res.status(200).json({ method: "get", status: "ok" });
});

api.get("/return", async function (req, res) {
  return { method: "get", status: "ok" };
});

api.get("/returnNoArgs", async () => {
  return { method: "get", status: "ok" };
});

api2.get("/", function (req, res) {
  res.status(200).json({ method: "get", status: "ok" });
});

api.get("/test", function (req, res) {
  res.status(200).json({ method: "get", status: "ok" });
});

api.patch("/test", function (req, res) {
  res.status(200).json({ method: "patch", status: "ok" });
});

api.get("/test_options", function (req, res) {
  res.status(200).json({ method: "get", status: "ok" });
});

api.get("/test_options2/:test", function (req, res) {
  res.status(200).json({ method: "get", status: "ok" });
});

api.post("/test", function (req, res) {
  res.status(200).json({ method: "post", status: "ok" });
});

api.post("/test/base64", function (req, res) {
  res.status(200).json({ method: "post", status: "ok", body: req.body });
});

api.put("/test", function (req, res) {
  res.status(200).json({ method: "put", status: "ok" });
});

api.options("/test", function (req, res) {
  res.status(200).json({ method: "options", status: "ok" });
});

api.get("/test/:testX", function (req, res, next) {
  next();
});

api.get("/test/:test", function (req, res) {
  res.status(200).json({
    method: "get",
    status: "ok",
    param: req.params.test,
    param2: req.params.testX,
  });
});

api.post("/test/:test", function (req, res) {
  res
    .status(200)
    .json({ method: "post", status: "ok", param: req.params.test });
});

api.put("/test/:test", function (req, res) {
  res.status(200).json({ method: "put", status: "ok", param: req.params.test });
});

api.patch("/test/:test", function (req, res) {
  res
    .status(200)
    .json({ method: "patch", status: "ok", param: req.params.test });
});

api.delete("/test/:test", function (req, res) {
  res
    .status(200)
    .json({ method: "delete", status: "ok", param: req.params.test });
});

api.options("/test/:test", function (req, res) {
  res
    .status(200)
    .json({ method: "options", status: "ok", param: req.params.test });
});

api.patch("/test/:test/:test2", function (req, res) {
  res.status(200).json({ method: "patch", status: "ok", params: req.params });
});

api.delete("/test/:test/:test2", function (req, res) {
  res.status(200).json({ method: "delete", status: "ok", params: req.params });
});

api.get("/test/:test/query", function (req, res) {
  res.status(200).json({
    method: "get",
    status: "ok",
    param: req.params.test,
    query: req.query,
    multiValueQuery: req.multiValueQuery,
  });
});

api.post("/test/:test/query", function (req, res) {
  res.status(200).json({
    method: "post",
    status: "ok",
    param: req.params.test,
    query: req.query,
    multiValueQuery: req.multiValueQuery,
  });
});

api.put("/test/:test/query", function (req, res) {
  res.status(200).json({
    method: "put",
    status: "ok",
    param: req.params.test,
    query: req.query,
    multiValueQuery: req.multiValueQuery,
  });
});

api.options("/test/:test/query", function (req, res) {
  res.status(200).json({
    method: "options",
    status: "ok",
    param: req.params.test,
    query: req.query,
    multiValueQuery: req.multiValueQuery,
  });
});

api.get("/test/:test/query/:test2", function (req, res) {
  res.status(200).json({
    method: "get",
    status: "ok",
    params: req.params,
    query: req.query.test,
  });
});

api.post("/test/:test/query/:test2", function (req, res) {
  res.status(200).json({
    method: "post",
    status: "ok",
    params: req.params,
    query: req.query.test,
  });
});

api.put("/test/:test/query/:test2", function (req, res) {
  res.status(200).json({
    method: "put",
    status: "ok",
    params: req.params,
    query: req.query.test,
  });
});

api.options("/test/:test/query/:test2", function (req, res) {
  res.status(200).json({
    method: "options",
    status: "ok",
    params: req.params,
    query: req.query.test,
  });
});

api.post("/test/json", function (req, res) {
  res.status(200).json({ method: "post", status: "ok", body: req.body });
});

api.post("/test/form", function (req, res) {
  res.status(200).json({ method: "post", status: "ok", body: req.body });
});

api.put("/test/json", function (req, res) {
  res.status(200).json({ method: "put", status: "ok", body: req.body });
});

api.put("/test/form", function (req, res) {
  res.status(200).json({ method: "put", status: "ok", body: req.body });
});

api.METHOD("TEST", "/test/:param1/queryx", function (req, res) {
  res.status(200).json({ method: "test", status: "ok", body: req.body });
});

api.METHOD("TEST", "/test_options2/:param1/test", function (req, res) {
  res.status(200).json({ method: "test", status: "ok", body: req.body });
});

api.options("/test_options2/:param1/*", function (req, res) {
  res.status(200).json({
    method: "options",
    status: "ok",
    path: "/test_options2/:param1/*",
    params: req.params,
  });
});

api.options("/test_options2/*", function (req, res) {
  res
    .status(200)
    .json({ method: "options", status: "ok", path: "/test_options2/*" });
});

api.options("/*", function (req, res) {
  res.status(200).json({ method: "options", status: "ok", path: "/*" });
});

api.get("/override/head/request", (req, res) => {
  res
    .status(200)
    .header("method", "get")
    .json({ method: "get", path: "/override/head/request" });
});

api.head("/override/head/request", (req, res) => {
  res
    .status(200)
    .header("method", "head")
    .json({ method: "head", path: "/override/head/request" });
});

api.any("/any", (req, res) => {
  res.status(200).json({ method: req.method, path: "/any", anyRoute: true });
});

api.any("/any2", function any2(req, res) {
  res.status(200).json({ method: req.method, path: "/any2", anyRoute: true });
});

api.post("/any2", function any2post(req, res) {
  res.status(200).json({ method: req.method, path: "/any2", anyRoute: false });
});

api.options("/anywildcard/test", (req, res) => {
  res
    .status(200)
    .json({ method: req.method, path: "/anywildcard", anyRoute: true });
});

api.any("/anywildcard/*", (req, res) => {
  res
    .status(200)
    .json({ method: req.method, path: "/anywildcard", anyRoute: true });
});

api.get("/head/override", (req, res) => {
  res.status(200).header("wildcard", false).json({});
});

api.head("/head/*", (req, res) => {
  res.status(200).header("wildcard", true).json({});
});

api.get("/methodNotAllowed", (req, res) => {
  res.send({ status: "OK" });
});

// Multi methods
api3.METHOD("get,post", "/multimethod/test", (req, res) => {
  res.status(200).json({ method: req.method, path: "/multimethod/test" });
});
api3.METHOD(["get", "put", "delete"], "/multimethod/:var", (req, res) => {
  res.status(200).json({ method: req.method, path: "/multimethod/:var" });
});
api3.METHOD([1, "DELETE"], "/multimethod/badtype", (req, res) => {
  res.status(200).json({ method: req.method, path: "/multimethod/badtype" });
});

api4.get("/test/*", (req, res) => {
  res
    .status(200)
    .header("wildcard", true)
    .json({ method: req.method, path: req.path, nested: "true" });
});

api4.get("/*", (req, res) => {
  res
    .status(200)
    .header("wildcard", true)
    .json({ method: req.method, path: req.path });
});

api4.options("/test/test/*", (req, res) => {
  res
    .status(200)
    .header("wildcard", true)
    .json({ method: req.method, path: req.path, nested: "true" });
});

api4.options("/test/*", (req, res) => {
  res
    .status(200)
    .header("wildcard", true)
    .json({ method: req.method, path: req.path, nested: "true" });
});

api4.post("/test/*", (req, res) => {
  res
    .status(200)
    .header("wildcard", true)
    .json({ method: req.method, path: req.path, nested: "true" });
});

api4.post("/*", (req, res) => {
  res
    .status(200)
    .header("wildcard", true)
    .json({ method: req.method, path: req.path });
});

// Default route
api5.get(function (req, res) {
  res.status(200).json({ method: "get", status: "ok" });
});

api5.METHOD("any", function (req, res) {
  res.status(200).json({ method: "any", status: "ok" });
});

api6.any("/*", function anyWildcard(req, res, next) {
  next();
});
api6.get("/*", function getWildcard(req, res, next) {
  next();
});
api6.get("/test", function testHandler(req, res) {
  res.send({ status: "ok" });
});

api7.get(function (req, res) {
  res.status(200).json({ method: "get", status: "ok" });
});

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe("Route Tests:", function () {
  /*****************/
  /*** GET Tests ***/
  /*****************/

  describe("GET", function () {
    it("Base path: /", async function () {
      let _event = Object.assign({}, event, { path: "/" });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"get","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Simple path: /test", async function () {
      let _event = Object.assign({}, event, {});
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"get","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Simple path w/ async return", async function () {
      let _event = Object.assign({}, event, { path: "/return" });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"get","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Simple path w/ async return (no args)", async function () {
      let _event = Object.assign({}, event, { path: "/returnNoArgs" });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"get","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Simple path, no `context`", async function () {
      let _event = Object.assign({}, event, {});
      let result = await new Promise((r) =>
        api.run(_event, null, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"get","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Simple path w/ trailing slash: /test/", async function () {
      let _event = Object.assign({}, event, { path: "/test/" });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"get","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter: /test/123", async function () {
      let _event = Object.assign({}, event, { path: "/test/123" });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"get","status":"ok","param":"123","param2":"123"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter and querystring: /test/123/query/?test=321", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query",
        queryStringParameters: { test: "321" },
        multiValueQueryStringParameters: { test: ["321"] },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"get","status":"ok","param":"123","query":{"test":"321"},"multiValueQuery":{"test":["321"]}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter and multiple querystring: /test/123/query/?test=123&test=321", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query",
        multiValueQueryStringParameters: { test: ["123", "321"] },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"get","status":"ok","param":"123","query":{"test":"321"},"multiValueQuery":{"test":["123","321"]}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with multiple parameters and querystring: /test/123/query/456/?test=321", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query/456",
        queryStringParameters: { test: "321" },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"get","status":"ok","params":{"test":"123","test2":"456"},"query":"321"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Event path + querystring w/ trailing slash (this shouldn't happen with API Gateway)", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query/?test=321",
        queryStringParameters: { test: "321" },
        multiValueQueryStringParameters: { test: ["321"] },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"get","status":"ok","param":"123","query":{"test":"321"},"multiValueQuery":{"test":["321"]}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Event path + querystring w/o trailing slash (this shouldn't happen with API Gateway)", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query?test=321",
        queryStringParameters: { test: "321" },
        multiValueQueryStringParameters: { test: ["321"] },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"get","status":"ok","param":"123","query":{"test":"321"},"multiValueQuery":{"test":["321"]}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Missing path: /not_found", async function () {
      let _event = Object.assign({}, event, { path: "/not_found" });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 404,
        body: '{"error":"Route not found"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Missing path: /not_found (new api instance)", async function () {
      let _event = Object.assign({}, event, { path: "/not_found" });
      let result = await new Promise((r) =>
        api2.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 404,
        body: '{"error":"Route not found"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Wildcard: /*", async function () {
      let _event = Object.assign({}, event, { path: "/foo/bar" });
      let result = await new Promise((r) =>
        api4.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      // console.log(JSON.stringify(api4._routes,null,2));
      expect(result).toEqual({
        multiValueHeaders: {
          "content-type": ["application/json"],
          wildcard: [true],
        },
        statusCode: 200,
        body: '{"method":"GET","path":"/foo/bar"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Wildcard: /test/*", async function () {
      let _event = Object.assign({}, event, { path: "/test/foo/bar" });
      let result = await new Promise((r) =>
        api4.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: {
          "content-type": ["application/json"],
          wildcard: [true],
        },
        statusCode: 200,
        body: '{"method":"GET","path":"/test/foo/bar","nested":"true"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Default path", async function () {
      let _event = Object.assign({}, event, { path: "/test" });
      let result = await new Promise((r) =>
        api5.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"get","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Method not allowed", async function () {
      let _event = Object.assign({}, event, {
        path: "/methodNotAllowed",
        httpMethod: "post",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 405,
        body: '{"error":"Method not allowed"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Method not allowed (/* path - valid method)", async function () {
      let _event = Object.assign({}, event, {
        path: "/methodNotAllowedStar",
        httpMethod: "get",
      });
      let result = await new Promise((r) =>
        api7.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"get","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Method not allowed (/* path)", async function () {
      let _event = Object.assign({}, event, {
        path: "/methodNotAllowedStar",
        httpMethod: "post",
      });
      let result = await new Promise((r) =>
        api7.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 405,
        body: '{"error":"Method not allowed"}',
        isBase64Encoded: false,
      });
    }); // end it
  }); // end GET tests

  /******************/
  /*** HEAD Tests ***/
  /******************/

  describe("HEAD", function () {
    it("Base path: /", async function () {
      let _event = Object.assign({}, event, { path: "/", httpMethod: "head" });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: "",
        isBase64Encoded: false,
      });
    }); // end it

    it("Simple path: /test", async function () {
      let _event = Object.assign({}, event, { httpMethod: "head" });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: "",
        isBase64Encoded: false,
      });
    }); // end it

    it("Simple path w/ trailing slash: /test/", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/",
        httpMethod: "head",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: "",
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter: /test/123", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123",
        httpMethod: "head",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: "",
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter and querystring: /test/123/query/?test=321", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query",
        httpMethod: "head",
        queryStringParameters: { test: "321" },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: "",
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter and multiple querystring: /test/123/query/?test=123&test=321", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query",
        httpMethod: "head",
        multiValueQueryStringParameters: { test: ["123", "321"] },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: "",
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with multiple parameters and querystring: /test/123/query/456/?test=321", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query/456",
        httpMethod: "head",
        queryStringParameters: { test: "321" },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: "",
        isBase64Encoded: false,
      });
    }); // end it

    it("Event path + querystring w/ trailing slash (this shouldn't happen with API Gateway)", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query/?test=321",
        httpMethod: "head",
        queryStringParameters: { test: "321" },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: "",
        isBase64Encoded: false,
      });
    }); // end it

    it("Event path + querystring w/o trailing slash (this shouldn't happen with API Gateway)", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query?test=321",
        httpMethod: "head",
        queryStringParameters: { test: "321" },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: "",
        isBase64Encoded: false,
      });
    }); // end it

    it("Missing path: /not_found", async function () {
      let _event = Object.assign({}, event, {
        path: "/not_found",
        httpMethod: "head",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 404,
        body: "",
        isBase64Encoded: false,
      });
    }); // end it

    it("Override HEAD request", async function () {
      let _event = Object.assign({}, event, {
        path: "/override/head/request",
        httpMethod: "head",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: {
          "content-type": ["application/json"],
          method: ["head"],
        },
        statusCode: 200,
        body: "",
        isBase64Encoded: false,
      });
    }); // end it

    it("Wildcard HEAD request", async function () {
      let _event = Object.assign({}, event, {
        path: "/head/override",
        httpMethod: "head",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: {
          "content-type": ["application/json"],
          wildcard: [true],
        },
        statusCode: 200,
        body: "",
        isBase64Encoded: false,
      });
    }); // end it
  }); // end HEAD tests

  /******************/
  /*** POST Tests ***/
  /******************/

  describe("POST", function () {
    it("Simple path: /test", async function () {
      let _event = Object.assign({}, event, { httpMethod: "post" });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"post","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Simple path w/ trailing slash: /test/", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/",
        httpMethod: "post",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"post","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter: /test/123", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123",
        httpMethod: "post",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"post","status":"ok","param":"123"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter and querystring: /test/123/query/?test=321", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query",
        httpMethod: "post",
        queryStringParameters: { test: "321" },
        multiValueQueryStringParameters: { test: ["321"] },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"post","status":"ok","param":"123","query":{"test":"321"},"multiValueQuery":{"test":["321"]}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter and multiple querystring: /test/123/query/?test=123&test=321", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query",
        httpMethod: "post",
        multiValueQueryStringParameters: { test: ["123", "321"] },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"post","status":"ok","param":"123","query":{"test":"321"},"multiValueQuery":{"test":["123","321"]}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with multiple parameters and querystring: /test/123/query/456/?test=321", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query/456",
        httpMethod: "post",
        queryStringParameters: { test: "321" },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"post","status":"ok","params":{"test":"123","test2":"456"},"query":"321"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("With JSON body: /test/json", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/json",
        httpMethod: "post",
        body: { test: "123" },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"post","status":"ok","body":{"test":"123"}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("With stringified JSON body: /test/json", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/json",
        httpMethod: "post",
        body: JSON.stringify({ test: "123" }),
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"post","status":"ok","body":{"test":"123"}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("With x-www-form-urlencoded body: /test/form", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/form",
        httpMethod: "post",
        body: "test=123&test2=456",
        multiValueHeaders: {
          "Content-Type": ["application/x-www-form-urlencoded"],
        },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"post","status":"ok","body":{"test":"123","test2":"456"}}',
        isBase64Encoded: false,
      });
    }); // end it

    it('With "x-www-form-urlencoded; charset=UTF-8" body: /test/form', async function () {
      let _event = Object.assign({}, event, {
        path: "/test/form",
        httpMethod: "post",
        body: "test=123&test2=456",
        multiValueHeaders: {
          "Content-Type": ["application/x-www-form-urlencoded; charset=UTF-8"],
        },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"post","status":"ok","body":{"test":"123","test2":"456"}}',
        isBase64Encoded: false,
      });
    }); // end it

    it('With x-www-form-urlencoded body and lowercase "Content-Type" header: /test/form', async function () {
      let _event = Object.assign({}, event, {
        path: "/test/form",
        httpMethod: "post",
        body: "test=123&test2=456",
        multiValueHeaders: {
          "content-type": ["application/x-www-form-urlencoded; charset=UTF-8"],
        },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"post","status":"ok","body":{"test":"123","test2":"456"}}',
        isBase64Encoded: false,
      });
    }); // end it

    it('With x-www-form-urlencoded body and mixed case "Content-Type" header: /test/form', async function () {
      let _event = Object.assign({}, event, {
        path: "/test/form",
        httpMethod: "post",
        body: "test=123&test2=456",
        multiValueHeaders: {
          "CoNtEnt-TYPe": ["application/x-www-form-urlencoded"],
        },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"post","status":"ok","body":{"test":"123","test2":"456"}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("With base64 encoded body", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/base64",
        httpMethod: "post",
        body: "VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=",
        isBase64Encoded: true,
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"post","status":"ok","body":"Test file for sendFile\\n"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("With base64 encoding flagged and no body", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/base64",
        httpMethod: "post",
        body: undefined,
        isBase64Encoded: true,
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"post","status":"ok","body":""}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Missing path: /not_found", async function () {
      let _event = Object.assign({}, event, {
        path: "/not_found",
        httpMethod: "post",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 404,
        body: '{"error":"Route not found"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Wildcard: /*", async function () {
      let _event = Object.assign({}, event, {
        path: "/foo/bar",
        httpMethod: "post",
      });
      let result = await new Promise((r) =>
        api4.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: {
          "content-type": ["application/json"],
          wildcard: [true],
        },
        statusCode: 200,
        body: '{"method":"POST","path":"/foo/bar"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Wildcard: /test/*", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/foo/bar",
        httpMethod: "post",
      });
      let result = await new Promise((r) =>
        api4.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: {
          "content-type": ["application/json"],
          wildcard: [true],
        },
        statusCode: 200,
        body: '{"method":"POST","path":"/test/foo/bar","nested":"true"}',
        isBase64Encoded: false,
      });
    }); // end it
  }); // end POST tests

  /*****************/
  /*** PUT Tests ***/
  /*****************/

  describe("PUT", function () {
    it("Simple path: /test", async function () {
      let _event = Object.assign({}, event, { httpMethod: "put" });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"put","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Simple path w/ trailing slash: /test/", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/",
        httpMethod: "put",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"put","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter: /test/123", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123",
        httpMethod: "put",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"put","status":"ok","param":"123"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter and querystring: /test/123/query/?test=321", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query",
        httpMethod: "put",
        queryStringParameters: { test: "321" },
        multiValueQueryStringParameters: { test: ["321"] },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"put","status":"ok","param":"123","query":{"test":"321"},"multiValueQuery":{"test":["321"]}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter and multiple querystring: /test/123/query/?test=123&test=321", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query",
        httpMethod: "put",
        multiValueQueryStringParameters: { test: ["123", "321"] },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"put","status":"ok","param":"123","query":{"test":"321"},"multiValueQuery":{"test":["123","321"]}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with multiple parameters and querystring: /test/123/query/456/?test=321", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query/456",
        httpMethod: "put",
        queryStringParameters: { test: "321" },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"put","status":"ok","params":{"test":"123","test2":"456"},"query":"321"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("With JSON body: /test/json", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/json",
        httpMethod: "put",
        body: { test: "123" },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"put","status":"ok","body":{"test":"123"}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("With stringified JSON body: /test/json", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/json",
        httpMethod: "put",
        body: JSON.stringify({ test: "123" }),
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"put","status":"ok","body":{"test":"123"}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("With x-www-form-urlencoded body: /test/form", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/form",
        httpMethod: "put",
        body: "test=123&test2=456",
        multiValueHeaders: {
          "content-type": ["application/x-www-form-urlencoded"],
        },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"put","status":"ok","body":{"test":"123","test2":"456"}}',
        isBase64Encoded: false,
      });
    }); // end it

    it('With "x-www-form-urlencoded; charset=UTF-8" body: /test/form', async function () {
      let _event = Object.assign({}, event, {
        path: "/test/form",
        httpMethod: "put",
        body: "test=123&test2=456",
        multiValueHeaders: {
          "content-type": ["application/x-www-form-urlencoded; charset=UTF-8"],
        },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"put","status":"ok","body":{"test":"123","test2":"456"}}',
        isBase64Encoded: false,
      });
    }); // end it

    it('With x-www-form-urlencoded body and lowercase "Content-Type" header: /test/form', async function () {
      let _event = Object.assign({}, event, {
        path: "/test/form",
        httpMethod: "put",
        body: "test=123&test2=456",
        multiValueHeaders: {
          "content-type": ["application/x-www-form-urlencoded; charset=UTF-8"],
        },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"put","status":"ok","body":{"test":"123","test2":"456"}}',
        isBase64Encoded: false,
      });
    }); // end it

    it('With x-www-form-urlencoded body and mixed case "Content-Type" header: /test/form', async function () {
      let _event = Object.assign({}, event, {
        path: "/test/form",
        httpMethod: "put",
        body: "test=123&test2=456",
        multiValueHeaders: {
          "CoNtEnt-TYPe": ["application/x-www-form-urlencoded"],
        },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"put","status":"ok","body":{"test":"123","test2":"456"}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Missing path: /not_found", async function () {
      let _event = Object.assign({}, event, {
        path: "/not_found",
        httpMethod: "put",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 404,
        body: '{"error":"Route not found"}',
        isBase64Encoded: false,
      });
    }); // end it
  }); // end PUT tests

  /********************/
  /*** PATCH Tests ***/
  /********************/

  describe("PATCH", function () {
    it("Simple path: /test", async function () {
      let _event = Object.assign({}, event, {
        path: "/test",
        httpMethod: "patch",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"patch","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter: /test/123", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123",
        httpMethod: "patch",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"patch","status":"ok","param":"123"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with multiple parameters: /test/123/456", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/456",
        httpMethod: "patch",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"patch","status":"ok","params":{"test":"123","test2":"456"}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Missing path: /not_found", async function () {
      let _event = Object.assign({}, event, {
        path: "/not_found",
        httpMethod: "patch",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 404,
        body: '{"error":"Route not found"}',
        isBase64Encoded: false,
      });
    }); // end it
  }); // end PATCH tests

  /********************/
  /*** DELETE Tests ***/
  /********************/

  describe("DELETE", function () {
    it("Path with parameter: /test/123", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123",
        httpMethod: "delete",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"delete","status":"ok","param":"123"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with multiple parameters: /test/123/456", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/456",
        httpMethod: "delete",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"delete","status":"ok","params":{"test":"123","test2":"456"}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Missing path: /not_found", async function () {
      let _event = Object.assign({}, event, {
        path: "/not_found",
        httpMethod: "delete",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 404,
        body: '{"error":"Route not found"}',
        isBase64Encoded: false,
      });
    }); // end it
  }); // end DELETE tests

  /*********************/
  /*** OPTIONS Tests ***/
  /*********************/

  describe("OPTIONS", function () {
    it("Simple path: /test", async function () {
      let _event = Object.assign({}, event, { httpMethod: "options" });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"options","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Simple path w/ trailing slash: /test/", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/",
        httpMethod: "options",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"options","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter: /test/123", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123",
        httpMethod: "options",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"options","status":"ok","param":"123"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter and querystring: /test/123/query/?test=321", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query",
        httpMethod: "options",
        queryStringParameters: { test: "321" },
        multiValueQueryStringParameters: { test: ["321"] },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"options","status":"ok","param":"123","query":{"test":"321"},"multiValueQuery":{"test":["321"]}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with parameter and multiple querystring: /test/123/query/?test=123&test=321", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query",
        httpMethod: "options",
        multiValueQueryStringParameters: { test: ["123", "321"] },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"options","status":"ok","param":"123","query":{"test":"321"},"multiValueQuery":{"test":["123","321"]}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Path with multiple parameters and querystring: /test/123/query/456/?test=321", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/123/query/456",
        httpMethod: "options",
        queryStringParameters: { test: "321" },
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"options","status":"ok","params":{"test":"123","test2":"456"},"query":"321"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Wildcard: /test_options", async function () {
      let _event = Object.assign({}, event, {
        path: "/test_options",
        httpMethod: "options",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"options","status":"ok","path":"/*"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Wildcard with path: /test_options2/123", async function () {
      let _event = Object.assign({}, event, {
        path: "/test_options2/123",
        httpMethod: "options",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"options","status":"ok","path":"/test_options2/*"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Wildcard with deep path: /test/param1/queryx", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/param1/queryx",
        httpMethod: "options",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"options","status":"ok","path":"/*"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Nested Wildcard: /test_options2", async function () {
      let _event = Object.assign({}, event, {
        path: "/test_options2/test",
        httpMethod: "options",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"options","status":"ok","path":"/test_options2/*"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Nested Wildcard with parameters: /test_options2/param1/test", async function () {
      let _event = Object.assign({}, event, {
        path: "/test_options2/param1/test",
        httpMethod: "options",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"options","status":"ok","path":"/test_options2/:param1/*","params":{"param1":"param1"}}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Missing path: /not_found", async function () {
      let _event = Object.assign({}, event, {
        path: "/not_found",
        httpMethod: "options",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 404,
        body: '{"error":"Route not found"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Wildcard: /test/*", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/foo/bar",
        httpMethod: "options",
      });
      let result = await new Promise((r) =>
        api4.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: {
          "content-type": ["application/json"],
          wildcard: [true],
        },
        statusCode: 200,
        body: '{"method":"OPTIONS","path":"/test/foo/bar","nested":"true"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Wildcard: /test/test/* (higher level matching)", async function () {
      let _event = Object.assign({}, event, {
        path: "/test/test/foo/bar",
        httpMethod: "options",
      });
      let result = await new Promise((r) =>
        api4.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: {
          "content-type": ["application/json"],
          wildcard: [true],
        },
        statusCode: 200,
        body: '{"method":"OPTIONS","path":"/test/test/foo/bar","nested":"true"}',
        isBase64Encoded: false,
      });
    }); // end it
  }); // end OPTIONS tests

  /*********************/
  /*** ANY Tests ***/
  /*********************/

  describe("ANY", function () {
    it("GET request on ANY route", async function () {
      let _event = Object.assign({}, event, {
        path: "/any",
        httpMethod: "get",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"GET","path":"/any","anyRoute":true}',
        isBase64Encoded: false,
      });
    }); // end it

    it("POST request on ANY route", async function () {
      let _event = Object.assign({}, event, {
        path: "/any",
        httpMethod: "post",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"POST","path":"/any","anyRoute":true}',
        isBase64Encoded: false,
      });
    }); // end it

    it("PUT request on ANY route", async function () {
      let _event = Object.assign({}, event, {
        path: "/any",
        httpMethod: "put",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"PUT","path":"/any","anyRoute":true}',
        isBase64Encoded: false,
      });
    }); // end it

    it("DELETE request on ANY route", async function () {
      let _event = Object.assign({}, event, {
        path: "/any",
        httpMethod: "delete",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"DELETE","path":"/any","anyRoute":true}',
        isBase64Encoded: false,
      });
    }); // end it

    it("PATCH request on ANY route", async function () {
      let _event = Object.assign({}, event, {
        path: "/any",
        httpMethod: "patch",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"PATCH","path":"/any","anyRoute":true}',
        isBase64Encoded: false,
      });
    }); // end it

    it("HEAD request on ANY route", async function () {
      let _event = Object.assign({}, event, {
        path: "/any",
        httpMethod: "head",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: "",
        isBase64Encoded: false,
      });
    }); // end it

    it("GET request on ANY route: /any2", async function () {
      let _event = Object.assign({}, event, {
        path: "/any2",
        httpMethod: "get",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"GET","path":"/any2","anyRoute":true}',
        isBase64Encoded: false,
      });
    }); // end it

    it("POST request that overrides ANY route: /any2", async function () {
      let _event = Object.assign({}, event, {
        path: "/any2",
        httpMethod: "post",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"POST","path":"/any2","anyRoute":false}',
        isBase64Encoded: false,
      });
    }); // end it

    it("GET request on ANY wildcard route: /anywildcard", async function () {
      let _event = Object.assign({}, event, {
        path: "/anywildcard/test",
        httpMethod: "get",
      });
      let result = await new Promise((r) =>
        api.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"GET","path":"/anywildcard","anyRoute":true}',
        isBase64Encoded: false,
      });
    }); // end it
  }); // end ANY tests

  describe("METHOD", function () {
    it("Invalid method (new api instance)", async function () {
      let _event = Object.assign({}, event, { path: "/", httpMethod: "test" });
      let result = await new Promise((r) =>
        api2.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 405,
        body: '{"error":"Method not allowed"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Multiple methods GET (string creation)", async function () {
      let _event = Object.assign({}, event, {
        path: "/multimethod/test",
        httpMethod: "get",
      });
      let result = await new Promise((r) =>
        api3.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"GET","path":"/multimethod/test"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Multiple methods POST (string creation)", async function () {
      let _event = Object.assign({}, event, {
        path: "/multimethod/test",
        httpMethod: "post",
      });
      let result = await new Promise((r) =>
        api3.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"POST","path":"/multimethod/test"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Multiple methods GET (array creation)", async function () {
      let _event = Object.assign({}, event, {
        path: "/multimethod/x",
        httpMethod: "get",
      });
      let result = await new Promise((r) =>
        api3.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"GET","path":"/multimethod/:var"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Multiple methods PUT (array creation)", async function () {
      let _event = Object.assign({}, event, {
        path: "/multimethod/x",
        httpMethod: "put",
      });
      let result = await new Promise((r) =>
        api3.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"PUT","path":"/multimethod/:var"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Multiple methods POST (method not allowed)", async function () {
      let _event = Object.assign({}, event, {
        path: "/multimethod/x",
        httpMethod: "post",
      });
      let result = await new Promise((r) =>
        api3.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 405,
        body: '{"error":"Method not allowed"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Default path", async function () {
      let _event = Object.assign({}, event, {
        path: "/test",
        httpMethod: "post",
      });
      let result = await new Promise((r) =>
        api5.run(_event, {}, (e, res) => {
          r(res);
        })
      );
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"method":"any","status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it

    it("Expected routes", function () {
      expect(api3.routes()).toEqual([
        ["GET", "/multimethod/test", ["unnamed"]],
        ["POST", "/multimethod/test", ["unnamed"]],
        ["GET", "/multimethod/:var", ["unnamed"]],
        ["PUT", "/multimethod/:var", ["unnamed"]],
        ["DELETE", "/multimethod/:var", ["unnamed"]],
        ["DELETE", "/multimethod/badtype", ["unnamed"]],
      ]);
    }); // end it
  }); // end method tests

  describe("Configuration errors", function () {
    it("Missing handler (w/ route)", async function () {
      let error;
      try {
        const api_error1 = require("../index")({ version: "v1.0" });
        api_error1.get("/test-missing-handler");
      } catch (e) {
        // console.log(e);
        error = e;
      }
      expect(error.name).toBe("ConfigurationError");
      expect(error.message).toBe(
        "No handler or middleware specified for GET method on /test-missing-handler route."
      );
    }); // end it

    it("Missing handler", async function () {
      let error;
      try {
        const api_error1 = require("../index")({ version: "v1.0" });
        api_error1.get();
      } catch (e) {
        // console.log(e);
        error = e;
      }
      expect(error.name).toBe("ConfigurationError");
      expect(error.message).toBe(
        "No handler or middleware specified for GET method on /* route."
      );
    }); // end it

    it("Invalid middleware", async function () {
      let error;
      try {
        const api_error2 = require("../index")({ version: "v1.0" });
        api_error2.use((err, req) => {});
      } catch (e) {
        // console.log(e);
        error = e;
      }
      expect(error.name).toBe("ConfigurationError");
      expect(error.message).toBe("Middleware must have 3 or 4 parameters");
    }); // end it

    it("Invalid route-based middleware", async function () {
      let error;
      try {
        const api_error2 = require("../index")({ version: "v1.0" });
        api_error2.get(
          "/",
          () => {},
          (res, req) => {},
          (res, req) => {}
        );
      } catch (e) {
        // console.log(e);
        error = e;
      }
      expect(error.name).toBe("ConfigurationError");
      expect(error.message).toBe(
        "Route-based middleware must have 3 parameters"
      );
    }); // end it

    it("Invalid wildcard (mid-route)", async function () {
      let error;
      try {
        const api_error2 = require("../index")({ version: "v1.0" });
        api_error2.get("/test/*/test", (res, req) => {});
      } catch (e) {
        // console.log(e);
        error = e;
      }
      expect(error.name).toBe("ConfigurationError");
      expect(error.message).toBe(
        "Wildcards can only be at the end of a route definition"
      );
    }); // end it
  }); // end Configuration errors

  describe("Route Method Inheritance", function () {
    it.skip("Inherit multiple wildcard routes [any routes do not inherit]", async function () {
      let _event = Object.assign({}, event, { path: "/test" });
      let result = await new Promise((r) =>
        api6.run(_event, {}, (e, res) => {
          r(res);
        })
      );

      console.log(api6._response._request._stack);
      console.log(JSON.stringify(api6._routes, null, 2));

      expect(api6._response._request._stack.map((x) => x.name)).toEqual([
        "anyWildcard",
        "getWildcard",
        "testHandler",
      ]);
      expect(result).toEqual({
        multiValueHeaders: { "content-type": ["application/json"] },
        statusCode: 200,
        body: '{"status":"ok"}',
        isBase64Encoded: false,
      });
    }); // end it
  }); // end Route Method Inheritance

  describe("routes() (debug method)", function () {
    it("Sample routes", function () {
      // Create an api instance
      let api2 = require("../index")();
      api2.get("/", (req, res) => {});
      api2.post("/test", (req, res) => {});
      api2.put("/test/put", (req, res) => {});
      api2.delete("/test/:var/delete", (req, res) => {});

      expect(api2.routes()).toEqual([
        ["GET", "/", ["unnamed"]],
        ["POST", "/test", ["unnamed"]],
        ["PUT", "/test/put", ["unnamed"]],
        ["DELETE", "/test/:var/delete", ["unnamed"]],
      ]);
    }); // end it

    it("Sample routes (print)", function () {
      // Create an api instance
      let api2 = require("../index")();
      api2.get("/", (req, res) => {});
      api2.post("/test", (req, res) => {});
      api2.put("/test/put", (req, res) => {});
      api2.delete("/test/:var/delete", (req, res) => {});

      let _log;
      let logger = console.log;
      console.log = (log) => {
        try {
          _log = JSON.parse(log);
        } catch (e) {
          _log = log;
        }
      };
      api2.routes(true);
      console.log = logger;

      expect(_log).toBe(
        "╔══════════╤═════════════════════╤═══════════╗\n║  \u001b[1mMETHOD\u001b[0m  │  \u001b[1mROUTE            \u001b[0m  │  \u001b[1mSTACK  \u001b[0m  ║\n╟──────────┼─────────────────────┼───────────╢\n║  GET     │  /                  │  unnamed  ║\n╟──────────┼─────────────────────┼───────────╢\n║  POST    │  /test              │  unnamed  ║\n╟──────────┼─────────────────────┼───────────╢\n║  PUT     │  /test/put          │  unnamed  ║\n╟──────────┼─────────────────────┼───────────╢\n║  DELETE  │  /test/:var/delete  │  unnamed  ║\n╚══════════╧═════════════════════╧═══════════╝"
      );
    }); // end it
  }); // end routes() test
}); // end ROUTE tests
