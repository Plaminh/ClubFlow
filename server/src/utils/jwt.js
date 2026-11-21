import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// HS256 only: verify() refuses `alg: none` and any other algorithm.
const ALGORITHM = 'HS256';

export const generateToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { algorithm: ALGORITHM, expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret, { algorithms: [ALGORITHM] });
