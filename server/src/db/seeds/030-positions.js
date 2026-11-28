// Seed State (docs/api/README.md): the two positions of cmp-2026-hk1, quota 2 each.
const POSITIONS = [
  ['pos-content', 'Content', 'Create campaign content.', 'Clear writing and collaboration.'],
  [
    'pos-comms',
    'Communications',
    'Coordinate recruitment communications.',
    'Clear speaking and dependable coordination.',
  ],
];

export default async function seed(client) {
  for (const [id, name, description, requirements] of POSITIONS) {
    await client.query(
      `INSERT INTO positions (id, campaign_id, department_id, name, quota, description, requirements)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, 'cmp-2026-hk1', 'dep-comms', name, 2, description, requirements],
    );
  }
}
