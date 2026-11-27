import { HTTP_STATUS } from '../constants/httpStatus.js';
import * as campaignService from '../services/campaign.service.js';

export async function getCampaign(req, res) {
  const view = await campaignService.getCampaign(req.validated.params.campaignId);
  res.status(HTTP_STATUS.OK).json(view);
}

export async function createCampaign(req, res) {
  const view = await campaignService.createCampaign(req.validated.body);
  res.status(HTTP_STATUS.CREATED).json(view);
}

export async function updateCampaign(req, res) {
  const view = await campaignService.updateCampaign(
    req.validated.params.campaignId,
    req.validated.body,
  );
  res.status(HTTP_STATUS.OK).json(view);
}

export async function deletePosition(req, res) {
  const { campaignId, positionId } = req.validated.params;
  const view = await campaignService.deletePosition(campaignId, positionId);
  res.status(HTTP_STATUS.OK).json(view);
}

export async function publishCampaign(req, res) {
  const view = await campaignService.publishCampaign(req.validated.params.campaignId);
  res.status(HTTP_STATUS.OK).json(view);
}
