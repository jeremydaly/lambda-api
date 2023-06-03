import createLambdaApi, {
  HandlerFunction,
  Middleware,
  MiddlewaresAndHandler,
  type Request,
  type Response,
} from '../index';

const api = createLambdaApi();

const handler:HandlerFunction = (req: Request, res: Response) => {
  res.send('Hello world!');
}
const middleware: Middleware = (req, res, next: () => void) => {
  next()
}

const m: MiddlewaresAndHandler<[Middleware]> = [middleware];
const a: MiddlewaresAndHandler<[Middleware, HandlerFunction]> = [middleware, handler];
const b: MiddlewaresAndHandler<[Middleware, Middleware, HandlerFunction]> = [middleware, middleware, handler];
const z: MiddlewaresAndHandler<[HandlerFunction]> = [handler];


api.get(middleware, middleware, middleware, handler);
