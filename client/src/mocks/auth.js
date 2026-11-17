/*
 * Development-only demo password for the frontend prototype. It is
 * intentionally fictional and is not a secret. Never persist it in browser
 * storage or reuse this module for production authentication.
 *
 * Identity is the account ID. The sign-in email is NOT stored here: it is the
 * current email of the in-memory profile (mocks/fixtures.js ACCOUNTS, editable
 * on My Profile), so an email change keeps the account reachable.
 */
export const DEMO_PASSWORD = 'ClubFlowDemo!';

// Accounts listed as examples on the Sign In page (one per role).
export const DEMO_CREDENTIAL_ACCOUNT_IDS = Object.freeze(['exec-recruitment', 'ap-minhanh', 'iv-hamy']);
