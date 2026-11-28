-- Positions of a campaign. quota, description and requirements may be missing in a draft;
-- publishing checks them. sort_order keeps the order in which positions were added.

CREATE TABLE positions (
  id VARCHAR(64) PRIMARY KEY,
  campaign_id VARCHAR(64) NOT NULL REFERENCES campaigns (id) ON DELETE CASCADE,
  department_id VARCHAR(64) NOT NULL REFERENCES departments (id),
  name VARCHAR(120) NOT NULL,
  quota INTEGER CHECK (quota >= 0),
  description VARCHAR(2000),
  requirements VARCHAR(2000),
  sort_order INTEGER GENERATED ALWAYS AS IDENTITY UNIQUE
);

CREATE INDEX positions_campaign_id_idx ON positions (campaign_id);
