'use strict';

const isApiGatewayContext = (context) => {
  return context && 'identity' in context;
};

const isApiGatewayV2Context = (context) => {
  return context && 'http' in context;
};

const isAlbContext = (context) => {
  return context && 'elb' in context;
};

const isApiGatewayEvent = (event) => {
  return event && event.requestContext && 'identity' in event.requestContext;
};

const isApiGatewayV2Event = (event) => {
  return event && event.requestContext && 'http' in event.requestContext;
};

const isAlbEvent = (event) => {
  return event && event.requestContext && 'elb' in event.requestContext;
};

const isApiGatewayRequest = (req) => {
  return req && req.requestContext && 'identity' in req.requestContext;
};

const isApiGatewayV2Request = (req) => {
  return req && req.requestContext && 'http' in req.requestContext;
};

const isAlbRequest = (req) => {
  return req && req.requestContext && 'elb' in req.requestContext;
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
