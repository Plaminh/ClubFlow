/*
 * Read-only derivations over the mock state, used by mock services only.
 *
 * evaluateSchedule() is a DEMO STAND-IN for backend validation so that manual
 * edits in the demo stay internally consistent (Proposed / Conflict /
 * Unassigned). It is not a scheduler and not the source of truth: the backend
 * must enforce BR-10…BR-14 (docs/requirements/BUSINESS_RULES.md).
 */
import { ACCOUNTS, at } from './fixtures.js';
import { addMinutes } from './scenarios.js';
import { formatDate, formatTimeRange } from '../../utils/format.js';

const DAY_MINUTES = 24 * 60;

export const toMs = (iso) => new Date(iso).getTime();

/** Q-01 input order: oldest submitted application first, then stable ID. */
export function compareApplicationsForScheduling(a, b) {
  return toMs(a.submittedAt) - toMs(b.submittedAt) || a.id.localeCompare(b.id);
}

export function accountById(id) {
  return ACCOUNTS.find((account) => account.id === id) ?? null;
}

export function accountName(id) {
  return accountById(id)?.displayName ?? '—';
}

export function positionById(state, id) {
  return state.positions.find((position) => position.id === id) ?? null;
}

export function departmentById(state, id) {
  return state.departments.find((department) => department.id === id) ?? null;
}

export function roomName(state, id) {
  return state.rooms.find((room) => room.id === id)?.name ?? null;
}

/** Applications accepted while opensAt <= now < closesAt (BR-02); closing day inclusive. */
export function submissionWindow(campaign) {
  return {
    opensAt: at(campaign.opensOn, '00:00'),
    closesAt: addMinutes(at(campaign.closesOn, '00:00'), DAY_MINUTES),
  };
}

/** 'draft' | 'before-open' | 'open' | 'closed' at the demo clock. */
export function campaignPhase(state) {
  if (state.campaign.status !== 'published') {
    return 'draft';
  }
  const { opensAt, closesAt } = submissionWindow(state.campaign);
  const now = toMs(state.now);
  if (now < toMs(opensAt)) {
    return 'before-open';
  }
  return now < toMs(closesAt) ? 'open' : 'closed';
}

export function isScheduleConfirmed(state) {
  return state.schedule.status === 'confirmed';
}

export function slotText(state, slotIds) {
  return state.slots
    .filter((slot) => slotIds.includes(slot.id))
    .sort((a, b) => toMs(a.start) - toMs(b.start) || a.id.localeCompare(b.id))
    .map((slot) => formatTimeRange(slot.start, slot.end))
    .join(', ');
}

/** Start times of every session inside the interview window. */
export function sessionStarts(state) {
  const { interviewDate, interviewWindow, slotMinutes } = state.campaign;
  const starts = [];
  let cursor = at(interviewDate, interviewWindow.start);
  const end = toMs(at(interviewDate, interviewWindow.end));
  while (toMs(addMinutes(cursor, slotMinutes)) <= end) {
    starts.push(cursor);
    cursor = addMinutes(cursor, slotMinutes);
  }
  return starts;
}

const contains = (range, start, end) => toMs(range.start) <= toMs(start) && toMs(end) <= toMs(range.end);
const overlaps = (a, b) => toMs(a.start) < toMs(b.end) && toMs(b.start) < toMs(a.end);
const isPlaced = (interview) => Boolean(interview?.start && interview.roomId && interview.interviewerId);

