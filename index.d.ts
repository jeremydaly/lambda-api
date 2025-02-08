import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  ALBEvent,
  Context,
} from 'aws-lambda';
import { S3ClientConfig } from '@aws-sdk/client-s3';

export declare interface CookieOptions {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  secure?: boolean;
  sameSite?: boolean | 'Strict' | 'Lax' | 'None';
}

export declare interface CorsOptions {
  credentials?: boolean;
  exposeHeaders?: string;
  headers?: string;
  maxAge?: number;
  methods?: string;
  origin?: string;
}

export declare interface FileOptions {
  maxAge?: number;
  root?: string;
  lastModified?: boolean | string;
  headers?: { [key: string]: string };
  cacheControl?: boolean | string;
  private?: boolean;
}

export declare interface RegisterOptions {
  prefix?: string;
}

export type Package = any;

export declare interface App {
  [namespace: string]: Package;
}

export type ALBContext = ALBEvent['requestContext'];
export type APIGatewayV2Context = APIGatewayProxyEventV2['requestContext'];
export type APIGatewayContext = APIGatewayEventRequestContext;

export type RequestContext =
  | APIGatewayContext
  | APIGatewayV2Context
  | ALBContext;

export declare type Event =
  | APIGatewayProxyEvent
  | APIGatewayProxyEventV2
  | ALBEvent;

export declare type Middleware<
  TResponse = any,
  TContext extends RequestContext = APIGatewayContext,
  TQuery extends Record<string, string | undefined> = Record<
    string,
    string | undefined
  >,
  TParams extends Record<string, string | undefined> = Record<
    string,
    string | undefined
  >,
  TBody = any
> = (
  req: Request<TContext, TQuery, TParams, TBody>,
  res: Response<TResponse>,
  next: NextFunction
) => void;

export declare type NextFunction = (error?: Error) => void;

export declare type ErrorHandlingMiddleware<
  TResponse = any,
  TContext extends RequestContext = APIGatewayContext,
  TQuery extends Record<string, string | undefined> = Record<
    string,
    string | undefined
  >,
  TParams extends Record<string, string | undefined> = Record<
    string,
    string | undefined
  >,
  TBody = any
> = (
  error: Error,
  req: Request<TContext, TQuery, TParams, TBody>,
  res: Response<TResponse>,
  next: NextFunction
) => void;

export type METHODS =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export type LoggerFunction = (message: string, ...args: any[]) => void;

export type HandlerFunction<
  TResponse = any,
  TContext extends RequestContext = APIGatewayContext,
  TQuery extends Record<string, string | undefined> = Record<
    string,
    string | undefined
  >,
  TParams extends Record<string, string | undefined> = Record<
    string,
    string | undefined
  >,
  TBody = any
> = (
  req: Request<TContext, TQuery, TParams, TBody>,
  res: Response<TResponse>
) => void;

