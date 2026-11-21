import { describe, it, expect, vi } from 'vitest';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import * as jwtUtils from '../../../src/utils/jwt.js';

vi.mock('../../../src/utils/jwt.js');

describe('Auth Middleware', () => {
  const mockResponse = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should return 401 if no authorization header is present', () => {
    const req = { headers: {} };
    const res = mockResponse();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header does not start with Bearer', () => {
    const req = { headers: { authorization: 'Basic asdf' } };
    const res = mockResponse();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } };
    const res = mockResponse();
    const next = vi.fn();

    vi.mocked(jwtUtils.verifyToken).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is empty', () => {
    const req = { headers: { authorization: 'Bearer ' } };
    const res = mockResponse();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next and set req.user if token is valid', () => {
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = mockResponse();
    const next = vi.fn();
    const decodedPayload = { userId: 1 };

    vi.mocked(jwtUtils.verifyToken).mockReturnValue(decodedPayload);

    authenticate(req, res, next);

    expect(jwtUtils.verifyToken).toHaveBeenCalledWith('valid-token');
    expect(req.user).toEqual(decodedPayload);
    expect(next).toHaveBeenCalled();
  });
});
