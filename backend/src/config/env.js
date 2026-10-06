import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const rootEnvPath = fileURLToPath(new URL('../../../.env', import.meta.url));

dotenv.config({
  path: rootEnvPath,
  quiet: true,
});

const requiredVariables = [
  'BACKEND_PORT',
  'FRONTEND_ORIGIN',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.BACKEND_PORT),
  frontendOrigin: process.env.FRONTEND_ORIGIN,
  db: Object.freeze({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  }),
});
