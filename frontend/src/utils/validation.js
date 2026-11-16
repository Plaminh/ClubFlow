/*
 * Client-side input checks for immediate UI feedback. They mirror the
 * documented rules (BR-01 campaign publication; Business §3.2 application
 * form) but are NOT enforcement: the backend must validate every request.
 * Each function returns an object of field → Vietnamese message (empty = valid).
 */

export const MAX_SOP_WORDS = 300;
export const MAX_CV_BYTES = 5 * 1024 * 1024;

export function countWords(text) {
  const trimmed = String(text ?? '').trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function formatMegabytes(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

const isBlank = (value) => !String(value ?? '').trim();

/** Positive whole number, given as typed (string) or as a number. */
export function isPositiveInteger(value) {
  return /^\d+$/.test(String(value ?? '').trim()) && Number(value) > 0;
}

/** Publication checks (BR-01). Keys: campaign fields, `positions`, `position:<key>:<field>`. */
export function validateCampaignForPublish(draft) {
  const errors = {};
  const required = {
    name: 'Tên chiến dịch là bắt buộc.',
    hostClub: 'Câu lạc bộ chủ trì là bắt buộc.',
    description: 'Mô tả chiến dịch là bắt buộc. Hãy thêm mô tả trước khi công bố.',
    instructions: 'Hướng dẫn ứng tuyển là bắt buộc.',
    opensOn: 'Chọn ngày mở đơn.',
    closesOn: 'Chọn ngày đóng đơn.',
    interviewDate: 'Chọn ngày phỏng vấn.',
  };
  for (const [field, message] of Object.entries(required)) {
    if (isBlank(draft[field])) {
      errors[field] = message;
    }
  }

  if (!errors.opensOn && !errors.closesOn && draft.opensOn >= draft.closesOn) {
    errors.closesOn = 'Ngày đóng đơn phải sau ngày mở đơn.';
  }
  if (!errors.closesOn && !errors.interviewDate && draft.interviewDate <= draft.closesOn) {
    errors.interviewDate = 'Ngày phỏng vấn phải sau ngày đóng đơn.';
  }

  const positions = draft.positions ?? [];
  if (positions.length === 0) {
    errors.positions = 'Chiến dịch cần ít nhất một vị trí tuyển.';
  }
  positions.forEach((position) => {
    const key = position.key ?? position.id;
    if (isBlank(position.departmentName)) {
      errors[`position:${key}:departmentName`] = 'Nhập tên ban.';
    }
    if (isBlank(position.name)) {
      errors[`position:${key}:name`] = 'Nhập tên vị trí.';
    }
    if (!isPositiveInteger(position.quota)) {
      errors[`position:${key}:quota`] = 'Chỉ tiêu phải là số nguyên dương (ví dụ 2).';
    }
    if (isBlank(position.description)) {
      errors[`position:${key}:description`] = 'Nhập mô tả công việc.';
    }
    if (isBlank(position.requirements)) {
      errors[`position:${key}:requirements`] = 'Nhập yêu cầu.';
    }
  });

  return errors;
}

/** Application form checks (Business §3.2). `cv` is a File-like { name, type, size } or null. */
export function validateApplicationInput({ positionId, email, faculty, sop, slotIds, cv }) {
  const errors = {};
  if (isBlank(positionId)) {
    errors.positionId = 'Vui lòng chọn vị trí ứng tuyển.';
  }
  if (isBlank(email)) {
    errors.email = 'Vui lòng nhập email liên hệ.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Email chưa đúng định dạng.';
  }
  if (isBlank(faculty)) {
    errors.faculty = 'Vui lòng chọn khoa.';
  }
  if (!cv) {
    errors.cv = 'Vui lòng chọn CV định dạng PDF.';
  } else if (!/\.pdf$/i.test(cv.name) || (cv.type && cv.type !== 'application/pdf')) {
    errors.cv = 'Tệp phải là PDF (.pdf).';
  } else if (cv.size > MAX_CV_BYTES) {
    errors.cv = `CV tối đa 5 MB; tệp hiện tại ${formatMegabytes(cv.size)}.`;
  }
  const words = countWords(sop);
  if (words === 0) {
    errors.sop = 'Vui lòng viết bài trình bày nguyện vọng.';
  } else if (words > MAX_SOP_WORDS) {
    errors.sop = `Bài trình bày dài ${words} từ; tối đa ${MAX_SOP_WORDS} từ.`;
  }
  if (!slotIds || slotIds.length === 0) {
    errors.slotIds = 'Chọn ít nhất một khung giờ có thể tham gia.';
  }
  return errors;
}

export const ASSESSMENT_RECOMMENDATIONS = Object.freeze(['pass', 'fail']);

/**
 * Interview assessment checks (team-selected Q-04): notes are required; the
 * recommendation is optional (null/empty) and otherwise 'pass' or 'fail'.
 */
export function validateAssessmentInput({ recommendation, notes }) {
  const errors = {};
  if (isBlank(notes)) {
    errors.notes = 'Vui lòng nhập nhận xét phỏng vấn.';
  }
  if (!isBlank(recommendation) && !ASSESSMENT_RECOMMENDATIONS.includes(recommendation)) {
    errors.recommendation = 'Đề xuất chỉ có thể là Pass, Fail hoặc để trống.';
  }
  return errors;
}
