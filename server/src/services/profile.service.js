import { HTTP_STATUS } from '../constants/httpStatus.js';
import AppError from '../errors/AppError.js';
import { findUserById, updateUserProfile } from '../repositories/user.repository.js';

function profileDto(user, role) {
  const profile = {
    id: user.id,
    role,
    displayName: user.display_name,
    email: user.email,
  };

  if (role === 'applicant') {
    profile.studentId = user.student_id;
    profile.faculty = user.faculty;
    profile.year = user.year;
  }

  return profile;
}

function invalidToken() {
  return new AppError(HTTP_STATUS.UNAUTHORIZED, 'INVALID_TOKEN', 'Please sign in again.');
}

export async function getProfile(identity) {
  const user = await findUserById(identity.id);
  if (!user) throw invalidToken();
  return profileDto(user, identity.role);
}

export async function updateProfile(identity, changes) {
  let user;
  try {
    user = await updateUserProfile(identity.id, changes);
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        'EMAIL_ALREADY_USED',
        'This email address is already in use.',
      );
    }
    throw error;
  }

  if (!user) throw invalidToken();
  return profileDto(user, identity.role);
}
