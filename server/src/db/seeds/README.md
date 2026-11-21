# Seed modules

`npm run seed` drops the `public` schema, applies every migration, then runs every `.js` module in
this folder in file-name order, all inside one transaction. Running it again gives the same state.

Each module uses the number of the migration whose tables it fills (`010-users.js` fills the
tables of `migrations/010-users.sql`), so a table is seeded after the tables it references:

```js
// src/db/seeds/010-users.js
export default async function seed(client, { uploadDir, appToday }) {
  await client.query('INSERT INTO users (id, handle) VALUES ($1, $2)', ['exec-recruitment', 'exec']);
}
```

- `client` is the transaction's database client: use `$1` placeholders, never string building.
- `uploadDir` is the absolute `UPLOAD_DIR`, for seeded CV files; `appToday` is `APP_TODAY`.
- The data is the seed state of `docs/api/README.md`. Fictional people only.
