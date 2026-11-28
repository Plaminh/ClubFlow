import { Router } from 'express';
import * as controller from '../controllers/campaign.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  campaignParams,
  createCampaignBody,
  positionParams,
  updateCampaignBody,
} from '../validators/campaign.validators.js';

// docs/api/07-campaign-management.md. Auth is set per route, not with router.use, so this
// router does not refuse the public GET /api/campaigns/current served by another router.
const executive = [authenticate, requireRole('executive')];

const router = Router();

router.post(
  '/',
  executive,
  validate({ body: createCampaignBody }),
  asyncHandler(controller.createCampaign),
);
router.get(
  '/:campaignId',
  executive,
  validate({ params: campaignParams }),
  asyncHandler(controller.getCampaign),
);
router.patch(
  '/:campaignId',
  executive,
  validate({ params: campaignParams, body: updateCampaignBody }),
  asyncHandler(controller.updateCampaign),
);
router.post(
  '/:campaignId/publish',
  executive,
  validate({ params: campaignParams }),
  asyncHandler(controller.publishCampaign),
);
router.post(
  '/:campaignId/close-applications',
  executive,
  validate({ params: campaignParams }),
  asyncHandler(controller.closeApplications),
);
router.delete(
  '/:campaignId/positions/:positionId',
  executive,
  validate({ params: positionParams }),
  asyncHandler(controller.deletePosition),
);

export default router;
