/*
 * Demo identity service. This is NOT authentication: it only selects which
 * fictional account the UI previews. Real sign-in, tokens, and authorization
 * belong to the backend (see docs/frontend/INTEGRATION.md).
 */
import { ACCOUNTS } from '../mocks/fixtures.js';
import { clone, getSessionAccountId, mockDelay, setSessionAccountId } from '../mocks/store.js';
import { createUiError } from './uiError.js';

export async function listAccounts() {
  await mockDelay(50);
  return clone(ACCOUNTS);
}

export async function signIn(accountId) {
  await mockDelay();
  const account = ACCOUNTS.find((item) => item.id === accountId);
  if (!account) {
    throw createUiError('notFound', 'Không tìm thấy tài khoản demo.');
  }

  setSessionAccountId(account.id);
  return clone(account);
}

export async function signOut() {
  await mockDelay(50);
  setSessionAccountId(null);
}

export function getCurrentAccountId() {
  return getSessionAccountId();
}