export function evaluateSchedule(state) {
  const { campaign, schedule } = state;
  const confirmed = isScheduleConfirmed(state);
  const shortlisted = state.applications
    .filter((application) => application.screeningStatus === 'shortlisted')
    .sort(compareApplicationsForScheduling);
  const byApplication = new Map(state.interviews.map((interview) => [interview.applicationId, interview]));
  const windowRange = {
    start: at(campaign.interviewDate, campaign.interviewWindow.start),
    end: at(campaign.interviewDate, campaign.interviewWindow.end),
  };

  const placed = shortlisted
    .map((application) => ({ application, interview: byApplication.get(application.id) }))
    .filter(({ interview }) => isPlaced(interview));

  const rows = shortlisted.map((application) => {
    const interview = byApplication.get(application.id) ?? null;
    const position = positionById(state, application.positionId);
    const row = {
      applicationId: application.id,
      applicantId: application.applicantId,
      applicantName: accountName(application.applicantId),
      positionId: application.positionId,
      positionName: position?.name ?? '—',
      availabilityText: slotText(state, application.slotIds),
      interviewId: interview?.id ?? null,
      start: interview?.start ?? null,
      end: interview?.end ?? null,
      interviewerId: interview?.interviewerId ?? null,
      interviewerName: interview?.interviewerId ? accountName(interview.interviewerId) : null,
      roomId: interview?.roomId ?? null,
      roomName: interview?.roomId ? roomName(state, interview.roomId) : null,
      status: 'proposed',
      reasons: [],
      conflictWith: [],
    };

    if (!isPlaced(interview)) {
      row.status = 'unassigned';
      row.reasons.push(interview?.note || 'Chưa có ca phỏng vấn hợp lệ trong lịch nháp.');
      return row;
    }

    if (confirmed) {
      row.status = 'confirmed';
      return row;
    }

    const assignment = state.assignments.find((item) => item.interviewerId === interview.interviewerId);
    if (!contains(windowRange, interview.start, interview.end)) {
      row.reasons.push('Ngoài khung giờ phỏng vấn của chiến dịch.');
    }
    const applicantSlots = state.slots.filter((slot) => application.slotIds.includes(slot.id));
    if (!applicantSlots.some((slot) => contains(slot, interview.start, interview.end))) {
      row.reasons.push('Ngoài giờ rảnh của ứng viên.');
    }
    if (!assignment?.positionIds.includes(application.positionId)) {
      row.reasons.push('Người phỏng vấn không được phân công cho vị trí này.');
    } else if (!assignment.availability.some((range) => contains(range, interview.start, interview.end))) {
      row.reasons.push('Ngoài giờ rảnh của người phỏng vấn.');
    }
    if (!schedule.roomIds.includes(interview.roomId)) {
      row.reasons.push('Phòng không nằm trong danh sách phòng đã chọn.');
    }

    for (const other of placed) {
      if (other.application.id === application.id || !overlaps(interview, other.interview)) {
        continue;
      }
      const otherId = other.application.id;
      if (other.application.applicantId === application.applicantId) {
        row.reasons.push(`Chồng giờ với ${otherId} của cùng ứng viên.`);
      } else if (other.interview.interviewerId === interview.interviewerId) {
        row.reasons.push(`Chồng giờ với ${otherId} (cùng người phỏng vấn ${accountName(interview.interviewerId)}).`);
      } else if (other.interview.roomId === interview.roomId) {
        row.reasons.push(`Chồng giờ với ${otherId} (cùng phòng ${roomName(state, interview.roomId)}).`);
      } else {
        continue;
      }
      row.conflictWith.push(otherId);
    }

    if (row.reasons.length > 0) {
      row.status = 'conflict';
    } else {
      row.reasons.push('Phù hợp giờ rảnh, người phỏng vấn và phòng.');
    }
    return row;
  });

  const count = (status) => rows.filter((row) => row.status === status).length;
  const summary = {
    shortlisted: rows.length,
    proposed: count('proposed'),
    conflict: count('conflict'),
    unassigned: count('unassigned'),
    confirmed: count('confirmed'),
  };

  const { closesAt } = submissionWindow(campaign);
  const pending = state.applications.filter((application) => application.screeningStatus === 'pendingReview');
  const unassigned = rows.filter((row) => row.status === 'unassigned');
  const closed = toMs(state.now) >= toMs(closesAt);
  const conditions = [
    {
      id: 'closed',
      met: closed,
      text: closed
        ? `Đã đóng đơn ngày ${formatDate(campaign.closesOn)}.`
        : `Chưa đến hạn đóng đơn (${formatDate(campaign.closesOn)}).`,
    },
    {
      id: 'screened',
      met: pending.length === 0,
      text:
        pending.length === 0
          ? 'Tất cả hồ sơ đã được duyệt.'
          : `${pending.map((item) => `${item.id} · ${accountName(item.applicantId)}`).join(', ')} vẫn đang chờ duyệt.`,
    },
    {
      id: 'conflict',
      met: summary.conflict === 0,
      text: summary.conflict === 0 ? 'Không còn bản ghi Conflict.' : `Còn ${summary.conflict} bản ghi Conflict.`,
    },
    {
      id: 'unassigned',
      met: unassigned.length === 0,
      text:
        unassigned.length === 0
          ? 'Mọi hồ sơ qua vòng CV đều có đúng một ca phỏng vấn.'
          : `${unassigned.map((row) => row.applicationId).join(', ')} vẫn Unassigned.`,
    },
  ];

  return {
    rows,
    summary,
    conditions,
    zeroShortlisted: rows.length === 0,
    canConfirm: !confirmed && rows.length > 0 && conditions.every((condition) => condition.met),
  };
}
