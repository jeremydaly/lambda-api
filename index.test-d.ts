import { expectType } from 'tsd';

import {
  API,
  Request,
  Response,
  ALBContext,
  APIGatewayV2Context,
  APIGatewayContext,
  ErrorHandlingMiddleware,
  HandlerFunction,
  Middleware,
  NextFunction,
  RequestContext,
  isApiGatewayContext,
  isApiGatewayV2Context,
  isAlbContext,
  isApiGatewayRequest,
  isApiGatewayV2Request,
  isAlbRequest,
  isApiGatewayEvent,
  isApiGatewayV2Event,
  isAlbEvent,
  App,
} from './index';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  ALBEvent,
  Context,
} from 'aws-lambda';

interface UserResponse {
  id: string;
  name: string;
  email: string;
}

interface UserQuery extends Record<string, string | undefined> {
  fields?: string;
}

interface UserParams extends Record<string, string | undefined> {
  id?: string;
}

interface UserBody {
  name: string;
  email: string;
}

interface AuthInfo {
  userId: string;
  roles: string[];
  type: 'Bearer' | 'Basic' | 'OAuth' | 'Digest' | 'none';
  value: string | null;
}

function hasAuth(req: Request): req is Request & { auth: AuthInfo } {
  return 'auth' in req && req.auth?.type !== undefined;
}

const api = new API();

const testContextTypeGuards = () => {
  const apiGatewayContext: APIGatewayContext = {} as APIGatewayContext;
  const apiGatewayV2Context: APIGatewayV2Context = {} as APIGatewayV2Context;
  const albContext: ALBContext = {} as ALBContext;

  if (isApiGatewayContext(apiGatewayContext)) {
    expectType<APIGatewayContext>(apiGatewayContext);
  }

  if (isApiGatewayV2Context(apiGatewayV2Context)) {
    expectType<APIGatewayV2Context>(apiGatewayV2Context);
  }

  if (isAlbContext(albContext)) {
    expectType<ALBContext>(albContext);
  }
};

const testEventTypeGuards = () => {
  const apiGatewayEvent: APIGatewayProxyEvent = {} as APIGatewayProxyEvent;
  const apiGatewayV2Event: APIGatewayProxyEventV2 =
    {} as APIGatewayProxyEventV2;
  const albEvent: ALBEvent = {} as ALBEvent;

  if (isApiGatewayEvent(apiGatewayEvent)) {
    expectType<APIGatewayProxyEvent>(apiGatewayEvent);
  }

  if (isApiGatewayV2Event(apiGatewayV2Event)) {
    expectType<APIGatewayProxyEventV2>(apiGatewayV2Event);
  }

  if (isAlbEvent(albEvent)) {
    expectType<ALBEvent>(albEvent);
  }
};

const sourceAgnosticMiddleware: Middleware<any, RequestContext> = (
  req,
  res,
  next
) => {
  if (isApiGatewayContext(req.requestContext)) {
    expectType<string>(req.requestContext.requestId);
    const sourceIp = req.requestContext.identity.sourceIp;
    if (sourceIp) {
      expectType<string>(sourceIp);
    }
  } else if (isApiGatewayV2Context(req.requestContext)) {
    expectType<string>(req.requestContext.requestId);
    const sourceIp = req.requestContext.http.sourceIp;
    if (sourceIp) {
      expectType<string>(sourceIp);
    }
  } else if (isAlbContext(req.requestContext)) {
    expectType<{ targetGroupArn: string }>(req.requestContext.elb);
  }
  next();
};

const albMiddleware: Middleware<
  UserResponse,
  ALBContext,
  UserQuery,
  UserParams,
  UserBody
> = (req, res, next) => {
  expectType<{ targetGroupArn: string }>(req.requestContext.elb);
  next();
};

const apiGwV2Middleware: Middleware<
  UserResponse,
  APIGatewayV2Context,
  UserQuery,
  UserParams,
  UserBody
> = (req, res, next) => {
  expectType<string>(req.requestContext.accountId);
  next();
};

const albHandler: HandlerFunction<
  UserResponse,
  ALBContext,
  UserQuery,
  UserParams,
  UserBody
> = (req, res) => {
  expectType<{ targetGroupArn: string }>(req.requestContext.elb);
  res.json({
    id: '1',
    name: req.body.name,
    email: req.body.email,
  });
};

const apiGwV2Handler: HandlerFunction<
  UserResponse,
  APIGatewayV2Context,
  UserQuery,
  UserParams,
  UserBody
