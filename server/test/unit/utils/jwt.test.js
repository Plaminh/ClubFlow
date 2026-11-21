import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateToken, verifyToken } from '../../../src/utils/jwt.js';
import jwt from 'jsonwebtoken';

describe('JWT Utility', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', 'test-secret');
    vi.stubEnv('JWT_EXPIRES_IN', '1h');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should generate a valid token', () => {
    const payload = { userId: 1 };
    const token = generateToken(payload);
    expect(typeof token).toBe('string');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe(1);
  });

  it('should verify a valid token', () => {
    const payload = { userId: 2 };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(2);
  });

  it('should throw an error for an invalid token', () => {
    expect(() => verifyToken('invalid-token')).toThrow();
  });

  it('should throw an error for an expired token', () => {
    const payload = { userId: 3 };
    const expiredToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '-1s' });
    expect(() => verifyToken(expiredToken)).toThrow('jwt expired');
  });

  it('should throw an error if JWT_SECRET is missing', () => {
    vi.stubEnv('JWT_SECRET', '');
    expect(() => generateToken({ userId: 1 })).toThrow(
      'JWT_SECRET environment variable is missing',
    );
    expect(() => verifyToken('token')).toThrow('JWT_SECRET environment variable is missing');
  });
});
