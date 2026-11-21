import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken } from '../../../src/utils/jwt.js';
import { env } from '../../../src/config/env.js';
import jwt from 'jsonwebtoken';

// The secret comes from config/env.js, the only module that reads the environment (S2).
// A missing JWT_SECRET now stops the whole server; that is tested in test/security/S2-secrets.test.js.

describe('JWT Utility', () => {
  it('should generate a valid token', () => {
    const payload = { userId: 1 };
    const token = generateToken(payload);
    expect(typeof token).toBe('string');
    const decoded = jwt.verify(token, env.jwtSecret);
    expect(decoded.userId).toBe(1);
  });

  it('should verify a valid token', () => {
    const payload = { userId: 2 };
    const token = jwt.sign(payload, env.jwtSecret);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(2);
  });

  it('should throw an error for an invalid token', () => {
    expect(() => verifyToken('invalid-token')).toThrow();
  });

  it('should throw an error for an expired token', () => {
    const payload = { userId: 3 };
    const expiredToken = jwt.sign(payload, env.jwtSecret, { expiresIn: '-1s' });
    expect(() => verifyToken(expiredToken)).toThrow('jwt expired');
  });

  it('should refuse a token whose header says alg: none', () => {
    const unsigned = jwt.sign({ userId: 4 }, null, { algorithm: 'none' });
    expect(() => verifyToken(unsigned)).toThrow();
  });
});