export interface Options {
  logger?: {
    level?: string;
    format?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export declare class Request<
  TContext extends RequestContext = APIGatewayContext,
  TQuery extends Record<string, string | undefined> = Record<
    string,
    string | undefined
  >,
  TParams extends Record<string, string | undefined> = Record<
    string,
    string | undefined
  >,
  TBody = any
> {
  app: API;
  version: string;
  id: string;
  params: TParams;
  method: string;
  path: string;
  query: TQuery;
  multiValueQuery: {
    [K in keyof TQuery]: string[] | undefined;
  };
  headers: {
    [key: string]: string | undefined;
  };
  multiValueHeaders: {
    [key: string]: string[] | undefined;
  };
  rawHeaders?: {
    [key: string]: string | undefined;
  };
  body: TBody;
  rawBody: string;
  route: '';
  requestContext: TContext;
  isBase64Encoded: boolean;
  pathParameters: { [name: string]: string } | null;
  stageVariables: { [name: string]: string } | null;
  auth: {
    [key: string]: any;
    type: 'Bearer' | 'Basic' | 'OAuth' | 'Digest' | 'none';
    value: string | null;
  };
  cookies: {
    [key: string]: string;
  };
  context: Context;
  coldStart: boolean;
  requestCount: number;
  ip: string;
  userAgent: string;
  clientType: 'desktop' | 'mobile' | 'tv' | 'tablet' | 'unknown';
  clientCountry: string;
  namespace: App;

  log: {
    trace: LoggerFunction;
    debug: LoggerFunction;
    info: LoggerFunction;
    warn: LoggerFunction;
    error: LoggerFunction;
    fatal: LoggerFunction;
  };

  [key: string]: any;
}

export declare class Response<TResponse = any> {
  status(code: number): this;
  sendStatus(code: number): void;
  header(key: string, value?: string | Array<string>, append?: boolean): this;
  getHeader(key: string): string;
  getHeaders(): { [key: string]: string };
  setHeader(...args: Parameters<typeof this.header>): this;
  hasHeader(key: string): boolean;
  removeHeader(key: string): this;
  getLink(
    s3Path: string,
    expires?: number,
    callback?: ErrorCallback
  ): Promise<string>;
  send(body: TResponse): void;
  json(body: TResponse): void;
  jsonp(body: TResponse): void;
  html(body: string): void;
  type(type: string): this;
  location(path: string): this;
  redirect(status: number, path: string): void;
  redirect(path: string): void;
  cors(options: CorsOptions): this;
  error(message: string, detail?: any): void;
  error(code: number, message: string, detail?: any): void;
  cookie(name: string, value: string, options?: CookieOptions): this;
  clearCookie(name: string, options?: CookieOptions): this;
  etag(enable?: boolean): this;
  cache(age?: boolean | number | string, private?: boolean): this;
  modified(date: boolean | string | Date): this;
  attachment(fileName?: string): this;
  download(
    file: string | Buffer,
    fileName?: string,
    options?: FileOptions,
    callback?: ErrorCallback
  ): void;
  sendFile(
    file: string | Buffer,
    options?: FileOptions,
    callback?: ErrorCallback
  ): Promise<void>;

  [key: string]: any;
}

export declare class API {
  app(namespace: string, package: Package): App;
  app(packages: App): App;

  get<
    TResponse = any,
    TContext extends RequestContext = APIGatewayContext,
    TQuery extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TParams extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TBody = any
  >(
    path: string,
    ...middlewaresAndHandler: (
      | Middleware<TResponse, TContext, TQuery, TParams, TBody>
      | HandlerFunction<TResponse, TContext, TQuery, TParams, TBody>
    )[]
  ): void;

  post<
    TResponse = any,
    TContext extends RequestContext = APIGatewayContext,
    TQuery extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TParams extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TBody = any
  >(
    path: string,
    ...middlewaresAndHandler: (
      | Middleware<TResponse, TContext, TQuery, TParams, TBody>
      | HandlerFunction<TResponse, TContext, TQuery, TParams, TBody>
    )[]
  ): void;

  put<
    TResponse = any,
    TContext extends RequestContext = APIGatewayContext,
    TQuery extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TParams extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TBody = any
  >(
    path: string,
    ...middlewaresAndHandler: (
      | Middleware<TResponse, TContext, TQuery, TParams, TBody>
      | HandlerFunction<TResponse, TContext, TQuery, TParams, TBody>
    )[]
  ): void;

  patch<
    TResponse = any,
    TContext extends RequestContext = APIGatewayContext,
    TQuery extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TParams extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TBody = any
  >(
    path: string,
    ...middlewaresAndHandler: (
      | Middleware<TResponse, TContext, TQuery, TParams, TBody>
      | HandlerFunction<TResponse, TContext, TQuery, TParams, TBody>
    )[]
  ): void;

  delete<
    TResponse = any,
    TContext extends RequestContext = APIGatewayContext,
    TQuery extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TParams extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TBody = any
  >(
    path: string,
    ...middlewaresAndHandler: (
      | Middleware<TResponse, TContext, TQuery, TParams, TBody>
      | HandlerFunction<TResponse, TContext, TQuery, TParams, TBody>
    )[]
  ): void;

  head<
    TResponse = any,
    TContext extends RequestContext = APIGatewayContext,
    TQuery extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TParams extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TBody = any
  >(
    path: string,
    ...middlewaresAndHandler: (
      | Middleware<TResponse, TContext, TQuery, TParams, TBody>
      | HandlerFunction<TResponse, TContext, TQuery, TParams, TBody>
    )[]
  ): void;

  options<
    TResponse = any,
    TContext extends RequestContext = APIGatewayContext,
    TQuery extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TParams extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TBody = any
  >(
    path: string,
    ...middlewaresAndHandler: (
      | Middleware<TResponse, TContext, TQuery, TParams, TBody>
      | HandlerFunction<TResponse, TContext, TQuery, TParams, TBody>
    )[]
  ): void;

  any<
    TResponse = any,
    TContext extends RequestContext = APIGatewayContext,
    TQuery extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TParams extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TBody = any
  >(
    path: string,
    ...middlewaresAndHandler: (
      | Middleware<TResponse, TContext, TQuery, TParams, TBody>
      | HandlerFunction<TResponse, TContext, TQuery, TParams, TBody>
    )[]
  ): void;

  METHOD<
    TResponse = any,
    TContext extends RequestContext = APIGatewayContext,
    TQuery extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TParams extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TBody = any
  >(
    method: METHODS | METHODS[],
    path: string,
    ...middlewaresAndHandler: (
      | Middleware<TResponse, TContext, TQuery, TParams, TBody>
      | HandlerFunction<TResponse, TContext, TQuery, TParams, TBody>
    )[]
  ): void;

  register(
    routes: (api: API, options?: RegisterOptions) => void,
    options?: RegisterOptions
  ): void;

  routes(format: true): void;
  routes(format: false): string[][];
  routes(): string[][];

  use<
    TResponse = any,
    TContext extends RequestContext = APIGatewayContext,
    TQuery extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TParams extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TBody = any
  >(
    path: string | string[],
    ...middleware: (
      | Middleware<TResponse, TContext, TQuery, TParams, TBody>
      | ErrorHandlingMiddleware<TResponse, TContext, TQuery, TParams, TBody>
    )[]
  ): void;

  use<
    TResponse = any,
    TContext extends RequestContext = APIGatewayContext,
    TQuery extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TParams extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
    TBody = any
  >(
    ...middleware: (
      | Middleware<TResponse, TContext, TQuery, TParams, TBody>
      | ErrorHandlingMiddleware<TResponse, TContext, TQuery, TParams, TBody>
    )[]
  ): void;

  finally<TResponse = any>(
    callback: (req: Request, res: Response<TResponse>) => void
  ): void;

  run<TResponse = any>(
    event: Event,
    context: Context,
    cb: (err: Error, result: TResponse) => void
  ): void;
  run<TResponse = any>(event: Event, context: Context): Promise<TResponse>;
}

export declare class RouteError extends Error {
  constructor(message: string, path: string);
}

export declare class MethodError extends Error {
  constructor(message: string, method: METHODS, path: string);
}

export declare class ConfigurationError extends Error {
  constructor(message: string);
}

export declare class ResponseError extends Error {
  constructor(message: string, code: number);
}

export declare class FileError extends Error {
  constructor(message: string, err: object);
}

declare function createAPI(options?: Options): API;

export default createAPI;

export declare function isApiGatewayContext(
  context: RequestContext
): context is APIGatewayContext;

export declare function isApiGatewayV2Context(
  context: RequestContext
): context is APIGatewayV2Context;

export declare function isAlbContext(
  context: RequestContext
): context is ALBContext;
