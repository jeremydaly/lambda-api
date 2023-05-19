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

api.get(middleware, handler);

