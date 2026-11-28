// Seed State (docs/api/README.md): the published campaign cmp-2026-hk1, accepting applications.
export default async function seed(client) {
  await client.query('INSERT INTO departments (id, name) VALUES ($1, $2)', [
    'dep-comms',
    'Communications',
  ]);

  await client.query(
    `INSERT INTO campaigns (
       id, name, host_club, description, instructions, opens_on, closes_on, interview_date,
       interview_window_start, interview_window_end, slot_minutes, status, published_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      'cmp-2026-hk1',
      'ClubFlow 2026 Recruitment',
      'Technology and Innovation Club',
      "Recruitment for the club's 2026 team.",
      'Submit one application per position.',
      '2026-11-10',
      '2026-11-30',
      '2026-12-02',
      '09:00',
      '12:00',
      30,
      'published',
      '2026-11-09T09:00:00+07:00',
    ],
  );
}
