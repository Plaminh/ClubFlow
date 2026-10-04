# Seeds

Optional development/demo data belongs here.

Seed files run in filename order when executing:

```bash
npm run db:seed
```

Prefer idempotent SQL such as `INSERT ... ON CONFLICT DO NOTHING` so rerunning seeds is safe.
