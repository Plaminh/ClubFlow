/*
 * The single error shape the UI understands (specs/001-frontend-ui/contracts/ui-services.md).
 * Services reject with a UiError; pages show `message` and map `fieldErrors`
 * onto form fields.
 */

export const UI_ERROR_KINDS = Object.freeze([
  'validation',
  'conflict',
  'forbidden',
  'notFound',
  'network',
  'unknown',
]);

export class UiError extends Error {
  constructor(kind, message, { code, fieldErrors, details } = {}) {
    super(message);
    this.name = 'UiError';
    this.kind = UI_ERROR_KINDS.includes(kind) ? kind : 'unknown';
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.details = details;
  }
}

export function createUiError(kind, message, extras) {
  return new UiError(kind, message, extras);
}

/** Normalizes anything thrown into a UiError with a safe Vietnamese message. */
export function toUiError(error) {
  if (error instanceof UiError) {
    return error;
  }

  if (error instanceof TypeError) {
    return new UiError('network', 'Không kết nối được tới máy chủ. Vui lòng thử lại.');
  }

  return new UiError('unknown', 'Đã có lỗi xảy ra. Vui lòng thử lại.');
}
