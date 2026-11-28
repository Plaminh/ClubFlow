import pool from '../db/pool.js';

export async function findUserByHandle(handle) {
  const { rows } = await pool.query(
    'SELECT id, handle, email, role, display_name, description, student_id, faculty, year, password_hash FROM users WHERE handle = $1',
    [handle],
  );
  return rows[0] ?? null;
}

export async function findUserById(id) {
  const { rows } = await pool.query(
    'SELECT id, handle, email, role, display_name, description, student_id, faculty, year FROM users WHERE id = $1',
    [id],
  );
  return rows[0] ?? null;
}

export async function updateUserProfile(id, { displayName, email }) {
  const { rows } = await pool.query(
    'UPDATE users SET display_name = $1, email = $2 WHERE id = $3 RETURNING id, handle, email, role, display_name, description, student_id, faculty, year',
    [displayName, email, id],
  );
  return rows[0] ?? null;
}
