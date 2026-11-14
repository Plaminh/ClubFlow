/*
 * Applicant Portal service (Visitor + Applicant). Demo implementation.
 * Applicants only ever receive their own records, confirmed interviews, and
 * PUBLISHED results (BR-08, ROLES_AND_PERMISSIONS §3).
 */
import {
  campaignPhase,
  departmentById,
  isScheduleConfirmed,
  positionById,
  roomName,
  slotText,
  submissionWindow,
} from '../mocks/derive.js';
import { requireRole } from '../mocks/guards.js';
import { clone, getState, mockRequest } from '../mocks/store.js';
import { validateApplicationInput } from '../utils/validation.js';
import { createUiError } from './uiError.js';

/** Public campaign view; drafts are never returned (BR-02). */
export async function getPublicCampaign() {
  await mockRequest();
  const state = getState();
  const phase = campaignPhase(state);
  if (phase === 'draft') {
    return { campaign: null, phase };
  }
  const { campaign } = state;
  return clone({
    phase,
    window: submissionWindow(campaign),
    now: state.now,
    campaign: {
      id: campaign.id,
      name: campaign.name,
      hostClub: campaign.hostClub,
      description: campaign.description,
      instructions: campaign.instructions,
      opensOn: campaign.opensOn,
      closesOn: campaign.closesOn,
      interviewDate: campaign.interviewDate,
      interviewWindow: campaign.interviewWindow,
      slotMinutes: campaign.slotMinutes,
    },
    positions: state.positions.map((position) => ({
      id: position.id,
      name: position.name,
      departmentName: departmentById(state, position.departmentId)?.name ?? '',
      quota: position.quota,
      description: position.description,
      requirements: position.requirements,
    })),
    slots: state.slots,
  });
}

function myApplicationView(state, application) {
  const confirmed = isScheduleConfirmed(state);
  const interview = confirmed ? state.interviews.find((item) => item.applicationId === application.id) : null;
  const result = state.results.find((item) => item.applicationId === application.id);
  return {
    id: application.id,
    positionId: application.positionId,
    positionName: positionById(state, application.positionId)?.name ?? '—',
    submittedAt: application.submittedAt,
    availabilityText: slotText(state, application.slotIds),
    screeningStatus: application.screeningStatus,
    interview:
      interview && application.screeningStatus === 'shortlisted'
        ? { start: interview.start, end: interview.end, roomName: roomName(state, interview.roomId) }
        : null,
    // Unpublished decisions are never sent to the applicant.
    result: result?.publishedAt ? { decision: result.decision, publishedAt: result.publishedAt } : null,
  };
}

export async function listMyApplications() {
  await mockRequest();
  const account = requireRole('applicant');
  const state = getState();
  return clone(
    state.applications
      .filter((application) => application.applicantId === account.id)
      .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
      .map((application) => myApplicationView(state, application)),
  );
}

function nextApplicationId(state) {
  const highest = state.applications.reduce((max, application) => {
    const number = Number(application.id.replace('CF-', ''));
    return Number.isFinite(number) ? Math.max(max, number) : max;
  }, 31);
  return `CF-${String(highest + 1).padStart(3, '0')}`;
}

/**
 * Submits one application from FormData: positionId, email, faculty, sop,
 * slotIds (repeated), cv (File). The demo keeps only the file name and size.
 */
export async function submitApplication(formData) {
  await mockRequest();
  const account = requireRole('applicant');
  const state = getState();
  const phase = campaignPhase(state);
  if (phase !== 'open') {
    throw createUiError('validation', 'Chiến dịch hiện không nhận hồ sơ (ngoài thời gian nộp đơn).');
  }

  const cvFile = formData.get('cv');
  const input = {
    positionId: formData.get('positionId') ?? '',
    email: formData.get('email') ?? '',
    sop: formData.get('sop') ?? '',
    slotIds: formData.getAll('slotIds'),
    cv: cvFile && typeof cvFile === 'object' && cvFile.name ? cvFile : null,
  };
  const fieldErrors = validateApplicationInput(input);
  if (input.positionId && !positionById(state, input.positionId)) {
    fieldErrors.positionId = 'Vị trí không tồn tại trong chiến dịch.';
  }
  if (input.slotIds.some((id) => !state.slots.some((slot) => slot.id === id))) {
    fieldErrors.slotIds = 'Chỉ chọn trong các khung giờ do câu lạc bộ cung cấp.';
  }
  if (Object.keys(fieldErrors).length > 0) {
    throw createUiError('validation', 'Chưa thể gửi hồ sơ. Hãy sửa các trường được đánh dấu.', { fieldErrors });
  }

  // BR-05: applicant + campaign + position is unique; return the existing record instead.
  const duplicate = state.applications.find(
    (application) => application.applicantId === account.id && application.positionId === input.positionId,
  );
  if (duplicate) {
    throw createUiError('conflict', `Bạn đã nộp hồ sơ ${duplicate.id} cho vị trí này.`, {
      fieldErrors: {
        positionId: `Bạn đã nộp hồ sơ ${duplicate.id} cho vị trí này. Mỗi vị trí chỉ có một hồ sơ trong chiến dịch; bạn vẫn có thể ứng tuyển vị trí khác.`,
      },
      details: { existingApplicationId: duplicate.id },
    });
  }

  const application = {
    id: nextApplicationId(state),
    applicantId: account.id,
    positionId: input.positionId,
    submittedAt: state.now,
    slotIds: input.slotIds,
    sop: input.sop.trim(),
    cv: { fileName: input.cv.name, sizeBytes: input.cv.size },
    screeningStatus: 'pendingReview',
    reviewedAt: null,
    privateNote: '',
    contactEmail: input.email.trim(),
  };
  state.applications.push(application);
  return clone(myApplicationView(state, application));
}

export async function listNotifications() {
  await mockRequest();
  const account = requireRole('applicant');
  return clone(
    getState()
      .notifications.filter((notification) => notification.accountId === account.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

export async function markNotificationsRead() {
  await mockRequest();
  const account = requireRole('applicant');
  const state = getState();
  for (const notification of state.notifications) {
    if (notification.accountId === account.id && !notification.readAt) {
      notification.readAt = state.now;
    }
  }
}
