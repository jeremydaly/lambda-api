import { expectType } from 'tsd';
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
  Event,
  ALBContext,
  APIGatewayV2Context,
  APIGatewayContext,
  RegisterOptions,
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
expectType<Record<string, string | undefined>>(req.params);
expectType<Record<string, string | undefined>>(req.query);
expectType<{ [key: string]: string | undefined }>(req.headers);
expectType<any>(req.body);
expectType<{ [key: string]: string }>(req.cookies);
expectType<APIGatewayContext>(req.requestContext);

type ALBParams = { userId: string };
type ALBQuery = { filter: string };
type ALBBody = { data: string };

const albReq = {} as Request<ALBContext, ALBQuery, ALBParams, ALBBody>;
expectType<ALBContext>(albReq.requestContext);
expectType<{ filter: string | undefined }>(albReq.query);
expectType<{ userId: string | undefined }>(albReq.params);
expectType<{ data: string }>(albReq.body);

const typedMiddleware: Middleware<
  UserResponse,
  ALBContext,
  ALBQuery,
  ALBParams,
  ALBBody
> = (req, res, next) => {
  expectType<ALBContext>(req.requestContext);
  expectType<{ filter: string | undefined }>(req.query);
  expectType<{ userId: string | undefined }>(req.params);
  expectType<{ data: string }>(req.body);
  next();
};

const typedHandler: HandlerFunction<
  UserResponse,
  ALBContext,
  ALBQuery,
  ALBParams,
  ALBBody
> = (req, res) => {
  expectType<ALBContext>(req.requestContext);
  expectType<{ filter: string | undefined }>(req.query);
  expectType<{ userId: string | undefined }>(req.params);
  expectType<{ data: string }>(req.body);
  res.json({
    id: '123',
    name: 'John',
    email: 'john@example.com',
  });
};

type ApiGwV2Params = { id: string };
type ApiGwV2Query = { page: string };
type ApiGwV2Body = { name: string };

const apiGwV2Req = {} as Request<
  APIGatewayV2Context,
  ApiGwV2Query,
  ApiGwV2Params,
  ApiGwV2Body
>;
expectType<APIGatewayV2Context>(apiGwV2Req.requestContext);
expectType<{ page: string | undefined }>(apiGwV2Req.query);
expectType<{ id: string | undefined }>(apiGwV2Req.params);
expectType<{ name: string }>(apiGwV2Req.body);

const api = new API();
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

expectType<Promise<any>>(api.run(apiGwV1Event, context));
expectType<Promise<any>>(api.run(apiGwV2Event, context));
expectType<Promise<any>>(api.run(albEvent, context));

expectType<Event>(apiGwV1Event);
expectType<Event>(apiGwV2Event);
expectType<Event>(albEvent);

interface UserResponse {
  id: string;
  name: string;
  email: string;
}

interface ErrorResponse {
  code: number;
  message: string;
}

interface UserParams extends Record<string, string | undefined> {
  id: string;
}

interface UserQuery extends Record<string, string | undefined> {
  fields: string;
}

interface UserBody {
  name: string;
  email: string;
}

const testApi = new API();

const albHandler: HandlerFunction<
  UserResponse,
  ALBContext,
  UserQuery,
  UserParams,
  UserBody
> = (req, res) => {
  const { id } = req.params;
  const { fields } = req.query;
  const { name, email } = req.body;
  const { elb } = req.requestContext;

  res.json({
    id: id || 'new',
    name,
    email,
  });
};

const apiGwV2Handler: HandlerFunction<UserResponse, APIGatewayV2Context> = (
  req,
  res
) => {
  const { requestContext } = req;
  const { domainName, domainPrefix } = requestContext;

  res.json({
    id: req.params.id || '',
    name: 'John',
    email: 'john@example.com',
  });
};

testApi.post('/users/:id', albHandler);
testApi.get('/users/:id', apiGwV2Handler);

