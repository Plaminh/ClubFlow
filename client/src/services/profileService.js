import { clone, getSessionAccountId, getState, mockRequest } from '../mocks/store.js';
import { isEmail } from '../utils/validation.js';
import { createUiError } from './uiError.js';

function requireProfile() {
  const profile = getState().profiles.find((item) => item.id === getSessionAccountId());
  if (!profile) {
    throw createUiError('forbidden', 'Bạn cần đăng nhập để xem hồ sơ cá nhân.');
  }
  return profile;
}

export async function getProfile() {
  await mockRequest();
  return clone(requireProfile());
}

/**
 * Simulated save of the two editable fields. The account is fixed when the
 * call starts: mockRequest() cancels the save if the account or scenario
 * changes while it is pending, and the write is refused unless the session
 * still belongs to that same account, so it can never land on another one.
 */
export async function updateProfile({ displayName = '', email = '' } = {}) {
  const accountId = requireProfile().id;
  await mockRequest();
  const normalized = { displayName: displayName.trim(), email: email.trim().toLowerCase() };
  const fieldErrors = {};
  if (!normalized.displayName) {
    fieldErrors.displayName = 'Họ và tên là bắt buộc.';
  }
  if (!normalized.email) {
    fieldErrors.email = 'Email là bắt buộc.';
  } else if (!isEmail(normalized.email)) {
    fieldErrors.email = 'Email chưa đúng định dạng.';
  }
  if (Object.keys(fieldErrors).length > 0) {
    throw createUiError('validation', 'Vui lòng kiểm tra thông tin hồ sơ.', { fieldErrors });
  }

  const profile = requireProfile();
  if (profile.id !== accountId) {
    throw createUiError('conflict', 'Thao tác đã bị hủy vì tài khoản demo đã thay đổi trong lúc xử lý.');
  }
  const taken = getState().profiles.some((item) => item.id !== profile.id && item.email.toLowerCase() === normalized.email);
  if (taken) {
    const message = 'Email này đang được một tài khoản demo khác sử dụng.';
    throw createUiError('validation', message, { fieldErrors: { email: message } });
  }
  Object.assign(profile, normalized);
  return clone(profile);
}
