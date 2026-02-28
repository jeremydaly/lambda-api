"use strict";

const {
  isApiGatewayContext,
  isApiGatewayV2Context,
  isAlbContext,
  isApiGatewayEvent,
  isApiGatewayV2Event,
  isAlbEvent,
  isApiGatewayRequest,
  isApiGatewayV2Request,
  isAlbRequest,
} = require("../lib/typeguards");

const apiGatewayV1Event = require("./sample-event-apigateway-v1.json");
const apiGatewayV2Event = require("./sample-event-apigateway-v2.json");
const albEvent1 = require("./sample-event-alb1.json");
const albEvent2 = require("./sample-event-alb2.json");

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe("Type Guard Tests:", function () {
  describe("Context Guards:", function () {
    it("isApiGatewayContext returns true for API Gateway v1 context", function () {
      expect(isApiGatewayContext(apiGatewayV1Event.requestContext)).toBe(true);
    });

    it("isApiGatewayContext returns false for API Gateway v2 context", function () {
      expect(isApiGatewayContext(apiGatewayV2Event.requestContext)).toBe(false);
    });

    it("isApiGatewayContext returns false for ALB context", function () {
      expect(isApiGatewayContext(albEvent1.requestContext)).toBe(false);
    });

    it("isApiGatewayV2Context returns true for API Gateway v2 context", function () {
      expect(isApiGatewayV2Context(apiGatewayV2Event.requestContext)).toBe(true);
    });

    it("isApiGatewayV2Context returns false for API Gateway v1 context", function () {
      expect(isApiGatewayV2Context(apiGatewayV1Event.requestContext)).toBe(false);
    });

    it("isApiGatewayV2Context returns false for ALB context", function () {
      expect(isApiGatewayV2Context(albEvent1.requestContext)).toBe(false);
    });

    it("isAlbContext returns true for ALB context", function () {
      expect(isAlbContext(albEvent1.requestContext)).toBe(true);
    });

    it("isAlbContext returns false for API Gateway v1 context", function () {
      expect(isAlbContext(apiGatewayV1Event.requestContext)).toBe(false);
    });

    it("isAlbContext returns false for API Gateway v2 context", function () {
      expect(isAlbContext(apiGatewayV2Event.requestContext)).toBe(false);
    });
  });

  describe("Event Guards:", function () {
    it("isApiGatewayEvent returns true for API Gateway v1 event", function () {
      expect(isApiGatewayEvent(apiGatewayV1Event)).toBe(true);
    });

    it("isApiGatewayEvent returns false for API Gateway v2 event", function () {
      expect(isApiGatewayEvent(apiGatewayV2Event)).toBe(false);
    });

    it("isApiGatewayEvent returns false for ALB event", function () {
      expect(isApiGatewayEvent(albEvent1)).toBe(false);
    });

    it("isApiGatewayV2Event returns true for API Gateway v2 event", function () {
      expect(isApiGatewayV2Event(apiGatewayV2Event)).toBe(true);
    });

    it("isApiGatewayV2Event returns false for API Gateway v1 event", function () {
      expect(isApiGatewayV2Event(apiGatewayV1Event)).toBe(false);
    });

    it("isApiGatewayV2Event returns false for ALB event", function () {
      expect(isApiGatewayV2Event(albEvent1)).toBe(false);
    });

    it("isAlbEvent returns true for ALB event", function () {
      expect(isAlbEvent(albEvent1)).toBe(true);
    });

    it("isAlbEvent returns true for ALB multi-value event", function () {
      expect(isAlbEvent(albEvent2)).toBe(true);
    });

    it("isAlbEvent returns false for API Gateway v1 event", function () {
      expect(isAlbEvent(apiGatewayV1Event)).toBe(false);
    });

    it("isAlbEvent returns false for API Gateway v2 event", function () {
      expect(isAlbEvent(apiGatewayV2Event)).toBe(false);
    });
  });

  describe("Request Guards:", function () {
    it("isApiGatewayRequest returns true for request with API Gateway v1 context", function () {
      expect(isApiGatewayRequest({ requestContext: apiGatewayV1Event.requestContext })).toBe(true);
    });

    it("isApiGatewayRequest returns false for request with API Gateway v2 context", function () {
      expect(isApiGatewayRequest({ requestContext: apiGatewayV2Event.requestContext })).toBe(false);
    });

    it("isApiGatewayRequest returns false for request with ALB context", function () {
      expect(isApiGatewayRequest({ requestContext: albEvent1.requestContext })).toBe(false);
    });

    it("isApiGatewayV2Request returns true for request with API Gateway v2 context", function () {
      expect(isApiGatewayV2Request({ requestContext: apiGatewayV2Event.requestContext })).toBe(true);
    });

    it("isApiGatewayV2Request returns false for request with API Gateway v1 context", function () {
      expect(isApiGatewayV2Request({ requestContext: apiGatewayV1Event.requestContext })).toBe(false);
    });

    it("isApiGatewayV2Request returns false for request with ALB context", function () {
      expect(isApiGatewayV2Request({ requestContext: albEvent1.requestContext })).toBe(false);
    });

    it("isAlbRequest returns true for request with ALB context", function () {
      expect(isAlbRequest({ requestContext: albEvent1.requestContext })).toBe(true);
    });

    it("isAlbRequest returns false for request with API Gateway v1 context", function () {
      expect(isAlbRequest({ requestContext: apiGatewayV1Event.requestContext })).toBe(false);
    });

    it("isAlbRequest returns false for request with API Gateway v2 context", function () {
      expect(isAlbRequest({ requestContext: apiGatewayV2Event.requestContext })).toBe(false);
    });
  });
});
