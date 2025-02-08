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
  RequestExtensions,
  NextFunction,
  RequestContext,
  isApiGatewayRequest,
  isApiGatewayV2Request,
  isAlbRequest,
} from './index';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

// Response type for user endpoints
interface UserResponse {
  id: string;
  name: string;
  email: string;
}

// Query parameters for user endpoints
interface UserQuery extends Record<string, string | undefined> {
  fields?: string;
}

// URL parameters for user endpoints
interface UserParams extends Record<string, string | undefined> {
  id?: string;
}

// Request body for user endpoints
interface UserBody {
  name: string;
  email: string;
}

// Auth info type for request extensions
interface AuthInfo {
  userId: string;
  roles: string[];
  type: 'Bearer' | 'Basic' | 'OAuth' | 'Digest' | 'none';
  value: string | null;
}

// Type guard for auth info
function hasAuth(req: Request): req is Request & { auth: AuthInfo } {
  return 'auth' in req && req.auth?.type !== undefined;
}

const api = new API();

// Test source-agnostic middleware
const sourceAgnosticMiddleware: Middleware = (req, res, next) => {
  // Common properties available across all sources
  expectType<string | undefined>(req.requestContext.requestId);
  if (isApiGatewayRequest(req.requestContext)) {
    const sourceIp = req.requestContext.identity.sourceIp;
    if (sourceIp) {
      expectType<string>(sourceIp);
    }
  } else if (isApiGatewayV2Request(req.requestContext)) {
    const sourceIp = req.requestContext.http.sourceIp;
    if (sourceIp) {
      expectType<string>(sourceIp);
    }
  } else if (isAlbRequest(req.requestContext)) {
    const sourceIp = req.requestContext.sourceIp;
    if (sourceIp) {
      expectType<string>(sourceIp);
    }
  }
  next();
};

// Test source-specific middleware for ALB
const albMiddleware: Middleware<
  UserResponse,
  ALBContext & { sourceType: 'alb' },
  UserQuery,
  UserParams,
  UserBody
> = (req, res, next) => {
  expectType<{ targetGroupArn: string }>(req.requestContext.elb);
  next();
};

// Test source-specific middleware for API Gateway v2
const apiGwV2Middleware: Middleware<
  UserResponse,
  APIGatewayV2Context & { sourceType: 'apigatewayv2' },
  UserQuery,
  UserParams,
  UserBody
> = (req, res, next) => {
  expectType<string>(req.requestContext.accountId);
  next();
};

// Test ALB-specific handler
const albHandler: HandlerFunction<
  UserResponse,
  ALBContext & { sourceType: 'alb' },
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

// Test API Gateway v2 handler
const apiGwV2Handler: HandlerFunction<
  UserResponse,
  APIGatewayV2Context & { sourceType: 'apigatewayv2' },
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

// Test routes with multiple source support
api.post('/users', sourceAgnosticMiddleware, (req, res) => {
  res.json({
    id: '1',
    name: 'John',
    email: 'john@example.com',
  });
});

// Test ALB-specific route
api.post<
  UserResponse,
  ALBContext & { sourceType: 'alb' },
  UserQuery,
  UserParams,
  UserBody
>('/alb-users', albMiddleware, albHandler);

// Test API Gateway v2 specific route
api.post<
  UserResponse,
  APIGatewayV2Context & { sourceType: 'apigatewayv2' },
  UserQuery,
  UserParams,
  UserBody
>('/v2-users', apiGwV2Middleware, apiGwV2Handler);

// Test error handling for multiple sources
const errorHandler: ErrorHandlingMiddleware = (error, req, res, next) => {
  if (isAlbRequest(req.requestContext)) {
    // ALB-specific error handling
    res.status(500).json({
      id: 'alb-error',
      name: error.name,
      email: error.message,
    });
  } else {
    // Default error handling
    res.status(500).json({
      id: 'error',
      name: error.name,
      email: error.message,
    });
  }
};

// Register error handler
api.use(errorHandler);

// Test finally handler with multiple sources
api.finally((req, res) => {
  if (isApiGatewayRequest(req.requestContext)) {
    console.log('API Gateway request completed');
  } else if (isApiGatewayV2Request(req.requestContext)) {
    console.log('API Gateway v2 request completed');
  } else if (isAlbRequest(req.requestContext)) {
    console.log('ALB request completed');
  }
});

// Test run method
const result = api.run<UserResponse>({} as APIGatewayProxyEvent, {} as Context);
expectType<Promise<UserResponse>>(result);

api.run<UserResponse>({} as APIGatewayProxyEvent, {} as Context, (err, res) => {
  expectType<Error>(err);
  expectType<UserResponse>(res);
});
