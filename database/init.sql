-- Docker-only bootstrap for the local development database (docker-compose.yml).
-- The schema itself comes from the server's migrations (npm run seed / npm run migrate).

-- A second database for `npm test`, which wipes the database it runs against.
CREATE DATABASE clubflow_test OWNER clubflow;
