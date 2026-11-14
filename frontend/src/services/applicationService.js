/*
 * Application review service (Executive). Demo implementation over the mock
 * store; replace bodies with apiClient calls during backend integration.
 */
import { accountById, accountName, positionById, slotText } from '../mocks/derive.js';
import { SAMPLE_CV_URL } from '../mocks/fixtures.js';
import { assertNotLockedBySchedule, requireRole } from '../mocks/guards.js';
import { clone, getState, mockRequest } from '../mocks/store.js';
import { formatDateTime } from '../utils/format.js';
import { getLabel, SCREENING_STATUS_LABELS } from '../constants/labels.js';
import { toCsv } from '../utils/csv.js';
import { createUiError } from './uiError.js';

export const DEFAULT_PAGE_SIZE = 5;

const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

function summaryOf(state, application) {
  return {
    id: application.id,
    applicantId: application.applicantId,
    applicantName: accountName(application.applicantId),
    positionId: application.positionId,
    positionName: positionById(state, application.positionId)?.name ?? '—',
    submittedAt: application.submittedAt,
    screeningStatus: application.screeningStatus,
  };
}

function filtered(state, { search = '', positionId = '', status = '', sort = 'newest' } = {}) {
  const needle = normalize(search.trim());
  return state.applications
    .map((application) => summaryOf(state, application))
    .filter((item) => !needle || normalize(`${item.id} ${item.applicantName}`).includes(needle))
    .filter((item) => !positionId || item.positionId === positionId)
    .filter((item) => !status || item.screeningStatus === status)
    .sort((a, b) =>
      sort === 'oldest' ? a.submittedAt.localeCompare(b.submittedAt) : b.submittedAt.localeCompare(a.submittedAt),
    );
}

function countsOf(items) {
  return {
    applications: items.length,
    applicants: new Set(items.map((item) => item.applicantId)).size,
    pendingReview: items.filter((item) => item.screeningStatus === 'pendingReview').length,
    shortlisted: items.filter((item) => item.screeningStatus === 'shortlisted').length,
    rejected: items.filter((item) => item.screeningStatus === 'rejected').length,
  };
}

function findApplication(state, id) {
  const application = state.applications.find((item) => item.id === id);
  if (!application) {
    throw createUiError('notFound', `Không tìm thấy hồ sơ ${id}.`);
  }
  return application;
}

function detailOf(state, application) {
  const account = accountById(application.applicantId);
  return {
    ...summaryOf(state, application),
    student: {
      name: account?.displayName ?? '—',
      studentId: account?.studentId ?? '—',
      email: account?.email ?? '—',
      faculty: account?.faculty ?? '—',
      year: account?.year ?? '—',
    },
    availabilityText: slotText(state, application.slotIds),
    sop: application.sop,
    cv: { ...application.cv, url: SAMPLE_CV_URL },
    reviewedAt: application.reviewedAt,
    privateNote: application.privateNote,
  };
}

/** Page of application summaries. query: { search, positionId, status, sort, page, pageSize } */
export async function list(query = {}) {
  await mockRequest();
  requireRole('executive');
  const items = filtered(getState(), query);
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, query.page ?? 1), pageCount);
  return clone({
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    pageSize,
    pageCount,
  });
}

/** Campaign-wide and filtered counts; applications and distinct applicants differ (BR-06). */
export async function getStats(query = {}) {
  await mockRequest();
  requireRole('executive');
  const state = getState();
  const all = filtered(state, {});
  const subset = filtered(state, query);
  const isFiltered = Boolean(query.search?.trim() || query.positionId || query.status);
  return clone({ campaign: countsOf(all), filtered: countsOf(subset), isFiltered });
}

export async function get(id) {
  await mockRequest();
  requireRole('executive');
  const state = getState();
  return clone(detailOf(state, findApplication(state, id)));
}

export async function saveNote(id, note) {
  await mockRequest();
  requireRole('executive');
  const state = getState();
  const application = findApplication(state, id);
  application.privateNote = note;
  return clone(detailOf(state, application));
}

/**
 * Records the CV-screening decision for ONE application (BR-07).
 * Only Pending Review applications can be decided: whether a decision may be
 * reversed before confirmation is not settled by the sources (WORKFLOWS §3).
 */
export async function setScreening(id, status) {
  await mockRequest();
  requireRole('executive');
  assertNotLockedBySchedule('quyết định vòng CV');
  if (!['shortlisted', 'rejected'].includes(status)) {
    throw createUiError('validation', 'Quyết định không hợp lệ.');
  }
  const state = getState();
  const application = findApplication(state, id);
  if (application.screeningStatus !== 'pendingReview') {
    throw createUiError(
      'conflict',
      `Hồ sơ ${id} đã có quyết định "${getLabel(SCREENING_STATUS_LABELS, application.screeningStatus)}".`,
    );
  }
  application.screeningStatus = status;
  application.reviewedAt = state.now;
  if (status === 'rejected') {
    state.interviews = state.interviews.filter((interview) => interview.applicationId !== id);
  }
  if (state.schedule.status === 'draft') {
    state.schedule.dirty = true;
  }
  return clone(detailOf(state, application));
}


/** CSV of the current filter with permitted fields only (no private notes, no CV files) — BR-09. */
export async function exportCsv(query = {}) {
  await mockRequest();
  requireRole('executive');
  const state = getState();
  const items = filtered(state, query);
  const header = ['Mã hồ sơ', 'Ứng viên', 'Mã số sinh viên', 'Email', 'Vị trí', 'Thời gian nộp', 'Trạng thái'];
  const lines = items.map((item) => {
    const account = accountById(item.applicantId);
    return [
      item.id,
      item.applicantName,
      account?.studentId,
      account?.email,
      item.positionName,
      formatDateTime(item.submittedAt),
      getLabel(SCREENING_STATUS_LABELS, item.screeningStatus),
    ];
  });
  return {
    fileName: 'clubflow-ho-so.csv',
    content: toCsv(header, lines),
    rowCount: items.length,
  };
}
