import bcrypt from 'bcryptjs';

const DEMO_PASSWORD = 'ClubFlowDemo!';

// A fixed cost-10 salt keeps this public demo seed identical on every run.
const DEMO_PASSWORD_SALT = '$2b$10$N9qo8uLOickgx2ZMRZoMye';

const users = [
  {
    id: 'exec-recruitment',
    handle: 'exec',
    role: 'executive',
    displayName: 'Recruitment Executive',
    email: 'executive@clubflow.demo.example',
    description: 'Technology and Innovation Club',
  },
  {
    id: 'ap-minhanh',
    handle: 'studentA',
    role: 'applicant',
    displayName: 'Nguyen Minh Anh',
    email: 'minh.anh@demo.example',
    studentId: '26DEMO0142',
    faculty: 'Information Technology',
    year: 'Year 2',
  },
  {
    id: 'ap-quocbao',
    handle: 'studentB',
    role: 'applicant',
    displayName: 'Pham Quoc Bao',
    email: 'quoc.bao@demo.example',
    studentId: '26DEMO0177',
    faculty: 'Design',
    year: 'Year 3',
  },
  {
    id: 'iv-giahuy',
    handle: 'int-content',
    role: 'interviewer',
    displayName: 'Gia Huy',
    email: 'gia.huy@clubflow.demo.example',
    description: 'Content',
  },
  {
    id: 'iv-comms',
    handle: 'int-comms',
    role: 'interviewer',
    displayName: 'Linh Tran',
    email: 'linh.tran@clubflow.demo.example',
    description: 'Communications',
  },
  {
    id: 'ap-lanchi',
    handle: 'studentC',
    role: 'applicant',
    displayName: 'Tran Lan Chi',
    email: 'lan.chi@demo.example',
    studentId: '26DEMO0193',
    faculty: 'Business Administration',
    year: 'Year 1',
  },
];

export default async function seed(client) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, DEMO_PASSWORD_SALT);

  for (const user of users) {
    await client.query(
      `INSERT INTO users (
        id, handle, email, password_hash, role, display_name, description, student_id, faculty, year
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        user.id,
        user.handle,
        user.email,
        passwordHash,
        user.role,
        user.displayName,
        user.description ?? null,
        user.studentId ?? null,
        user.faculty ?? null,
        user.year ?? null,
      ],
    );
  }
}
