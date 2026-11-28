-- Campaigns and the departments their positions belong to (docs/api/07-campaign-management.md).
-- A draft may miss any field it does not need yet; a published campaign is complete and in order.

CREATE TABLE departments (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE campaigns (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120),
  host_club VARCHAR(120),
  description VARCHAR(4000),
  instructions VARCHAR(2000),
  opens_on DATE,
  closes_on DATE,
  applications_closed_at TIMESTAMPTZ,
  interview_date DATE NOT NULL,
  interview_window_start TIME NOT NULL,
  interview_window_end TIME NOT NULL,
  slot_minutes SMALLINT NOT NULL CHECK (slot_minutes IN (15, 20, 30)),
  status VARCHAR(16) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  CHECK (interview_window_start < interview_window_end),
  CHECK (
    status = 'draft'
    OR (
      name IS NOT NULL
      AND host_club IS NOT NULL
      AND description IS NOT NULL
      AND instructions IS NOT NULL
      AND published_at IS NOT NULL
      AND opens_on <= closes_on
      AND closes_on < interview_date
    )
  )
);
