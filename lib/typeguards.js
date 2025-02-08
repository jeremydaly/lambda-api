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

module.exports = {
  isApiGatewayContext,
  isApiGatewayV2Context,
  isAlbContext,
};
