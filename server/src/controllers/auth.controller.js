import { HTTP_STATUS } from '../constants/httpStatus.js';
import { getCurrentUser as getCurrentUserProfile, signIn } from '../services/auth.service.js';

export async function login(req, res) {
  const result = await signIn(req.validated.body);
  res.status(HTTP_STATUS.OK).json(result);
}

export async function getCurrentUser(req, res) {
  const user = await getCurrentUserProfile(req.user);
  res.status(HTTP_STATUS.OK).json(user);
}

export async function logout(req, res) {
  // JWTs are stateless; the client ends its session by discarding its token.
  res.status(HTTP_STATUS.NO_CONTENT).end();
}
