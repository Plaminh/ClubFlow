import express from 'express';
import apiRouter from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.disable('x-powered-by');
// No CORS middleware (S3): the front end calls relative /api paths through the Vite proxy,
// so every request is same-origin and no Access-Control-Allow-Origin header is ever sent.
app.use(express.json());

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
