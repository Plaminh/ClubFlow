import { HTTP_STATUS } from '../constants/httpStatus.js';
import {
  getProfile as readProfile,
  updateProfile as saveProfile,
} from '../services/profile.service.js';

export async function getProfile(req, res) {
  const profile = await readProfile(req.user);
  res.status(HTTP_STATUS.OK).json(profile);
}

export async function updateProfile(req, res) {
  const profile = await saveProfile(req.user, req.validated.body);
  res.status(HTTP_STATUS.OK).json(profile);
}
