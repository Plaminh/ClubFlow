import { signUserToken } from '../../src/utils/jwt.js';

// A valid token for a user id and role, signed exactly as sign-in signs it (secret from env.js).
// Use it to call protected endpoints before, or without, POST /api/auth/login.
export function tokenFor(userId, role) {
  return signUserToken({ id: userId, role });
}

// Seed users (docs/api/README.md, Seed State).
export const SEED_USERS = Object.freeze({
  exec: { id: 'exec-recruitment', role: 'executive' },
  studentA: { id: 'ap-minhanh', role: 'applicant' },
  studentB: { id: 'ap-quocbao', role: 'applicant' },
  studentC: { id: 'ap-lanchi', role: 'applicant' },
  'int-content': { id: 'iv-giahuy', role: 'interviewer' },
  'int-comms': { id: 'iv-comms', role: 'interviewer' },
});

export function tokenForSeedUser(name) {
  const user = SEED_USERS[name];
  if (!user) throw new Error(`Unknown seed user ${name}`);
  return tokenFor(user.id, user.role);
}
