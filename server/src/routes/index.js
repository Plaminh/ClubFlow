import { Router } from 'express';
import healthRouter from './health.routes.js';

// Mounts one router per screen area and nothing else: no endpoint, check or SQL lives here.
// Each owner adds their own file and one line below (specs/003-pa4-express-server/tasks.md):
//   Nguyệt: auth.routes.js, applicant.routes.js, interviewer.routes.js, notification.routes.js
//   Hoàng:  campaign.routes.js, review.routes.js, schedule.routes.js, result.routes.js
// Inside a router, protect endpoints with authenticate and requireRole
// (middleware/auth.middleware.js) and check input with validate() (middleware/validate.middleware.js).
const router = Router();

router.use('/health', healthRouter);

export default router;
