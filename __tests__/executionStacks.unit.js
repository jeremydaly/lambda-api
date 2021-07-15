"use strict";

const { expectation } = require("sinon");

// Init API instance
// const api = require("../index")({ version: "v1.0", logger: false });

let event = {
  httpMethod: "get",
  path: "/",
  body: {},
  multiValueHeaders: {
    "content-type": ["application/json"],
  },
};

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

// const middleware1 = (res, req, next) => {
//   next();
// };
// const middleware2 = (res, req, next) => {
//   next();
// };
// const middleware3 = (res, req, next) => {
//   next();
// };
// const middleware4 = (res, req, next) => {
//   next();
// };
// const getRoute = (res, req) => {};
// const getRoute2 = (res, req) => {};
// const getRoute3 = (res, req) => {};
// const postRoute = (res, req) => {};

// // api.use((err,req,res,next) => {})

// // api.post("/foo/bar", postRoute);

// // api.use(middleware1);
// // api.use(middleware2);

// // api.use("/foo/*", middleware4);

// // // api.get('/*',middleware4,getRoute2)
// // api.get("/foo", getRoute3);
// // api.get("/foo/bar", getRoute);
// // api.use(middleware3);
// // // api.get('/test',getRoute2)
// // // api.use('/foo/:baz',middleware3)

// // api.get("/foo/bar", getRoute2);

// // // api.get("/foo/:bat", getRoute3);

// // //console.log(api.routes())
// // console.log(JSON.stringify(api._routes, null, 2));
// // api.routes(true);

// // api.get('/test/*',getRoute)
// // api.get('/test/testx',getRoute3)

