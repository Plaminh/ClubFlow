CREATE TABLE users (
  id TEXT PRIMARY KEY,
  handle TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('applicant', 'interviewer', 'executive')),
  display_name TEXT NOT NULL,
  description TEXT,
  student_id TEXT,
  faculty TEXT,
  year TEXT
);
