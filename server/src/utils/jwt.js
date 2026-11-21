import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// HS256 only: verify() refuses `alg: none` and any other algorithm.
const ALGORITHM = 'HS256';

export const generateToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { algorithm: ALGORITHM, expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret, { algorithms: [ALGORITHM] });

// The token sign-in issues: the user id as `sub` and the role. authenticate() reads exactly these.
export const signUserToken = (user) => generateToken({ sub: user.id, role: user.role });
