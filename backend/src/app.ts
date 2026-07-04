import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import authRouter from './modules/auth/auth.router';
import projectsRouter from './modules/projects/projects.router';
import statusRouter from './modules/status/status.router';
import githubRouter from './modules/github/github.router';
import contentRouter from './modules/content/content.router';
import usersRouter from './modules/users/users.router';
import messagesRouter from './modules/messages/messages.router';
import { errorHandler } from './middleware/errorHandler';
import { HttpError } from './utils/httpError';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/status', statusRouter);
app.use('/api/github', githubRouter);
app.use('/api/content', contentRouter);
app.use('/api/users', usersRouter);
app.use('/api/messages', messagesRouter);

app.use((_req, _res, next) => {
  next(new HttpError(404, 'Route not found'));
});

app.use(errorHandler);

export default app;
