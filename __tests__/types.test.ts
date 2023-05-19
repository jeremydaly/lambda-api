import createLambdaApi, {
  HandlerFunction,
  Middleware,
  MiddlewaresAndHandler,
  type Request,
  type Response,
} from '../index';

const api = createLambdaApi();

api.get((req: Request, res: Response, next: () => void): void => {
  next();
}, (req: Request, res: Response): void => {
  res.send('Hello world!');
});
