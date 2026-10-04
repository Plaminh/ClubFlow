-- Docker-only bootstrap.
-- Application schema belongs in versioned files under database/migrations/.

CREATE TABLE IF NOT EXISTS schema_migrations (
  id BIGSERIAL PRIMARY KEY,
  filename VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
