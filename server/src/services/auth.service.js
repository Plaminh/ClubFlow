import bcrypt from 'bcryptjs';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import AppError from '../errors/AppError.js';
import { findUserByHandle, findUserById } from '../repositories/user.repository.js';
import { signUserToken } from '../utils/jwt.js';

function userDto(user, role = user.role) {
  const result = {
    id: user.id,
    handle: user.handle,
    role,
    displayName: user.display_name,
    email: user.email,
  };

  if (user.description !== null && user.description !== undefined) {
    result.description = user.description;
  }
  if (role === 'applicant') {
    result.studentId = user.student_id;
    result.faculty = user.faculty;
    result.year = user.year;
  }

  return result;
}

function invalidCredentials() {
  return new AppError(
    HTTP_STATUS.UNAUTHORIZED,
    'INVALID_CREDENTIALS',
    'The username or password is incorrect.',
  );
}

function invalidToken() {
  return new AppError(HTTP_STATUS.UNAUTHORIZED, 'INVALID_TOKEN', 'Please sign in again.');
}

export async function signIn({ username, password }) {
  const user = await findUserByHandle(username);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw invalidCredentials();
  }

  return {
    token: signUserToken(user),
    user: userDto(user),
  };
}

export async function getCurrentUser(identity) {
  const user = await findUserById(identity.id);
  if (!user) throw invalidToken();
  return userDto(user, identity.role);
}

export { userDto };
