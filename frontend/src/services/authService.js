/* Mock authentication boundary for UI-8 (simulated; no token, no real security). */
import { DEMO_CREDENTIAL_ACCOUNT_IDS, DEMO_PASSWORD } from '../mocks/auth.js';
import { clone, getSessionAccountId, getState, mockRequest, setSessionAccountId } from '../mocks/store.js';
import { createUiError } from './uiError.js';

function currentProfile() {
  return getState().profiles.find((profile) => profile.id === getSessionAccountId()) ?? null;
}

/**
 * Simulated sign-in with { email, password }. The account is found by the
 * profile's CURRENT email, so a changed email signs into the same account.
 */
export async function signIn(credentials) {
  if (credentials === null || typeof credentials !== 'object') {
    // Guards callers still written for the old signIn(accountId) account picker.
    throw new Error('authService.signIn expects { email, password }; use demoSessionService.signIn(accountId) to switch demo accounts.');
  }
  const { email = '', password = '' } = credentials;
  await mockRequest();
  const normalizedEmail = String(email).trim().toLowerCase();
  const profile = getState().profiles.find((item) => item.email.toLowerCase() === normalizedEmail);
  if (!profile || password !== DEMO_PASSWORD) {
    throw createUiError('forbidden', 'Email hoặc mật khẩu demo không đúng.');
  }
  setSessionAccountId(profile.id);
  return clone(profile);
}

export async function signOut() {
  setSessionAccountId(null);
  return null;
}

export async function getCurrentUser() {
  await mockRequest();
  const profile = currentProfile();
  return profile ? clone(profile) : null;
}

/** Example logins shown on the Sign In page, using each account's current email. */
export async function listDemoCredentials() {
  return DEMO_CREDENTIAL_ACCOUNT_IDS.map((id) => getState().profiles.find((item) => item.id === id))
    .filter(Boolean)
    .map((profile) => ({
      role: profile.role,
      displayName: profile.displayName,
      email: profile.email,
      password: DEMO_PASSWORD,
    }));
}
