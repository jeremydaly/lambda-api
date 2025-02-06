import { expectType, expectError } from 'tsd';
import {
  API,
  Request,
  Response,
  CookieOptions,
  CorsOptions,
  FileOptions,
  LoggerOptions,
  Options,
  Middleware,
  ErrorHandlingMiddleware,
  HandlerFunction,
  METHODS,
  RouteError,
  MethodError,
  ConfigurationError,
  ResponseError,
  FileError,
} from './index';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  Context,
  ALBEvent,
} from 'aws-lambda';

const options: Options = {
  base: '/api',
  version: 'v1',
  logger: {
    level: 'info',
    access: true,
    timestamp: true,
  },
  compression: true,
};
expectType<Options>(options);

const req = {} as Request;
expectType<string>(req.method);
expectType<string>(req.path);
expectType<{ [key: string]: string | undefined }>(req.params);
expectType<{ [key: string]: string | undefined }>(req.query);
expectType<{ [key: string]: string | undefined }>(req.headers);
expectType<any>(req.body);
expectType<{ [key: string]: string }>(req.cookies);

const apiGwV1Event: APIGatewayProxyEvent = {
  body: '{"test":"body"}',
  headers: { 'content-type': 'application/json' },
  multiValueHeaders: { 'content-type': ['application/json'] },
  httpMethod: 'POST',
  isBase64Encoded: false,
  path: '/test',
  pathParameters: { id: '123' },
  queryStringParameters: { query: 'test' },
  multiValueQueryStringParameters: { query: ['test'] },
  stageVariables: { stage: 'dev' },
  requestContext: {
    accountId: '',
    apiId: '',
    authorizer: {},
    protocol: '',
    httpMethod: 'POST',
    identity: {
      accessKey: null,
      accountId: null,
      apiKey: null,
      apiKeyId: null,
      caller: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      sourceIp: '',
      user: null,
      userAgent: null,
      userArn: null,
    },
    path: '/test',
    stage: 'dev',
    requestId: '',
    requestTimeEpoch: 0,
    resourceId: '',
    resourcePath: '',
  },
  resource: '',
};

const apiGwV2Event: APIGatewayProxyEventV2 = {
  version: '2.0',
  routeKey: 'POST /test',
  rawPath: '/test',
  rawQueryString: 'query=test',
  headers: { 'content-type': 'application/json' },
  requestContext: {
    accountId: '',
    apiId: '',
    domainName: '',
    domainPrefix: '',
    http: {
      method: 'POST',
      path: '/test',
      protocol: 'HTTP/1.1',
      sourceIp: '',
      userAgent: '',
    },
    requestId: '',
    routeKey: 'POST /test',
    stage: 'dev',
    time: '',
    timeEpoch: 0,
  },
  body: '{"test":"body"}',
  isBase64Encoded: false,
};

const albEvent: ALBEvent = {
  requestContext: {
    elb: {
      targetGroupArn: '',
    },
  },
  httpMethod: 'GET',
  path: '/test',
  queryStringParameters: {},
  headers: {},
  body: '',
  isBase64Encoded: false,
};

const context: Context = {
  callbackWaitsForEmptyEventLoop: true,
  functionName: '',
  functionVersion: '',
  invokedFunctionArn: '',
  memoryLimitInMB: '',
  awsRequestId: '',
  logGroupName: '',
  logStreamName: '',
  getRemainingTimeInMillis: () => 0,
  done: () => {},
  fail: () => {},
  succeed: () => {},
};

const api = new API();
expectType<Promise<any>>(api.run(apiGwV1Event, context));
expectType<Promise<any>>(api.run(apiGwV2Event, context));
// @ts-expect-error ALB events are not supported
expectType<void & Promise<any>>(api.run(albEvent, context));

const res = {} as Response;
expectType<Response>(res.status(200));
expectType<Response>(res.header('Content-Type', 'application/json'));
expectType<Response>(
  res.cookie('session', 'value', {
    httpOnly: true,
    secure: true,
  })
);

expectType<void>(res.send({ message: 'test' }));
expectType<void>(res.json({ message: 'test' }));
expectType<void>(res.html('<div>test</div>'));

expectType<void>(res.error('Test error'));
expectType<void>(
  res.error(500, 'Server error', { details: 'Additional info' })
);

expectType<void>(res.redirect('/new-path'));

const middleware: Middleware = (req, res, next) => {
  next();
};
expectType<Middleware>(middleware);

const errorMiddleware: ErrorHandlingMiddleware = (error, req, res, next) => {
  res.status(500).json({ error: error.message });
};
expectType<ErrorHandlingMiddleware>(errorMiddleware);

const handler: HandlerFunction = (req, res) => {
  res.json({ success: true });
};
expectType<HandlerFunction>(handler);

const cookieOptions: CookieOptions = {
  domain: 'example.com',
  httpOnly: true,
  secure: true,
  sameSite: 'Strict',
};
expectType<CookieOptions>(cookieOptions);

const corsOptions: CorsOptions = {
  origin: '*',
  methods: 'GET,POST',
  headers: 'Content-Type,Authorization',
  credentials: true,
};
expectType<CorsOptions>(corsOptions);

const fileOptions: FileOptions = {
  maxAge: 3600,
  root: '/public',
  lastModified: true,
  headers: { 'Cache-Control': 'public' },
};
expectType<FileOptions>(fileOptions);

const loggerOptions: LoggerOptions = {
  level: 'info',
  access: true,
  timestamp: true,
  sampling: {
    target: 10,
    rate: 0.1,
  },
};
expectType<LoggerOptions>(loggerOptions);

const methods: METHODS[] = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'OPTIONS',
  'HEAD',
  'ANY',
];
expectType<METHODS[]>(methods);

const routeError = new RouteError('Route not found', '/api/test');
expectType<RouteError>(routeError);

const methodError = new MethodError(
  'Method not allowed',
  'POST' as METHODS,
  '/api/test'
);
expectType<MethodError>(methodError);

const configError = new ConfigurationError('Invalid configuration');
expectType<ConfigurationError>(configError);

const responseError = new ResponseError('Response error', 500);
expectType<ResponseError>(responseError);

const fileError = new FileError('File not found', {
  code: 'ENOENT',
  syscall: 'open',
});
expectType<FileError>(fileError);
