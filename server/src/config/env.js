// The only module that reads process.env (S2). `npm start`, `npm run seed` and `npm test` load
// server/.env with Node's --env-file-if-exists flag; this module never reads a file itself and
// never supplies a fallback for a missing value.

const REQUIRED = [
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'UPLOAD_DIR',
  'APP_TODAY',
];

const MAX_TOKEN_LIFETIME_SECONDS = 24 * 60 * 60;

function fail(message) {
  console.error(`Configuration error: ${message}`);
  console.error('Copy server/.env.example to server/.env and set every variable.');
  process.exit(1);
}

const values = {};
for (const name of REQUIRED) {
  const value = process.env[name]?.trim();
  if (!value) fail(`missing required environment variable ${name}.`);
  values[name] = value;
}

const port = Number(values.PORT);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  fail('PORT must be a whole number between 0 and 65535.');
}

const lifetime = values.JWT_EXPIRES_IN.match(/^(\d+)([mh])$/);
const lifetimeSeconds = lifetime ? Number(lifetime[1]) * (lifetime[2] === 'h' ? 3600 : 60) : 0;
if (lifetimeSeconds <= 0 || lifetimeSeconds > MAX_TOKEN_LIFETIME_SECONDS) {
  fail('JWT_EXPIRES_IN must be minutes or hours, such as 30m or 8h, and at most 24h.');
}

if (!/^\d{4}-\d{2}-\d{2}$/.test(values.APP_TODAY) || Number.isNaN(Date.parse(values.APP_TODAY))) {
  fail('APP_TODAY must be a date written YYYY-MM-DD.');
}

export const env = Object.freeze({
  port,
  databaseUrl: values.DATABASE_URL,
  jwtSecret: values.JWT_SECRET,
  jwtExpiresIn: values.JWT_EXPIRES_IN,
  uploadDir: values.UPLOAD_DIR,
  appToday: values.APP_TODAY,
});
