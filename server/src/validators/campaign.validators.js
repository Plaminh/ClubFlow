import { z } from 'zod';

// docs/api/07-campaign-management.md, Campaign Write Fields. These schemas check type and length
// whenever a value is sent; a draft may leave fields empty, and publish checks completeness
// (campaign.service.js). An empty or blank string is stored as missing (null).
const text = (max) =>
  z
    .string()
    .trim()
    .max(max, `Must be at most ${max} characters.`)
    .transform((value) => value || null)
    .nullable()
    .optional();

const date = z.iso.date('Must be a date written YYYY-MM-DD.');
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be a time written HH:MM.');
const id = z.string().min(1).max(64);

const positionInput = z.object({
  id: id.optional(),
  departmentName: z.string().trim().min(1, 'Department is required.').max(120),
  name: z.string().trim().min(1, 'Name is required.').max(120),
  quota: z.number().int('Must be a whole number.').min(0).nullable().optional(),
  description: text(2000),
  requirements: text(2000),
});

const campaignFields = {
  name: text(120),
  hostClub: text(120),
  description: text(4000),
  instructions: text(2000),
  opensOn: date.nullable().optional(),
  closesOn: date.nullable().optional(),
  positions: z.array(positionInput).max(50).optional(),
};

const interviewFields = {
  interviewDate: date,
  interviewWindow: z
    .object({ start: time, end: time }, { error: 'Must be a start and an end time.' })
    .refine(({ start, end }) => start < end, 'Start must be before end.'),
  slotMinutes: z.union([z.literal(15), z.literal(20), z.literal(30)], {
    error: 'Must be 15, 20 or 30.',
  }),
};

export const campaignParams = z.object({ campaignId: id });
export const positionParams = z.object({ campaignId: id, positionId: id });

export const createCampaignBody = z.object({ ...campaignFields, ...interviewFields });

export const updateCampaignBody = z.object({
  ...campaignFields,
  interviewDate: interviewFields.interviewDate.optional(),
  interviewWindow: interviewFields.interviewWindow.optional(),
  slotMinutes: interviewFields.slotMinutes.optional(),
});
