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

const isApiGatewayEvent = (event) => {
  return 'resource' in event && 'httpMethod' in event;
};

const isApiGatewayV2Event = (event) => {
  return 'version' in event && event.version === '2.0';
};

const isAlbEvent = (event) => {
  return 'requestContext' in event && 'elb' in (event.requestContext || {});
};

const isApiGatewayRequest = (req) => {
  return isApiGatewayContext(req.requestContext);
};

const isApiGatewayV2Request = (req) => {
  return isApiGatewayV2Context(req.requestContext);
};

const isAlbRequest = (req) => {
  return isAlbContext(req.requestContext);
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