> = (req, res) => {
  expectType<string>(req.requestContext.accountId);
  res.json({
    id: '1',
    name: req.body.name,
    email: req.body.email,
  });
};

const testRequestTypeGuards = () => {
  const req = {} as Request<RequestContext>;

  if (isApiGatewayRequest(req)) {
    expectType<Request<APIGatewayContext>>(req);
  }

  if (isApiGatewayV2Request(req)) {
    expectType<Request<APIGatewayV2Context>>(req);
  }

  if (isAlbRequest(req)) {
    expectType<Request<ALBContext>>(req);
  }
};

const sourceAgnosticHandler: HandlerFunction<UserResponse, RequestContext> = (
  req,
  res
) => {
  expectType<string>(req.method);
  expectType<string>(req.path);
  expectType<Record<string, string | undefined>>(req.query);
  expectType<Record<string, string | undefined>>(req.headers);
  expectType<string>(req.ip);

  if (isApiGatewayContext(req.requestContext)) {
    expectType<string>(req.requestContext.requestId);
    expectType<string>(req.requestContext.identity.sourceIp);
    res.json({
      id: req.requestContext.requestId,
      name: 'API Gateway User',
      email: 'user@apigateway.com',
    });
  } else if (isApiGatewayV2Context(req.requestContext)) {
    expectType<string>(req.requestContext.requestId);
    expectType<string>(req.requestContext.http.sourceIp);
    res.json({
      id: req.requestContext.requestId,
      name: 'API Gateway V2 User',
      email: 'user@apigatewayv2.com',
    });
  } else if (isAlbContext(req.requestContext)) {
    expectType<{ targetGroupArn: string }>(req.requestContext.elb);
    res.json({
      id: req.requestContext.elb.targetGroupArn,
      name: 'ALB User',
      email: 'user@alb.com',
    });
  }
};

api.get<UserResponse>('/source-agnostic', sourceAgnosticHandler);
api.post<UserResponse>(
  '/source-agnostic',
  sourceAgnosticMiddleware,
  sourceAgnosticHandler
);

api.post<UserResponse, RequestContext>(
  '/users',
  sourceAgnosticMiddleware,
  (req: Request<RequestContext>, res: Response<UserResponse>) => {
    res.json({
      id: '1',
      name: 'John',
      email: 'john@example.com',
    });
  }
);

api.post<UserResponse, ALBContext, UserQuery, UserParams, UserBody>(
  '/alb-users',
  albMiddleware,
  albHandler
);

api.post<UserResponse, APIGatewayV2Context, UserQuery, UserParams, UserBody>(
  '/v2-users',
  apiGwV2Middleware,
  apiGwV2Handler
);

const errorHandler: ErrorHandlingMiddleware = (error, req, res, next) => {
  if (isAlbContext(req.requestContext)) {
    res.status(500).json({
      id: 'alb-error',
      name: error.name,
      email: error.message,
    });
  } else {
    res.status(500).json({
      id: 'error',
      name: error.name,
      email: error.message,
    });
  }
};

api.use(errorHandler);

api.finally((req, res) => {
  if (isApiGatewayContext(req.requestContext)) {
    console.log('API Gateway request completed');
  } else if (isApiGatewayV2Context(req.requestContext)) {
    console.log('API Gateway v2 request completed');
  } else if (isAlbContext(req.requestContext)) {
    console.log('ALB request completed');
  }
});

const result = api.run<UserResponse>({} as APIGatewayProxyEvent, {} as Context);
expectType<Promise<UserResponse>>(result);

api.run<UserResponse>({} as APIGatewayProxyEvent, {} as Context, (err, res) => {
  expectType<Error>(err);
  expectType<UserResponse>(res);
});