// api.use("/:test", middleware3);
// api.get("/", function baseGetRoute(req, res) {});
// api.get("/p1/p2/:paramName", function getRoute(req, res) {});
// api.get("/p1/p2", function getRoute(req, res, next) {});
// api.get("/p1/p2", function getRoute2(req, res) {});
// api.get("/p1/*", (req, res) => {});

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe("Execution Stacks:", function () {
  it("generates basic routes (no middleware)", () => {
    // Init API instance
    const api = require("../index")({ version: "v1.0", logger: false });

    api.get("/", function getRoute() {});
    api.get("/foo", function getFooRoute() {});
    api.get("/foo/bar", function getBarRoute() {});

    expect(api.routes()).toEqual([
      ["GET", "/", ["getRoute"]],
      ["GET", "/foo", ["getFooRoute"]],
      ["GET", "/foo/bar", ["getBarRoute"]],
    ]);
  });

  it("generates basic routes (single middleware)", () => {
    // Init API instance
    const api = require("../index")({ version: "v1.0", logger: false });

    api.use(function middleware(req, res, next) {});
    api.get("/", function getRoute() {});
    api.get("/foo", function getFooRoute() {});
    api.get("/foo/bar", function getBarRoute() {});

    expect(api.routes()).toEqual([
      ["GET", "/", ["middleware", "getRoute"]],
      ["GET", "/foo", ["middleware", "getFooRoute"]],
      ["GET", "/foo/bar", ["middleware", "getBarRoute"]],
    ]);
  });

  it("adds single middleware after a route", () => {
    // Init API instance
    const api = require("../index")({ version: "v1.0", logger: false });

    api.get("/", function getRoute() {});
    api.use(function middleware(req, res, next) {});
    api.get("/foo", function getFooRoute() {});
    api.get("/foo/bar", function getBarRoute() {});

    expect(api.routes()).toEqual([
      ["GET", "/", ["getRoute"]],
      ["GET", "/foo", ["middleware", "getFooRoute"]],
      ["GET", "/foo/bar", ["middleware", "getBarRoute"]],
    ]);
  });

  it("adds single middleware after a deeper route", () => {
    // Init API instance
    const api = require("../index")({ version: "v1.0", logger: false });

    api.get("/foo", function getFooRoute() {});
    api.use(function middleware(req, res, next) {});
    api.get("/", function getRoute() {});
    api.get("/foo/bar", function getBarRoute() {});

    expect(api.routes()).toEqual([
      ["GET", "/foo", ["getFooRoute"]],
      ["GET", "/foo/bar", ["middleware", "getBarRoute"]],
      ["GET", "/", ["middleware", "getRoute"]],
    ]);
  });

  it("adds route-based middleware", () => {
    // Init API instance
    const api = require("../index")({ version: "v1.0", logger: false });

    api.use("/foo", function middleware(req, res, next) {});
    api.get("/", function getRoute() {});
    api.get("/foo", function getFooRoute() {});
    api.get("/foo/bar", function getBarRoute() {});

    expect(api.routes()).toEqual([
      ["GET", "/foo", ["middleware", "getFooRoute"]],
      ["GET", "/foo/bar", ["getBarRoute"]],
      ["GET", "/", ["getRoute"]],
    ]);
  });

  it("adds route-based middleware with *", () => {
    // Init API instance
    const api = require("../index")({ version: "v1.0", logger: false });

    api.use("/foo/*", function middleware(req, res, next) {});
    api.get("/", function getRoute() {});
    api.get("/foo", function getFooRoute() {});
    api.get("/foo/bar", function getBarRoute() {});

    expect(api.routes()).toEqual([
      ["GET", "/foo", ["getFooRoute"]],
      ["GET", "/foo/bar", ["middleware", "getBarRoute"]],
      ["GET", "/", ["getRoute"]],
    ]);
  });

  it("adds method-based middleware", () => {
    // Init API instance
    const api = require("../index")({ version: "v1.0", logger: false });

    api.get("/foo", function middleware(req, res, next) {});
    api.get("/", function getRoute() {});
    api.get("/foo", function getFooRoute() {});
    api.post("/foo", function postFooRoute() {});
    api.get("/foo/bar", function getBarRoute() {});

    expect(api.routes()).toEqual([
      ["GET", "/foo", ["middleware", "getFooRoute"]],
      ["POST", "/foo", ["postFooRoute"]],
      ["GET", "/foo/bar", ["getBarRoute"]],
      ["GET", "/", ["getRoute"]],
    ]);
  });

  it("adds method-based middleware to multiple routes", () => {
    // Init API instance
    const api = require("../index")({ version: "v1.0", logger: false });

    api.get("/foo", function middleware(req, res, next) {});
    api.get("/foo/bar", function middleware2(req, res, next) {});
    api.get("/", function getRoute() {});
    api.get("/foo", function getFooRoute() {});
    api.post("/foo", function postFooRoute() {});
    api.get("/foo/bar", function getBarRoute() {});
    api.get("/foo/baz", function getBazRoute() {});

    expect(api.routes()).toEqual([
      ["GET", "/foo", ["middleware", "getFooRoute"]],
      ["POST", "/foo", ["postFooRoute"]],
      ["GET", "/foo/bar", ["middleware2", "getBarRoute"]],
      ["GET", "/foo/baz", ["getBazRoute"]],
      ["GET", "/", ["getRoute"]],
    ]);
  });

  it("adds middleware multiple routes", () => {
    // Init API instance
    const api = require("../index")({ version: "v1.0", logger: false });

    api.use(["/foo", "/foo/baz"], function middleware(req, res, next) {});
    api.get("/", function getRoute() {});
    api.get("/foo", function getFooRoute() {});
    api.post("/foo", function postFooRoute() {});
    api.get("/foo/bar", function getBarRoute() {});
    api.get("/foo/baz", function getBazRoute() {});

    expect(api.routes()).toEqual([
      ["GET", "/foo", ["middleware", "getFooRoute"]],
      ["POST", "/foo", ["middleware", "postFooRoute"]],
      ["GET", "/foo/baz", ["middleware", "getBazRoute"]],
      ["GET", "/foo/bar", ["getBarRoute"]],
      ["GET", "/", ["getRoute"]],
    ]);
  });

  it("adds method-based middleware using *", () => {
    // Init API instance
    const api = require("../index")({ version: "v1.0", logger: false });

    api.get("/foo/*", function middleware(req, res, next) {});
    api.get("/", function getRoute() {});
    api.get("/foo", function getFooRoute() {});
    api.post("/foo", function postFooRoute() {});
    api.get("/foo/bar", function getBarRoute() {});
    api.get("/foo/baz", function getBazRoute() {});

    expect(api.routes()).toEqual([
      ["GET", "/foo", ["getFooRoute"]],
      ["POST", "/foo", ["postFooRoute"]],
      ["GET", "/foo/*", ["middleware"]],
      ["GET", "/foo/bar", ["middleware", "getBarRoute"]],
      ["GET", "/foo/baz", ["middleware", "getBazRoute"]],
      ["GET", "/", ["getRoute"]],
    ]);
  });

  it("assign multiple middleware to parameterized path", () => {
    // Init API instance
    const api = require("../index")({ version: "v1.0", logger: false });

    api.use(
      function middleware(req, res, next) {},
      function middleware2(req, res, next) {}
    );
    api.get("/foo/:bar", function getParamRoute() {});

    expect(api.routes()).toEqual([
      ["GET", "/foo/:bar", ["middleware", "middleware2", "getParamRoute"]],
    ]);
  });

  it("inherit middleware based on * routes and parameterized paths", () => {
    // Init API instance
    const api = require("../index")({ version: "v1.0", logger: false });

    api.use("/*", function middleware(req, res, next) {});
    api.get("/", function baseGetRoute(req, res) {});
    api.get("/p1/p2/:paramName", function getRoute(req, res) {});
    api.get("/p1/p2", function getRoute(req, res, next) {});
    api.get("/p1/p2", function getRoute2(req, res) {});
    api.get("/p1/p3", function getRoute3(req, res) {});
    api.get("/p1/*", function starRoute(req, res) {});
    api.get("/p1/p2/:paramName", function getRoute4(req, res) {});

    // console.log(api.routes());
    expect(api.routes()).toEqual([
      ["GET", "/", ["middleware", "baseGetRoute"]],
      ["GET", "/p1/p2", ["middleware", "getRoute", "getRoute2"]],
      ["GET", "/p1/p2/:paramName", ["middleware", "getRoute", "getRoute4"]],
      ["GET", "/p1/p3", ["middleware", "getRoute3"]],
      ["GET", "/p1/*", ["middleware", "starRoute"]],
    ]);
  });

  it.skip("inherit additional middleware after a * middleware is applied", () => {
    // Init API instance
    const api = require("../index")({ version: "v1.0", logger: false });

    api.use(function middleware(req, res, next) {});
    // api.use(["/data"], function middlewareX(req, res, next) {});
    api.use(["/data/*"], function middleware2(req, res, next) {});
    api.use(function middleware3(req, res, next) {});

    api.get("/", function getRoute(req, res) {});
    api.get("/data", function getDataRoute(req, res) {});
    api.get("/data/test", function getNestedDataRoute(req, res) {});

    console.log(api.routes());
    // expect(api.routes()).toEqual([
    //   ["GET", "/", ["middleware", "baseGetRoute"]],
    //   ["GET", "/p1/p2", ["middleware", "getRoute", "getRoute2"]],
    //   ["GET", "/p1/p2/:paramName", ["middleware", "getRoute", "getRoute4"]],
    //   ["GET", "/p1/p3", ["middleware", "getRoute3"]],
    //   ["GET", "/p1/*", ["middleware", "starRoute"]],
    // ]);
  });
}); // end ROUTE tests
