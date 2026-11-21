# Migrations

The database schema, as plain SQL files applied in file-name order. `npm run seed` applies all of
them to a fresh schema; `npm run migrate` applies the ones not yet recorded in `schema_migrations`.

Names follow the numbers in `specs/003-pa4-express-server/tasks.md` (dependency order, not person):

```text
010-users.sql
020-campaigns.sql
030-positions.sql
...
```

Rules:

1. One file per table group; the number is taken from the table in tasks.md. Ask before using another.
2. A file that teammates have pulled is never edited. A change is a new file with the next free number.
3. No demo data here: rows go in the seed module with the same number (`src/db/seeds/`).
4. Data access SQL in the application stays in repositories; these files only create schema.
