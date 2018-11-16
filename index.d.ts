import {
  APIGatewayEvent,
  APIGatewayEventRequestContext,
  Context,
} from 'aws-lambda';

declare interface CookieOptions {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  secure?: boolean;
  sameSite?: boolean | 'Strict' | 'Lax';
}

declare interface CorsOptions {
  credentials?: boolean;
  exposeHeaders?: string;
  headers?: string;
  maxAge?: number;
  methods?: string;
  origin?: string;
}

declare interface FileOptions {
  maxAge?: number;
  root?: string;
  lastModified?: boolean | string;
  headers?: {};
  cacheControl?: boolean | string;
  private?: boolean;
}

declare interface App {
  [namespace: string]: HandlerFunction;
}
declare type ErrorCallback = (error?: Error) => void;
declare type HandlerFunction = (req: Request, res: Response) => void | {} | Promise<{}>;
declare type LoggerFunction = (message: string) => void;
declare type NextFunction = () => void;
declare type TimestampFunction = () => string;
declare type SerializerFunction = (body: object) => string;
declare type FinallyFunction = (req: Request, res: Response) => void;

declare type METHODS = 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD'
  | 'ANY';

declare interface SamplingOptions {
  route?: string;
  target?: number;
  rate?: number
  period?: number;
  method?: string | string[];
}

declare interface LoggerOptions {
  access?: boolean | string;
  customKey?: string;
  detail?: boolean;
  level?: string;
  levels?: {
    [key: string]: string;
  };
  messageKey?: string;
  nested?: boolean;
  timestamp?: boolean | TimestampFunction;
  sampling?: {
    target?: number;
    rate?: number;
    period?: number;
    rules?: SamplingOptions[];
  };
  serializers?: {
    [name: string]: (req: Request) => {};
  };
  stack?: boolean;
}

declare interface Options {
  base?: string;
  callbackName?: string;
  logger?: boolean | LoggerOptions;
  mimeTypes?: {
    [key: string]: string;
  };
  serializer?: SerializerFunction;
  version?: string;
}

declare class Request {
  app: API;
  version: string;
  id: string;
  params: {};
  method: string;
  path: string;
  query: {
    [key: string]: string;
  };
  headers: {
    [key: string]: string;
  };
  rawHeaders?: {};
  body: {} | string;
  rawBody: string;
  route: '';
  requestContext: APIGatewayEventRequestContext;
  isBase64Encoded: boolean;
  pathParameters: { [name: string]: string } | null;
  stageVariables: { [name: string]: string } | null;
  auth: {
    [key: string]: any;
    type: 'Bearer' | 'Basic' | 'OAuth' | 'Digest';
    value: string;
  };
  cookies: {
    [key: string]: CookieOptions;
  };
  context: Context;
  coldStart: boolean;
  requestCount: number;
  ip: string;
  userAgent: string;
  clientType: 'desktop' | 'mobile' | 'tv' | 'tablet' | 'unknown';
  clientCountry: string;

  log: {
    trace: LoggerFunction;
    debug: LoggerFunction;
    info: LoggerFunction;
    warn: LoggerFunction;
    error: LoggerFunction;
    fatal: LoggerFunction;
  };
}

declare class Response {
  status(code: number): this;
  header(key: string, value: string): this;
  getHeader(key: string): string;
  hasHeader(key: string): boolean;
  removeHeader(key: string): this;
  getLink(s3Path: string, expires?: number, callback?: (err, data) => void);
  send(body: any): void;
  json(body: any): void;
  jsonp(body: any): void;
  html(body: any): void;
  type(type: string): void;
  location(path: string): this;
  redirect(status: number, path: string): void;
  redirect(path: string): void;
  cors(options: CorsOptions): this;
  error(message: string, detail?: any);
  error(code: number, message: string, detail?: any);
  cookie(name: string, value: string, options?: CookieOptions): this;
  clearCookie(name: string, options?: CookieOptions): this;
  etag(enable?: boolean): this;
  cache(age?: boolean | number | string, private?: boolean): this;
  modified(date: boolean | string | Date): this;
  attachment(fileName?: string): this;
  download(file: string | Buffer, fileName?: string, options?: FileOptions, callback?: ErrorCallback);
  sendFile(file: string | Buffer, options?: FileOptions, callback?: ErrorCallback);
}

declare class API {
  app(namespace: string, handler: HandlerFunction): App;
  app(options: App): App;

  get(path: string, handler: HandlerFunction): void;
  post(path: string, handler: HandlerFunction): void;
  put(path: string, handler: HandlerFunction): void;
  patch(path: string, handler: HandlerFunction): void;
  delete(path: string, handler: HandlerFunction): void;
  options(path: string, handler: HandlerFunction): void;
  head(path: string, handler: HandlerFunction): void;
  any(path: string, handler: HandlerFunction): void;
  METHOD(method: METHODS, path: string, handler: HandlerFunction): void;

  use(req: Request, res: Response, next: NextFunction): void;
  finally(callback: FinallyFunction): void;

  run(event: APIGatewayEvent, context: APIGatewayEventRequestContext): {};
}

declare function createAPI(options?: Options): API;

export default createAPI;
