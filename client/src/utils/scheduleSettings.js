import { formatDate } from './format.js';

/** Draft settings form for C8: rules of POST .../schedule/draft/generate (docs/api/04-scheduling.md). */
export const SLOT_MINUTES = [15, 20, 30];
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/u;
const minutesOf = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/**
 * Client-side check of the generate body, with the rules of
 * docs/api/04-scheduling.md (POST .../schedule/draft/generate). Keys follow the
 * form's fields; the API's `interviewWindow` error is shown on the end time.
 */
export function validateScheduleSettings(values, closesOn) {
  const errors = {};
  if (!values.interviewDate) errors.interviewDate = 'Chọn ngày phỏng vấn.';
  else if (closesOn && values.interviewDate <= closesOn)
    errors.interviewDate = `Ngày phỏng vấn phải sau ngày đóng đơn (${formatDate(closesOn)}).`;
  if (!values.windowStart) errors.windowStart = 'Chọn giờ bắt đầu.';
  else if (!TIME.test(values.windowStart)) errors.windowStart = 'Dùng định dạng HH:MM.';
  if (!values.windowEnd) errors.windowEnd = 'Chọn giờ kết thúc.';
  else if (!TIME.test(values.windowEnd)) errors.windowEnd = 'Dùng định dạng HH:MM.';
  const slotMinutes = Number(values.slotMinutes);
  if (!SLOT_MINUTES.includes(slotMinutes)) errors.slotMinutes = 'Chọn 15, 20 hoặc 30 phút.';
  if (!errors.windowStart && !errors.windowEnd) {
    if (values.windowStart >= values.windowEnd)
      errors.windowEnd = 'Giờ kết thúc phải sau giờ bắt đầu.';
    else if (
      !errors.slotMinutes &&
      minutesOf(values.windowEnd) - minutesOf(values.windowStart) < slotMinutes
    ) {
      errors.windowEnd = `Khoảng giờ phải đủ cho ít nhất một ca ${slotMinutes} phút.`;
    }
  }
  return errors;
}

/** The form's values as the contract's request body. */
export function toGenerateBody(values) {
  return {
    interviewDate: values.interviewDate,
    interviewWindow: { start: values.windowStart, end: values.windowEnd },
    slotMinutes: Number(values.slotMinutes),
  };
}
