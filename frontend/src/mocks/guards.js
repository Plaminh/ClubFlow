/*
 * Mock-backend guards. They make the demo respond the way a backend would
 * (role checks, BR-14 locks) so the UI's error handling can be exercised.
 * They are NOT security; the real backend must enforce these rules.
 */
import { createUiError } from '../services/uiError.js';
import { accountById, isScheduleConfirmed } from './derive.js';
import { getSessionAccountId, getState } from './store.js';

export function currentAccount() {
  return accountById(getSessionAccountId());
}

export function requireRole(role) {
  const account = currentAccount();
  if (!account || account.role !== role) {
    throw createUiError('forbidden', 'Tài khoản demo hiện tại không có quyền thực hiện thao tác này.');
  }
  return account;
}

/**
 * Campaign configuration is editable only while the campaign is a draft
 * (team-selected Q-03). After schedule confirmation the BR-14 lock applies too.
 */
export function assertCampaignConfigEditable() {
  assertNotLockedBySchedule('cấu hình chiến dịch');
  if (getState().campaign.status === 'published') {
    throw createUiError(
      'forbidden',
      'Chiến dịch đã được công bố nên cấu hình chiến dịch chỉ đọc. Chỉ bản nháp mới chỉnh sửa được.',
    );
  }
}

/** BR-14: after schedule confirmation these records are read-only. */
export function assertNotLockedBySchedule(what) {
  if (isScheduleConfirmed(getState())) {
    throw createUiError('forbidden', `Lịch phỏng vấn đã được xác nhận nên ${what} đã bị khóa (BR-14).`);
  }
}
