/*
 * Campaign service (Executive). Demo implementation over the mock store.
 * Backend integration: replace each function body with apiClient calls that
 * return the same shapes (see docs/frontend/INTEGRATION.md).
 */
import { campaignPhase, departmentById, isScheduleConfirmed } from '../mocks/derive.js';
import { at } from '../mocks/fixtures.js';
import { assertNotLockedBySchedule, requireRole } from '../mocks/guards.js';
import { clone, getState, mockRequest } from '../mocks/store.js';
import { isPositiveInteger, validateCampaignForPublish } from '../utils/validation.js';
import { createUiError } from './uiError.js';

function campaignView(state) {
  const positions = state.positions.map((position) => ({
    ...position,
    departmentName: departmentById(state, position.departmentId)?.name ?? '',
    applicationCount: state.applications.filter((application) => application.positionId === position.id).length,
  }));
  return {
    campaign: state.campaign,
    phase: campaignPhase(state),
    positions,
    slots: state.slots,
    locked: isScheduleConfirmed(state),
    hasApplications: state.applications.length > 0,
  };
}

function nextId(prefix, items) {
  let n = items.length + 1;
  while (items.some((item) => item.id === `${prefix}-${n}`)) {
    n += 1;
  }
  return `${prefix}-${n}`;
}

// Applicant availability slots: one per hour of the interview window.
function hourlySlots(campaign) {
  const slots = [];
  const startHour = Number(campaign.interviewWindow.start.slice(0, 2));
  const endHour = Number(campaign.interviewWindow.end.slice(0, 2));
  for (let hour = startHour; hour < endHour; hour += 1) {
    const from = String(hour).padStart(2, '0');
    const to = String(hour + 1).padStart(2, '0');
    slots.push({
      id: `slot-${from}00`,
      start: at(campaign.interviewDate, `${from}:00`),
      end: at(campaign.interviewDate, `${to}:00`),
    });
  }
  return slots;
}

function departmentIdFor(state, name) {
  const trimmed = name.trim();
  const existing = state.departments.find((department) => department.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) {
    return existing.id;
  }
  const department = { id: nextId('dep', state.departments), name: trimmed };
  state.departments.push(department);
  return department.id;
}

function applyDraft(state, draft) {
  const { campaign } = state;
  for (const field of ['name', 'hostClub', 'description', 'instructions', 'opensOn', 'closesOn']) {
    if (field in draft) {
      campaign[field] = draft[field];
    }
  }
  // Interview configuration cannot change once applicants have chosen slots
  // (UI assumption pending Q-03; see specs/001-frontend-ui/research.md).
  if (state.applications.length === 0) {
    if (draft.interviewDate) {
      campaign.interviewDate = draft.interviewDate;
    }
    if (draft.interviewWindow) {
      campaign.interviewWindow = draft.interviewWindow;
    }
    if (draft.slotMinutes) {
      campaign.slotMinutes = Number(draft.slotMinutes);
    }
    state.slots = hourlySlots(campaign);
  }

  for (const input of draft.positions ?? []) {
    const values = {
      departmentId: departmentIdFor(state, input.departmentName || 'Ban mới'),
      name: input.name,
      quota: isPositiveInteger(input.quota) ? Number(input.quota) : input.quota,
      description: input.description,
      requirements: input.requirements,
    };
    const existing = input.id ? state.positions.find((position) => position.id === input.id) : null;
    if (existing) {
      Object.assign(existing, values);
    } else {
      state.positions.push({ id: nextId('pos', state.positions), ...values });
    }
  }
}

export async function getCampaign() {
  await mockRequest();
  requireRole('executive');
  return clone(campaignView(getState()));
}

export async function saveDraft(draft) {
  await mockRequest();
  requireRole('executive');
  assertNotLockedBySchedule('cấu hình chiến dịch');
  const state = getState();
  applyDraft(state, draft);
  return clone(campaignView(state));
}

export async function publish(draft) {
  await mockRequest();
  requireRole('executive');
  assertNotLockedBySchedule('cấu hình chiến dịch');
  const fieldErrors = validateCampaignForPublish(draft);
  if (Object.keys(fieldErrors).length > 0) {
    throw createUiError('validation', 'Chưa thể công bố chiến dịch. Hãy sửa các trường được đánh dấu.', { fieldErrors });
  }
  const state = getState();
  applyDraft(state, draft);
  if (state.campaign.status !== 'published') {
    state.campaign.status = 'published';
    state.campaign.publishedAt = state.now;
  }
  return clone(campaignView(state));
}

export async function removePosition(positionId) {
  await mockRequest();
  requireRole('executive');
  assertNotLockedBySchedule('cấu hình chiến dịch');
  const state = getState();
  const linked = state.applications.filter((application) => application.positionId === positionId).length;
  if (linked > 0) {
    throw createUiError(
      'conflict',
      `Không thể xóa vị trí này vì đã có ${linked} hồ sơ ứng tuyển. Xóa vị trí sẽ làm mất liên kết của các hồ sơ đó (BR-04).`,
    );
  }
  state.positions = state.positions.filter((position) => position.id !== positionId);
  return clone(campaignView(state));
}
