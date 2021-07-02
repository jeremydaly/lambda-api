"use strict";

// Init API instance
const api = require("../index")({ version: "v1.0" });
const api2 = require("../index")({ version: "v2.0" });

let event = {
  httpMethod: "get",
  path: "/test",
  body: {},
  multiValueHeaders: {
    "content-type": ["application/json"],
  },
};

/******************************************************************************/
/***  REGISTER ROUTES                                                       ***/
/******************************************************************************/

api.register(require("./_testRoutes-v1"), { prefix: "/v1" });
api.register(require("./_testRoutes-v1"), { prefix: "/vX/vY" });
api.register(require("./_testRoutes-v1"), { prefix: "" });
api.register(require("./_testRoutes-v2"), { prefix: "/v2" });
api.register(require("./_testRoutes-v3")); // no options
api2.register(require("./_testRoutes-v3"), ["array"]); // w/ array options
api2.register(require("./_testRoutes-v3"), "string"); // w/ string

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe("Register Tests:", function () {
  it("No prefix", async function () {
    let _event = Object.assign({}, event, { path: "/test-register" });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/test-register","route":"/test-register","method":"GET"}',
      isBase64Encoded: false,
    });
  }); // end it

  it("No prefix (nested)", async function () {
    let _event = Object.assign({}, event, { path: "/test-register/sub1" });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/test-register/sub1","route":"/test-register/sub1","method":"GET"}',
      isBase64Encoded: false,
    });
  }); // end it

  it("No prefix (nested w/ param)", async function () {
    let _event = Object.assign({}, event, { path: "/test-register/TEST/test" });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/test-register/TEST/test","route":"/test-register/:param1/test","method":"GET","params":{"param1":"TEST"}}',
      isBase64Encoded: false,
    });
  }); // end it

  it("With prefix", async function () {
    let _event = Object.assign({}, event, { path: "/v1/test-register" });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/v1/test-register","route":"/test-register","method":"GET"}',
      isBase64Encoded: false,
    });
  }); // end it

  it("With prefix (nested)", async function () {
    let _event = Object.assign({}, event, { path: "/v1/test-register/sub1" });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/v1/test-register/sub1","route":"/test-register/sub1","method":"GET"}',
      isBase64Encoded: false,
    });
  }); // end it

  it("With prefix (nested w/ param)", async function () {
    let _event = Object.assign({}, event, {
      path: "/v1/test-register/TEST/test",
    });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/v1/test-register/TEST/test","route":"/test-register/:param1/test","method":"GET","params":{"param1":"TEST"}}',
      isBase64Encoded: false,
    });
  }); // end it

  it("With double prefix", async function () {
    let _event = Object.assign({}, event, { path: "/vX/vY/test-register" });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/vX/vY/test-register","route":"/test-register","method":"GET"}',
      isBase64Encoded: false,
    });
  }); // end it

  it("With double prefix (nested)", async function () {
    let _event = Object.assign({}, event, {
      path: "/vX/vY/test-register/sub1",
    });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/vX/vY/test-register/sub1","route":"/test-register/sub1","method":"GET"}',
      isBase64Encoded: false,
    });
  }); // end it

  it("With double prefix (nested w/ param)", async function () {
    let _event = Object.assign({}, event, {
      path: "/vX/vY/test-register/TEST/test",
    });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/vX/vY/test-register/TEST/test","route":"/test-register/:param1/test","method":"GET","params":{"param1":"TEST"}}',
      isBase64Encoded: false,
    });
  }); // end it

  it("With recursive prefix", async function () {
    let _event = Object.assign({}, event, { path: "/vX/vY/vZ/test-register" });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/vX/vY/vZ/test-register","route":"/test-register","method":"GET"}',
      isBase64Encoded: false,
    });
  }); // end it

  it("With recursive prefix (nested)", async function () {
    let _event = Object.assign({}, event, {
      path: "/vX/vY/vZ/test-register/sub1",
    });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/vX/vY/vZ/test-register/sub1","route":"/test-register/sub1","method":"GET"}',
      isBase64Encoded: false,
    });
  }); // end it

  it("With recursive prefix (nested w/ param)", async function () {
    let _event = Object.assign({}, event, {
      path: "/vX/vY/vZ/test-register/TEST/test",
    });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/vX/vY/vZ/test-register/TEST/test","route":"/test-register/:param1/test","method":"GET","params":{"param1":"TEST"}}',
      isBase64Encoded: false,
    });
  }); // end it

  it("After recursive interation", async function () {
    let _event = Object.assign({}, event, {
      path: "/vX/vY/test-register/sub2",
    });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/vX/vY/test-register/sub2","route":"/test-register/sub2","method":"GET"}',
      isBase64Encoded: false,
    });
  }); // end it

  it("New prefix", async function () {
    let _event = Object.assign({}, event, { path: "/v2/test-register" });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/v2/test-register","route":"/test-register","method":"GET"}',
      isBase64Encoded: false,
    });
  }); // end it

  it("New prefix (nested)", async function () {
    let _event = Object.assign({}, event, { path: "/v2/test-register/sub1" });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/v2/test-register/sub1","route":"/test-register/sub1","method":"GET"}',
      isBase64Encoded: false,
    });
  }); // end it

  it("New prefix (nested w/ param)", async function () {
    let _event = Object.assign({}, event, {
      path: "/v2/test-register/TEST/test",
    });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/v2/test-register/TEST/test","route":"/test-register/:param1/test","method":"GET","params":{"param1":"TEST"}}',
      isBase64Encoded: false,
    });
  }); // end it

  it("No options/no prefix", async function () {
    let _event = Object.assign({}, event, {
      path: "/test-register-no-options",
    });
    let result = await new Promise((r) =>
      api.run(_event, {}, (e, res) => {
        r(res);
      })
    );
    expect(result).toEqual({
      multiValueHeaders: { "content-type": ["application/json"] },
      statusCode: 200,
      body: '{"path":"/test-register-no-options","route":"/test-register-no-options","method":"GET"}',
      isBase64Encoded: false,
    });
  }); // end it

  it("Base path w/ multiple unprefixed registers", async function () {
    const api = require("../index")({
      base: "base-path",
    });
    api.register(
      (api) => {
        api.get("/foo", async () => {});
      },
      { prefix: "fuz" }
    );
    api.register((api) => {
      api.get("/bar", async () => {});
    });
    api.register((api) => {
      api.get("/baz", async () => {});
    });

    expect(api.routes()).toEqual([
      ["GET", "/base-path/fuz/foo", ["unnamed"]],
      ["GET", "/base-path/bar", ["unnamed"]],
      ["GET", "/base-path/baz", ["unnamed"]],
    ]);
  }); // end it
}); // end ROUTE tests
