import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import authRouter from './modules/auth/auth.router';
import projectsRouter from './modules/projects/projects.router';
import { errorHandler } from './middleware/errorHandler';
import { HttpError } from './utils/httpError';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);

app.use((_req, _res, next) => {
  next(new HttpError(404, 'Route not found'));
});

app.use(errorHandler);

export default app;
