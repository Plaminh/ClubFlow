import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.disable('x-powered-by');
app.use(
  cors({
    origin: env.frontendOrigin,
  }),
);
app.use(express.json());

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
