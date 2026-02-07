'use strict';

const isApiGatewayContext = (context) => {
  return 'identity' in context;
};

const isApiGatewayV2Context = (context) => {
  return 'http' in context;
};

const isAlbContext = (context) => {
  return 'elb' in context;
};

const isApiGatewayEvent = (event) => {
  return event.requestContext && 'identity' in event.requestContext;
};

const isApiGatewayV2Event = (event) => {
  return event.requestContext && 'http' in event.requestContext;
};

const isAlbEvent = (event) => {
  return event.requestContext && 'elb' in event.requestContext;
};

const isApiGatewayRequest = (req) => {
  return req.requestContext && 'identity' in req.requestContext;
};

const isApiGatewayV2Request = (req) => {
  return req.requestContext && 'http' in req.requestContext;
};

const isAlbRequest = (req) => {
  return req.requestContext && 'elb' in req.requestContext;
};

module.exports = {
  isApiGatewayContext,
  isApiGatewayV2Context,
  isAlbContext,
  isApiGatewayEvent,
  isApiGatewayV2Event,
  isAlbEvent,
  isApiGatewayRequest,
  isApiGatewayV2Request,
  isAlbRequest,
};