const testHttpMethods = () => {
  api.get<UserResponse, APIGatewayContext, UserQuery, UserParams>(
    '/users/:id',
    (
      req: Request<APIGatewayContext, UserQuery, UserParams>,
      res: Response<UserResponse>
    ) => {
      expectType<string | undefined>(req.params.id);
      res.json({ id: '1', name: 'John', email: 'test@example.com' });
    }
  );

  api.put<UserResponse, APIGatewayContext, UserQuery, UserParams, UserBody>(
    '/users/:id',
    (
      req: Request<APIGatewayContext, UserQuery, UserParams, UserBody>,
      res: Response<UserResponse>
    ) => {
      expectType<UserBody>(req.body);
      res
        .status(200)
        .json({ id: '1', name: req.body.name, email: req.body.email });
    }
  );

  api.patch<
    UserResponse,
    APIGatewayContext,
    UserQuery,
    UserParams,
    Partial<UserBody>
  >(
    '/users/:id',
    (
      req: Request<APIGatewayContext, UserQuery, UserParams, Partial<UserBody>>,
      res: Response<UserResponse>
    ) => {
      expectType<Partial<UserBody>>(req.body);
      res.json({ id: '1', name: 'John', email: 'test@example.com' });
    }
  );

  api.delete<void, APIGatewayContext>(
    '/users/:id',
    (req: Request<APIGatewayContext>, res: Response<void>) => {
      res.status(204).send();
    }
  );

  api.head<void, APIGatewayContext>(
    '/users',
    (req: Request<APIGatewayContext>, res: Response<void>) => {
      res.status(200).send();
    }
  );

  api.options<void, APIGatewayContext>(
    '/users',
    (req: Request<APIGatewayContext>, res: Response<void>) => {
      res.header('Allow', 'GET, POST, PUT, DELETE').status(204).send();
    }
  );

  api.any<{ method: string }, APIGatewayContext>(
    '/wildcard',
    (req: Request<APIGatewayContext>, res: Response<{ method: string }>) => {
      expectType<string>(req.method);
      res.send({ method: req.method });
    }
  );
};

const pathSpecificMiddleware: Middleware<any, RequestContext> = (
  req,
  res,
  next
) => {
  req.log.info('Path-specific middleware');
  next();
};

api.use('/specific-path', pathSpecificMiddleware);
api.use(['/path1', '/path2'], pathSpecificMiddleware);

interface RequestWithCustom1 extends Request<RequestContext> {
  custom1: string;
}

interface RequestWithCustom2 extends Request<RequestContext> {
  custom2: string;
}

const middleware1: Middleware<any, RequestContext> = (req, res, next) => {
  (req as RequestWithCustom1).custom1 = 'value1';
  next();
};

const middleware2: Middleware<any, RequestContext> = (req, res, next) => {
  (req as RequestWithCustom2).custom2 = 'value2';
  next();
};

api.use(middleware1, middleware2);

const handlerWithCustomProps: HandlerFunction<any, RequestContext> = (
  req,
  res
) => {
  if ('custom1' in req) {
    expectType<string>((req as RequestWithCustom1).custom1);
  }
  if ('custom2' in req) {
    expectType<string>((req as RequestWithCustom2).custom2);
  }
  res.send({ status: 'ok' });
};

const testRequestProperties: HandlerFunction<any, RequestContext> = (
  req,
  res
) => {
  expectType<string>(req.id);
  expectType<string>(req.method);
  expectType<string>(req.path);
  expectType<Record<string, string | undefined>>(req.query);
  expectType<Record<string, string | undefined>>(req.headers);
  expectType<string>(req.ip);
  expectType<string>(req.userAgent);
  expectType<'desktop' | 'mobile' | 'tv' | 'tablet' | 'unknown'>(
    req.clientType
  );
  expectType<string>(req.clientCountry);
  expectType<boolean>(req.coldStart);
  expectType<number>(req.requestCount);
  expectType<'apigateway' | 'alb'>(req.interface);
  expectType<string | undefined>(req.payloadVersion);
  expectType<App>(req.ns);
  req.log.trace('trace message');
  req.log.debug('debug message');
  req.log.info('info message');
  req.log.warn('warn message');
  req.log.error('error message');
  req.log.fatal('fatal message');
};

const testResponseMethods: HandlerFunction<any, RequestContext> = (
  req,
  res
) => {
  res
    .status(201)
    .header('X-Custom', 'value')
    .type('json')
    .cors({
      origin: '*',
      methods: 'GET, POST',
      headers: 'Content-Type',
    })
    .cookie('session', 'value', { httpOnly: true })
    .cache(3600)
    .etag(true)
    .modified(new Date());

  expectType<string>(res.getHeader('X-Custom'));
  expectType<{ [key: string]: string }>(res.getHeaders());
  expectType<boolean>(res.hasHeader('X-Custom'));
  res.removeHeader('X-Custom');

  res.send({ data: 'raw' });
  res.json({ data: 'json' });
  res.jsonp({ data: 'jsonp' });
  res.html('<div>html</div>');
  res.sendStatus(204);

  res.redirect('/new-location');
  res.redirect(301, '/permanent-location');

  res.clearCookie('session');

  res.error(400, 'Bad Request');
  res.error('Error message');
};

