import { expectType } from 'tsd';
import {
  API,
  Request,
  Response,
  RouteError,
  MethodError,
  ALBContext,
  APIGatewayV2Context,
  APIGatewayContext,
  METHODS,
  ErrorHandlingMiddleware,
  HandlerFunction,
  Middleware,
} from './index';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

interface UserResponse {
  id: string;
  name: string;
  email: string;
}

interface UserQuery extends Record<string, string | undefined> {
  fields: string;
}

interface UserParams extends Record<string, string | undefined> {
  id: string;
}

interface UserBody {
  name: string;
  email: string;
}

const api = new API();

const defaultReq = {} as Request;
expectType<APIGatewayContext>(defaultReq.requestContext);
expectType<Record<string, string | undefined>>(defaultReq.query);
expectType<Record<string, string | undefined>>(defaultReq.params);
expectType<any>(defaultReq.body);

const albReq = {} as Request<ALBContext, UserQuery, UserParams, UserBody>;
expectType<ALBContext>(albReq.requestContext);
expectType<UserQuery>(albReq.query);
expectType<UserParams>(albReq.params);
expectType<UserBody>(albReq.body);

const apiGwV2Req = {} as Request<APIGatewayV2Context>;
expectType<APIGatewayV2Context>(apiGwV2Req.requestContext);

const stringResponse = {} as Response<string>;
expectType<void>(stringResponse.json('test'));
expectType<void>(stringResponse.send('test'));

const userResponse = {} as Response<UserResponse>;
expectType<void>(
  userResponse.json({
    id: '1',
    name: 'John',
    email: 'test@test.com',
  })
);

const errorHandler: ErrorHandlingMiddleware<UserResponse> = (
  error,
  req,
  res,
  next
) => {
  expectType<Error>(error);
  expectType<Request>(req);
  expectType<Response<UserResponse>>(res);
  next();
};

const routeError = new RouteError('Not found', '/users');
expectType<RouteError>(routeError);

const methodError = new MethodError('Method not allowed', 'POST', '/users');
expectType<MethodError>(methodError);

const authMiddleware: Middleware<UserResponse> = (req, res, next) => {
  expectType<Response<UserResponse>>(res);
  next();
};

const validationMiddleware: Middleware<UserResponse> = (req, res, next) => {
  expectType<Response<UserResponse>>(res);
  next();
};

const albAuthMiddleware: Middleware<
  UserResponse,
  ALBContext,
  UserQuery,
  UserParams,
  UserBody
> = (req, res, next) => {
  expectType<ALBContext>(req.requestContext);
  expectType<Response<UserResponse>>(res);
  next();
};

const handler: HandlerFunction<UserResponse> = (req, res) => {
  res.json({ id: '1', name: 'John', email: 'test@test.com' });
};

api.get<UserResponse>(
  '/users',
  authMiddleware,
  validationMiddleware,
  (req, res) => {
    expectType<Request<APIGatewayContext>>(req);
    res.json({ id: '1', name: 'John', email: 'test@test.com' });
  }
);

api.post<UserResponse>(
  '/users',
  authMiddleware,
  validationMiddleware,
  (req, res) => {
    expectType<Request<APIGatewayContext>>(req);
    res.json({ id: '1', name: 'John', email: 'test@test.com' });
  }
);

api.put<UserResponse>(
  '/users/:id',
  authMiddleware,
  validationMiddleware,
  (req, res) => {
    expectType<Request<APIGatewayContext>>(req);
    res.json({ id: '1', name: 'John', email: 'test@test.com' });
  }
);

api.patch<UserResponse>(
  '/users/:id',
  authMiddleware,
  validationMiddleware,
  (req, res) => {
    expectType<Request<APIGatewayContext>>(req);
    res.json({ id: '1', name: 'John', email: 'test@test.com' });
  }
);

api.delete<UserResponse>(
  '/users/:id',
  authMiddleware,
  validationMiddleware,
  (req, res) => {
    expectType<Request<APIGatewayContext>>(req);
    res.json({ id: '1', name: 'John', email: 'test@test.com' });
  }
);

api.options<UserResponse>(
  '/users',
  authMiddleware,
  validationMiddleware,
  (req, res) => {
    expectType<Request<APIGatewayContext>>(req);
    res.json({ id: '1', name: 'John', email: 'test@test.com' });
  }
);

api.head<UserResponse>(
  '/users',
  authMiddleware,
  validationMiddleware,
  (req, res) => {
    expectType<Request<APIGatewayContext>>(req);
    res.json({ id: '1', name: 'John', email: 'test@test.com' });
  }
);

api.any<UserResponse>(
  '/users',
  authMiddleware,
  validationMiddleware,
  (req, res) => {
    expectType<Request<APIGatewayContext>>(req);
    res.json({ id: '1', name: 'John', email: 'test@test.com' });
  }
);

api.post<UserResponse, ALBContext, UserQuery, UserParams, UserBody>(
  '/users',
  albAuthMiddleware,
  (req, res) => {
    expectType<ALBContext>(req.requestContext);
    expectType<UserQuery>(req.query);
    expectType<UserParams>(req.params);
    expectType<UserBody>(req.body);
    res.json({ id: '1', name: req.body.name, email: req.body.email });
  }
);

api.METHOD<UserResponse>(
  ['GET', 'POST'],
  '/users',
  authMiddleware,
  validationMiddleware,
  handler
);

// Test middleware without path
api.use<UserResponse>(authMiddleware);

// Test middleware with path and ALB context
const albRouteMiddleware: Middleware<UserResponse, ALBContext> = (
  req,
  res,
  next
) => {
  expectType<ALBContext>(req.requestContext);
  expectType<Response<UserResponse>>(res);
  next();
};
api.use<UserResponse, ALBContext>('/users', albRouteMiddleware);

api.finally((req, res) => {
  expectType<Request>(req);
  expectType<Response>(res);
});

const result = api.run<UserResponse>({} as APIGatewayProxyEvent, {} as Context);
expectType<Promise<UserResponse>>(result);

api.run<UserResponse>({} as APIGatewayProxyEvent, {} as Context, (err, res) => {
  expectType<Error>(err);
  expectType<UserResponse>(res);
});
