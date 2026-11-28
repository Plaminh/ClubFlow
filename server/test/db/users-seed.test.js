import bcrypt from 'bcryptjs';
import { pool, resetDatabase } from '../helpers/db.js';

const DEMO_PASSWORD = 'ClubFlowDemo!';

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await resetDatabase();
});

describe('Users migration and seed (T040)', () => {
  it('T040 seeds exactly the six contract demo users with the documented profiles', async () => {
    const { rows } = await pool.query(
      `SELECT id, handle, email, role, display_name, description, student_id, faculty, year
       FROM users ORDER BY handle`,
    );

    expect(rows).toHaveLength(6);
    expect(rows).toEqual([
      {
        id: 'exec-recruitment',
        handle: 'exec',
        email: 'executive@clubflow.demo.example',
        role: 'executive',
        display_name: 'Recruitment Executive',
        description: 'Technology and Innovation Club',
        student_id: null,
        faculty: null,
        year: null,
      },
      {
        id: 'iv-comms',
        handle: 'int-comms',
        email: 'linh.tran@clubflow.demo.example',
        role: 'interviewer',
        display_name: 'Linh Tran',
        description: 'Communications',
        student_id: null,
        faculty: null,
        year: null,
      },
      {
        id: 'iv-giahuy',
        handle: 'int-content',
        email: 'gia.huy@clubflow.demo.example',
        role: 'interviewer',
        display_name: 'Gia Huy',
        description: 'Content',
        student_id: null,
        faculty: null,
        year: null,
      },
      {
        id: 'ap-minhanh',
        handle: 'studentA',
        email: 'minh.anh@demo.example',
        role: 'applicant',
        display_name: 'Nguyen Minh Anh',
        description: null,
        student_id: '26DEMO0142',
        faculty: 'Information Technology',
        year: 'Year 2',
      },
      {
        id: 'ap-quocbao',
        handle: 'studentB',
        email: 'quoc.bao@demo.example',
        role: 'applicant',
        display_name: 'Pham Quoc Bao',
        description: null,
        student_id: '26DEMO0177',
        faculty: 'Design',
        year: 'Year 3',
      },
      {
        id: 'ap-lanchi',
        handle: 'studentC',
        email: 'lan.chi@demo.example',
        role: 'applicant',
        display_name: 'Tran Lan Chi',
        description: null,
        student_id: '26DEMO0193',
        faculty: 'Business Administration',
        year: 'Year 1',
      },
    ]);
  });

  it('T040 stores cost-10 bcrypt hashes, not the demo password', async () => {
    const { rows } = await pool.query('SELECT password_hash FROM users');

    expect(rows).toHaveLength(6);
    for (const { password_hash: passwordHash } of rows) {
      expect(passwordHash).not.toBe(DEMO_PASSWORD);
      expect(passwordHash).toMatch(/^\$2b\$10\$/);
      await expect(bcrypt.compare(DEMO_PASSWORD, passwordHash)).resolves.toBe(true);
    }
  });

  it('T040 rejects duplicate e-mails/handles and roles outside the contract', async () => {
    await expect(
      pool.query(
        `INSERT INTO users (id, handle, email, password_hash, role, display_name)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'another-user',
          'new-handle',
          'minh.anh@demo.example',
          'hash',
          'applicant',
          'Another User',
        ],
      ),
    ).rejects.toMatchObject({ code: '23505' });

    await expect(
      pool.query(
        `INSERT INTO users (id, handle, email, password_hash, role, display_name)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'another-handle-user',
          'exec',
          'another@demo.example',
          'hash',
          'applicant',
          'Another User',
        ],
      ),
    ).rejects.toMatchObject({ code: '23505' });

    await expect(
      pool.query(
        `INSERT INTO users (id, handle, email, password_hash, role, display_name)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['invalid-role-user', 'invalid-role', 'new@demo.example', 'hash', 'admin', 'Invalid Role'],
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });
});
