/*
 * Date and time display helpers.
 *
 * Output is fixed to the formats used by the UI references (dd/MM/yyyy and
 * 24-hour HH:mm) regardless of the browser's locale or time zone, so the same
 * instant always reads the same way for every user.
 *
 * Inputs: Date objects, epoch milliseconds, or ISO 8601 strings. Pass ISO
 * strings WITH an offset (for example "2026-11-05T09:00:00+07:00"); strings
 * without an offset are interpreted by the JavaScript runtime in local time.
 *
 * The display time zone is a single constant. The final time representation
 * is still an open question (Q-02 in docs/requirements/DECISIONS_AND_OPEN_QUESTIONS.md).
 */

import { EMPTY_LABEL } from '../constants/labels.js';

export const DISPLAY_LOCALE = 'vi-VN';
export const DISPLAY_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const dateFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
  timeZone: DISPLAY_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
  timeZone: DISPLAY_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function toValidDate(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Build the string from parts so locale punctuation differences in the
// runtime's Intl data cannot change the result.
function partsOf(formatter, date) {
  return Object.fromEntries(
    formatter.formatToParts(date).map(({ type, value }) => [type, value]),
  );
}

/** "05/11/2026", or the fallback for missing or invalid input. */
export function formatDate(value, fallback = EMPTY_LABEL) {
  const date = toValidDate(value);
  if (!date) {
    return fallback;
  }

  const { day, month, year } = partsOf(dateFormatter, date);
  return `${day}/${month}/${year}`;
}

/** "09:00", or the fallback for missing or invalid input. */
export function formatTime(value, fallback = EMPTY_LABEL) {
  const date = toValidDate(value);
  if (!date) {
    return fallback;
  }

  const { hour, minute } = partsOf(timeFormatter, date);
  return `${hour}:${minute}`;
}

/** "14/10/2026, 09:42", or the fallback for missing or invalid input. */
export function formatDateTime(value, fallback = EMPTY_LABEL) {
  const date = toValidDate(value);
  if (!date) {
    return fallback;
  }

  return `${formatDate(date)}, ${formatTime(date)}`;
}

/** "09:00–09:15" (en dash), or the fallback if either end is missing or invalid. */
export function formatTimeRange(start, end, fallback = EMPTY_LABEL) {
  if (!toValidDate(start) || !toValidDate(end)) {
    return fallback;
  }

  return `${formatTime(start)}–${formatTime(end)}`;
}
