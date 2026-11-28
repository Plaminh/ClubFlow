import { Router } from 'express';
import { login, getCurrentUser, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginBody } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', validate({ body: loginBody }), asyncHandler(login));
router.get('/me', authenticate, asyncHandler(getCurrentUser));
router.post('/logout', authenticate, asyncHandler(logout));

export default router;