expectType<Promise<UserResponse>>(
  testApi.run<UserResponse>(apiGwV1Event, context)
);

testApi.run<UserResponse>(apiGwV1Event, context, (err, result) => {
  expectType<UserResponse>(result);
});

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

const defaultReq = {} as Request;
expectType<APIGatewayContext>(defaultReq.requestContext);
expectType<Record<string, string | undefined>>(defaultReq.query);
expectType<Record<string, string | undefined>>(defaultReq.params);
expectType<any>(defaultReq.body);

const defaultMiddleware: Middleware = (req, res, next) => {
  expectType<APIGatewayContext>(req.requestContext);
  expectType<Record<string, string | undefined>>(req.query);
  expectType<Record<string, string | undefined>>(req.params);
  expectType<any>(req.body);
  expectType<Response<any>>(res);
  next();
};

const errorMiddleware: ErrorHandlingMiddleware<ErrorResponse> = (
  error,
  req,
  res,
  next
) => {
  expectType<APIGatewayContext>(req.requestContext);
  expectType<Record<string, string | undefined>>(req.query);
  expectType<Record<string, string | undefined>>(req.params);
  expectType<any>(req.body);
  expectType<Response<ErrorResponse>>(res);
  res.status(500).json({ code: 500, message: error.message });
  next();
};

const partialContextReq = {} as Request<ALBContext>;
expectType<ALBContext>(partialContextReq.requestContext);
expectType<Record<string, string | undefined>>(partialContextReq.query);
expectType<Record<string, string | undefined>>(partialContextReq.params);
expectType<any>(partialContextReq.body);

const partialContextAndQueryReq = {} as Request<ALBContext, ALBQuery>;
expectType<ALBContext>(partialContextAndQueryReq.requestContext);
expectType<{ filter: string | undefined }>(partialContextAndQueryReq.query);
expectType<Record<string, string | undefined>>(
  partialContextAndQueryReq.params
);
expectType<any>(partialContextAndQueryReq.body);

const stringResponse = {} as Response<string>;
expectType<void>(stringResponse.json('test'));
expectType<void>(stringResponse.send('test'));

const numberResponse = {} as Response<number>;
expectType<void>(numberResponse.json(42));
expectType<void>(numberResponse.send(42));

testApi.get<string>('/echo', (req, res) => res.send('hello'));

testApi.post<number, APIGatewayContext>('/count', (req, res) => res.json(42));

testApi.put<boolean, ALBContext, Record<string, string | undefined>>(
  '/flag',
  (req, res) => res.json(true)
);

testApi.use((req, res, next) => {
  expectType<APIGatewayContext>(req.requestContext);
  next();
});

testApi.use<UserResponse, ALBContext>('/users', (req, res, next) => {
  expectType<ALBContext>(req.requestContext);
  next();
});

testApi.use<UserResponse, ALBContext, UserQuery>(
  ['/users', '/admin'],
  (req, res, next) => {
    expectType<ALBContext>(req.requestContext);
    expectType<{ fields: string | undefined }>(req.query);
    next();
  }
);

testApi.finally<UserResponse>((req, res) => {
  expectType<Request>(req);
  expectType<Response<UserResponse>>(res);
});

testApi.METHOD<UserResponse>('GET', '/users', (req, res) => {
  res.json({ id: '1', name: 'John', email: 'john@example.com' });
});

testApi.METHOD<UserResponse, ALBContext>(
  ['GET', 'POST'],
  '/users',
  (req, res) => {
    expectType<ALBContext>(req.requestContext);
    res.json({ id: '1', name: 'John', email: 'john@example.com' });
  }
);

testApi.register(
  (api, options) => {
    expectType<API>(api);
    expectType<RegisterOptions | undefined>(options);
  },
  { prefix: '/api' }
);

const routesArray = testApi.routes(false);
expectType<string[][]>(routesArray);

testApi.routes(true);
