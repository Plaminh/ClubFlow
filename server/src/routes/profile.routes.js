import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { updateProfileBody } from '../validators/auth.validator.js';

const router = Router();

router.get('/profile', authenticate, asyncHandler(getProfile));
router.patch(
  '/profile',
  authenticate,
  validate({ body: updateProfileBody }),
  asyncHandler(updateProfile),
);

export default router;
