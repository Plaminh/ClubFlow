import pool from '../db/pool.js';

// Dates come back as YYYY-MM-DD and instants in UTC+7, the contract's formats (docs/api/README.md).
const SELECT_CAMPAIGN = `
  SELECT id, name, host_club, description, instructions,
    to_char(opens_on, 'YYYY-MM-DD') AS opens_on,
    to_char(closes_on, 'YYYY-MM-DD') AS closes_on,
    to_char(applications_closed_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD"T"HH24:MI:SS"+07:00"')
      AS applications_closed_at,
    to_char(interview_date, 'YYYY-MM-DD') AS interview_date,
    to_char(interview_window_start, 'HH24:MI') AS interview_window_start,
    to_char(interview_window_end, 'HH24:MI') AS interview_window_end,
    slot_minutes, status,
    to_char(published_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD"T"HH24:MI:SS"+07:00"')
      AS published_at
  FROM campaigns WHERE id = $1`;

// Fixed queries per table: the table name never comes from a request.
const IDS_STARTING_WITH = {
  campaigns: 'SELECT id FROM campaigns WHERE id LIKE $1',
  positions: 'SELECT id FROM positions WHERE id LIKE $1',
  departments: 'SELECT id FROM departments WHERE id LIKE $1',
};

function toCampaign(row) {
  return {
    id: row.id,
    name: row.name,
    hostClub: row.host_club,
    description: row.description,
    instructions: row.instructions,
    opensOn: row.opens_on,
    closesOn: row.closes_on,
    applicationsClosedAt: row.applications_closed_at,
    interviewDate: row.interview_date,
    interviewWindow: { start: row.interview_window_start, end: row.interview_window_end },
    slotMinutes: row.slot_minutes,
    status: row.status,
    publishedAt: row.published_at,
  };
}

function campaignValues(campaign) {
  return [
    campaign.id,
    campaign.name ?? null,
    campaign.hostClub ?? null,
    campaign.description ?? null,
    campaign.instructions ?? null,
    campaign.opensOn ?? null,
    campaign.closesOn ?? null,
    campaign.interviewDate,
    campaign.interviewWindow.start,
    campaign.interviewWindow.end,
    campaign.slotMinutes,
  ];
}

export async function findCampaign(id, db = pool) {
  const { rows } = await db.query(SELECT_CAMPAIGN, [id]);
  return rows[0] ? toCampaign(rows[0]) : null;
}

// Inside a transaction: keeps the campaign row from changing until the transaction ends.
// Returns whether the campaign exists.
export async function lockCampaign(id, db) {
  const { rowCount } = await db.query('SELECT id FROM campaigns WHERE id = $1 FOR UPDATE', [id]);
  return rowCount > 0;
}

// The dates that make a published campaign active (opensOn through interviewDate).
export async function findPublishedPeriods(db = pool) {
  const { rows } = await db.query(
    `SELECT id, to_char(opens_on, 'YYYY-MM-DD') AS opens_on,
            to_char(interview_date, 'YYYY-MM-DD') AS interview_date
     FROM campaigns WHERE status = 'published'`,
  );
  return rows.map((row) => ({
    id: row.id,
    opensOn: row.opens_on,
    interviewDate: row.interview_date,
  }));
}

// Inside a transaction: one publish or published edit at a time, so two campaigns cannot both
// pass the active-campaign check concurrently. Released at commit or rollback.
export async function lockPublishing(db) {
  await db.query("SELECT pg_advisory_xact_lock(hashtext('campaign-publishing'))");
}

export async function findIdsStartingWith(table, prefix, db = pool) {
  // The prefix is made by the server from [a-z0-9-] only, so it holds no LIKE wildcard.
  const { rows } = await db.query(IDS_STARTING_WITH[table], [`${prefix}%`]);
  return rows.map((row) => row.id);
}

export async function insertCampaign(campaign, db = pool) {
  await db.query(
    `INSERT INTO campaigns (
       id, name, host_club, description, instructions, opens_on, closes_on, interview_date,
       interview_window_start, interview_window_end, slot_minutes
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    campaignValues(campaign),
  );
}

export async function updateCampaign(campaign, db = pool) {
  await db.query(
    `UPDATE campaigns SET
       name = $2, host_club = $3, description = $4, instructions = $5, opens_on = $6,
       closes_on = $7, interview_date = $8, interview_window_start = $9,
       interview_window_end = $10, slot_minutes = $11
     WHERE id = $1`,
    campaignValues(campaign),
  );
}

export async function markPublished(id, db = pool) {
  await db.query("UPDATE campaigns SET status = 'published', published_at = NOW() WHERE id = $1", [
    id,
  ]);
}

export async function findPositions(campaignId, db = pool) {
  const { rows } = await db.query(
    `SELECT p.id, p.department_id, d.name AS department_name, p.name, p.quota, p.description,
            p.requirements
     FROM positions p JOIN departments d ON d.id = p.department_id
     WHERE p.campaign_id = $1
     ORDER BY p.sort_order`,
    [campaignId],
  );
  return rows.map((row) => ({
    id: row.id,
    departmentId: row.department_id,
    departmentName: row.department_name,
    name: row.name,
    quota: row.quota,
    description: row.description,
    requirements: row.requirements,
  }));
}

export async function insertPosition(position, db = pool) {
  await db.query(
    `INSERT INTO positions (id, campaign_id, department_id, name, quota, description, requirements)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      position.id,
      position.campaignId,
      position.departmentId,
      position.name,
      position.quota ?? null,
      position.description ?? null,
      position.requirements ?? null,
    ],
  );
}

export async function updatePosition(position, db = pool) {
  await db.query(
    `UPDATE positions
     SET department_id = $2, name = $3, quota = $4, description = $5, requirements = $6
     WHERE id = $1`,
    [
      position.id,
      position.departmentId,
      position.name,
      position.quota ?? null,
      position.description ?? null,
      position.requirements ?? null,
    ],
  );
}

// Returns whether a position of that campaign was deleted.
export async function deletePosition(campaignId, positionId, db = pool) {
  const { rowCount } = await db.query('DELETE FROM positions WHERE campaign_id = $1 AND id = $2', [
    campaignId,
    positionId,
  ]);
  return rowCount > 0;
}

export async function findDepartmentByName(name, db = pool) {
  const { rows } = await db.query('SELECT id FROM departments WHERE name = $1', [name]);
  return rows[0]?.id ?? null;
}

export async function insertDepartment(department, db = pool) {
  await db.query('INSERT INTO departments (id, name) VALUES ($1, $2)', [
    department.id,
    department.name,
  ]);
}
