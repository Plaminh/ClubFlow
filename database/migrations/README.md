# Migrations

Store versioned schema changes here.

Naming convention:

```text
001_create_users.sql
002_add_user_role.sql
003_create_projects.sql
```

Rules:

1. Keep migrations ordered and immutable after teammates have applied them.
2. Create a new migration for every schema change.
3. Do not put demo data in migrations.
4. Run `npm run db:migrate` from the repository root.