const testErrorHandlingMiddleware: ErrorHandlingMiddleware = async (
  error,
  req,
  res,
  next
) => {
  if (error.message === 'sync') {
    return { message: 'handled synchronously' };
  }

  if (error.message === 'async') {
    return Promise.resolve({ message: 'handled asynchronously' });
  }

  if (error.message === 'void') {
    res.json({ message: 'handled with void' });
    return;
  }

  if (error.message === 'promise-void') {
    await Promise.resolve();
    res.json({ message: 'handled with promise void' });
    return;
  }

  next();
};

const testDefaultTypes = () => {
  api.get('/simple', (req: Request<APIGatewayContext>, res: Response) => {
    expectType<Request<APIGatewayContext>>(req);
    expectType<Response>(res);
    expectType<APIGatewayContext>(req.requestContext);
    expectType<Record<string, string | undefined>>(req.query);
    expectType<Record<string, string | undefined>>(req.params);
    expectType<any>(req.body);
    res.json({ message: 'ok' });
  });

  const simpleMiddleware: Middleware = (
    req: Request<APIGatewayContext>,
    res: Response,
    next: NextFunction
  ) => {
    expectType<Request<APIGatewayContext>>(req);
    expectType<Response>(res);
    expectType<APIGatewayContext>(req.requestContext);
    next();
  };

  const simpleErrorHandler: ErrorHandlingMiddleware = (
    error: Error,
    req: Request<APIGatewayContext>,
    res: Response,
    next: NextFunction
  ) => {
    expectType<Request<APIGatewayContext>>(req);
    expectType<Response>(res);
    expectType<APIGatewayContext>(req.requestContext);
    res.status(500).json({ error: error.message });
  };

  api.post(
    '/simple-chain',
    simpleMiddleware,
    (req: Request<APIGatewayContext>, res: Response) => {
      expectType<Request<APIGatewayContext>>(req);
      expectType<Response>(res);
      res.json({ status: 'ok' });
    }
  );

  api.use(
    (req: Request<APIGatewayContext>, res: Response, next: NextFunction) => {
      expectType<Request<APIGatewayContext>>(req);
      expectType<Response>(res);
      next();
    }
  );

  api.use(
    '/path',
    (req: Request<APIGatewayContext>, res: Response, next: NextFunction) => {
      expectType<Request<APIGatewayContext>>(req);
      expectType<Response>(res);
      next();
    }
  );

  api.finally((req: Request<APIGatewayContext>, res: Response) => {
    expectType<Request<APIGatewayContext>>(req);
    expectType<Response>(res);
  });

  const runResult = api.run({} as APIGatewayProxyEvent, {} as Context);
  expectType<Promise<any>>(runResult);

  api.run({} as APIGatewayProxyEvent, {} as Context, (err: Error, res: any) => {
    expectType<Error>(err);
    expectType<any>(res);
  });

  const albApi = new API();
  albApi.get('/alb-default', (req: Request<ALBContext>, res: Response) => {
    if (isAlbContext(req.requestContext)) {
      expectType<ALBContext>(req.requestContext);
      expectType<{ targetGroupArn: string }>(req.requestContext.elb);
      expectType<Record<string, string | undefined>>(req.query);
      expectType<Record<string, string | undefined>>(req.params);
      expectType<any>(req.body);
      res.json({ message: 'ALB response' });
    }
  });

  const albResult = albApi.run({} as ALBEvent, {} as Context);
  expectType<Promise<any>>(albResult);

  const apiGwV2Api = new API();
  apiGwV2Api.get(
    '/apigw-v2-default',
    (req: Request<APIGatewayV2Context>, res: Response) => {
      if (isApiGatewayV2Context(req.requestContext)) {
        expectType<APIGatewayV2Context>(req.requestContext);
        expectType<string>(req.requestContext.accountId);
        expectType<Record<string, string | undefined>>(req.query);
        expectType<Record<string, string | undefined>>(req.params);
        expectType<any>(req.body);
        res.json({ message: 'API Gateway V2 response' });
      }
    }
  );

  const apiGwV2Result = apiGwV2Api.run(
    {} as APIGatewayProxyEventV2,
    {} as Context
  );
  expectType<Promise<any>>(apiGwV2Result);
};
