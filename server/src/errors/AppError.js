// An error the API answers on purpose. The error handler turns it into the contract's shape:
// { error, code, fieldErrors?, details? } (docs/api/README.md, Error Convention).
export default class AppError extends Error {
  /**
   * @param {number} statusCode HTTP status, 4xx for a refusal.
   * @param {string} code Stable machine-readable code, e.g. 'DUPLICATE_APPLICATION'.
   * @param {string} message User-safe message.
   * @param {{ fieldErrors?: Record<string, string>, details?: object }} [extra]
   */
  constructor(statusCode, code, message, { fieldErrors, details } = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.details = details;
  }
}
