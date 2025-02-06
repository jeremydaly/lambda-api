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

const getHandler: HandlerFunction<UserResponse> = (req, res) => {
  res.json({ id: '1', name: 'John', email: 'test@test.com' });
};
api.METHOD<UserResponse>('GET', '/users', getHandler);

const multiHandler: HandlerFunction<UserResponse> = (req, res) => {
  res.json({ id: '1', name: 'John', email: 'test@test.com' });
};
api.METHOD<UserResponse>(['GET', 'POST'], '/users', multiHandler);

const getUserHandler: HandlerFunction<UserResponse> = (req, res) => {
  expectType<Request<APIGatewayContext>>(req);
  expectType<APIGatewayContext>(req.requestContext);
  res.json({ id: '1', name: 'John', email: 'test@test.com' });
};
api.get<UserResponse>('/users', getUserHandler);

const postUserHandler: HandlerFunction<
  UserResponse,
  ALBContext,
  UserQuery,
  UserParams,
  UserBody
> = (req, res) => {
  expectType<ALBContext>(req.requestContext);
  expectType<UserQuery>(req.query);
  expectType<UserParams>(req.params);
  expectType<UserBody>(req.body);
  res.json({ id: '1', name: req.body.name, email: req.body.email });
};
api.post<UserResponse, ALBContext, UserQuery, UserParams, UserBody>(
  '/users',
  postUserHandler
);

const userMiddleware: Middleware<UserResponse> = (req, res, next) => {
  expectType<Response<UserResponse>>(res);
  next();
};
api.use<UserResponse>(userMiddleware);

const albMiddleware: Middleware<UserResponse, ALBContext> = (
  req,
  res,
  next
) => {
  expectType<ALBContext>(req.requestContext);
  expectType<Response<UserResponse>>(res);
  next();
};
api.use<UserResponse, ALBContext>('/users', albMiddleware);

const finallyHandler: HandlerFunction = (req, res) => {
  expectType<Request>(req);
  expectType<Response>(res);
};
api.finally(finallyHandler);

const result = api.run<UserResponse>({} as APIGatewayProxyEvent, {} as Context);
expectType<Promise<UserResponse>>(result);

api.run<UserResponse>({} as APIGatewayProxyEvent, {} as Context, (err, res) => {
  expectType<Error>(err);
  expectType<UserResponse>(res);
});
