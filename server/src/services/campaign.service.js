import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { withTransaction } from '../db/transaction.js';
import AppError from '../errors/AppError.js';
import * as campaigns from '../repositories/campaign.repository.js';

// docs/api/07-campaign-management.md (C3). "Today" is env.appToday, never the machine clock.

const REQUIRED_TO_PUBLISH = [
  'name',
  'hostClub',
  'description',
  'instructions',
  'opensOn',
  'closesOn',
];
const INTERVIEW_FIELDS = ['interviewDate', 'interviewWindow', 'slotMinutes'];

const campaignNotFound = () =>
  new AppError(HTTP_STATUS.NOT_FOUND, 'CAMPAIGN_NOT_FOUND', 'Campaign not found.');

function refuseFields(fieldErrors, message = 'Some fields are invalid.') {
  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR', message, { fieldErrors });
  }
}

function phaseOf(campaign) {
  if (campaign.status === 'draft') return 'draft';
  if (campaign.applicationsClosedAt || campaign.closesOn < env.appToday) return 'closed';
  if (campaign.opensOn > env.appToday) return 'before-open';
  return 'open';
}

// One slot per whole hour of the interview window, as the PA#3 mock made them.
function slotsOf({ interviewDate, interviewWindow }) {
  const slots = [];
  const endHour = Number(interviewWindow.end.slice(0, 2));
  for (let hour = Number(interviewWindow.start.slice(0, 2)); hour < endHour; hour += 1) {
    const start = String(hour).padStart(2, '0');
    const end = String(hour + 1).padStart(2, '0');
    slots.push({
      id: `slot-${start}00`,
      start: `${interviewDate}T${start}:00:00+07:00`,
      end: `${interviewDate}T${end}:00:00+07:00`,
    });
  }
  return slots;
}

async function viewOf(campaign, db) {
  const positions = await campaigns.findPositions(campaign.id, db);
  return {
    campaign,
    phase: phaseOf(campaign),
    // shortcut: applications (migration 050, T044) do not exist yet, so every count is 0; count them then.
    positions: positions.map((position) => ({ ...position, applicationCount: 0 })),
    slots: slotsOf(campaign),
    // shortcut: interviewers, rooms and assignments come with migration 040 (T051) and the
    // first-application lock with 050 (T044); empty and unlocked until then.
    interviewSetup: {
      interviewers: [],
      rooms: [],
      assignments: [],
      roomIds: [],
      locked: false,
      lockReason: null,
    },
    // shortcut: schedule confirmation (T055) is not stored yet, so no campaign is locked.
    locked: false,
    lockReason: null,
  };
}

// Campaign fields a published campaign must have, in order (R1).
function campaignErrors(campaign) {
  const errors = {};
  for (const field of REQUIRED_TO_PUBLISH) {
    if (!campaign[field]) errors[field] = 'Required to publish.';
  }
  if (campaign.opensOn && campaign.closesOn && campaign.closesOn < campaign.opensOn) {
    errors.closesOn = 'The closing date must not be before the opening date.';
  }
  if (campaign.closesOn && campaign.closesOn >= campaign.interviewDate) {
    errors.interviewDate = 'The interview date must be after the closing date.';
  }
  const [startHour, startMinute] = campaign.interviewWindow.start.split(':').map(Number);
  const [endHour, endMinute] = campaign.interviewWindow.end.split(':').map(Number);
  if ((endHour - startHour) * 60 + endMinute - startMinute < campaign.slotMinutes) {
    errors.slotMinutes = 'At least one interview must fit in the interview window.';
  }
  return errors;
}

// Position fields a published campaign must have, keyed positions.<index>.<field> (R1).
function positionErrors(positions) {
  const errors = {};
  positions.forEach((position, index) => {
    if (!Number.isInteger(position.quota) || position.quota < 1) {
      errors[`positions.${index}.quota`] = 'Quota must be at least 1.';
    }
    if (!position.description) errors[`positions.${index}.description`] = 'Required to publish.';
    if (!position.requirements) errors[`positions.${index}.requirements`] = 'Required to publish.';
  });
  return errors;
}

// A published campaign is active from opensOn through interviewDate (contract, POST /campaigns).
async function refuseActiveConflict(campaign, db) {
  if (!campaign.opensOn) return;
  const others = await campaigns.findPublishedPeriods(db);
  const overlaps = others.some(
    (other) =>
      other.id !== campaign.id &&
      other.opensOn <= campaign.interviewDate &&
      campaign.opensOn <= other.interviewDate,
  );
  if (overlaps) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      'ACTIVE_CAMPAIGN_CONFLICT',
      'Another published campaign is active on these dates.',
    );
  }
}

function slug(value, fallback) {
  const slugged = value
    .toLowerCase()
    .replaceAll('đ', 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/gu, '')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/(^-|-$)/gu, '');
  return slugged || fallback;
}

// base, or base-2, base-3, … when taken.
async function freeId(table, base, db) {
  const taken = new Set(await campaigns.findIdsStartingWith(table, base, db));
  let id = base;
  for (let n = 2; taken.has(id); n += 1) id = `${base}-${n}`;
  return id;
}

// cmp-<year>-hk1, or hk2, hk3, … when the year already has a campaign.
async function newCampaignId(year, db) {
  const taken = new Set(await campaigns.findIdsStartingWith('campaigns', `cmp-${year}-hk`, db));
  let n = 1;
  while (taken.has(`cmp-${year}-hk${n}`)) n += 1;
  return `cmp-${year}-hk${n}`;
}

// The department with that name, created when it does not exist yet.
async function departmentIdFor(name, db) {
  const existing = await campaigns.findDepartmentByName(name, db);
  if (existing) return existing;
  const id = await freeId('departments', `dep-${slug(name, 'department')}`, db);
  await campaigns.insertDepartment({ id, name }, db);
  return id;
}

// Positions with an id are updated, the others added (ids pos-<campaign year>-<name>).
async function savePositions(campaignId, positions, db) {
  const year = campaignId.split('-')[1];
  for (const position of positions) {
    const departmentId = await departmentIdFor(position.departmentName, db);
    if (position.id) {
      await campaigns.updatePosition({ ...position, departmentId }, db);
    } else {
      const id = await freeId('positions', `pos-${year}-${slug(position.name, 'position')}`, db);
      await campaigns.insertPosition({ ...position, id, campaignId, departmentId }, db);
    }
  }
}

async function lockedCampaign(id, db) {
  if (!(await campaigns.lockCampaign(id, db))) throw campaignNotFound();
  // shortcut: schedule confirmation (T055) is not stored yet, so 409 CAMPAIGN_CONFIRMED cannot
  // happen; refuse it here once it is.
  return campaigns.findCampaign(id, db);
}

export async function getCampaign(id) {
  const campaign = await campaigns.findCampaign(id);
  if (!campaign) throw campaignNotFound();
  return viewOf(campaign);
}

// A draft is saved with whatever it has; publish checks completeness and date order.
export function createCampaign({ positions = [], ...fields }) {
  return withTransaction(async (db) => {
    const id = await newCampaignId((fields.opensOn ?? fields.interviewDate).slice(0, 4), db);
    await campaigns.insertCampaign({ ...fields, id }, db);
    await savePositions(id, positions, db);
    return viewOf(await campaigns.findCampaign(id, db), db);
  });
}

export function updateCampaign(id, { positions: positionInputs = [], ...fields }) {
  return withTransaction(async (db) => {
    const current = await lockedCampaign(id, db);
    const published = current.status === 'published';
    const existing = await campaigns.findPositions(id, db);
    const errors = {};

    if (published) {
      for (const field of INTERVIEW_FIELDS) {
        if (field in fields) errors[field] = 'Change interview settings in the interview setup.';
      }
    }

    const positions = positionInputs.map((input, index) => {
      if (!input.id) return input;
      const stored = existing.find((position) => position.id === input.id);
      if (!stored) {
        errors[`positions.${index}.id`] = 'This campaign has no such position.';
        return input;
      }
      // Published: applications may link to the position, so its name and department stay.
      if (published && input.name !== stored.name) {
        errors[`positions.${index}.name`] = 'A published position keeps its name.';
      }
      if (published && input.departmentName !== stored.departmentName) {
        errors[`positions.${index}.departmentName`] = 'A published position keeps its department.';
      }
      return { ...stored, ...input };
    });

    const campaign = { ...current, ...fields };
    if (published) Object.assign(errors, campaignErrors(campaign), positionErrors(positions));
    refuseFields(errors);

    if (published) {
      await campaigns.lockPublishing(db);
      await refuseActiveConflict(campaign, db);
    }
    await campaigns.updateCampaign(campaign, db);
    await savePositions(id, positions, db);
    return viewOf(await campaigns.findCampaign(id, db), db);
  });
}

export function deletePosition(campaignId, positionId) {
  return withTransaction(async (db) => {
    const campaign = await lockedCampaign(campaignId, db);
    // shortcut: applications (migration 050, T044) do not exist yet, so 409
    // POSITION_HAS_APPLICATIONS cannot happen; refuse a linked position here once they do.
    if (!(await campaigns.deletePosition(campaignId, positionId, db))) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'POSITION_NOT_FOUND', 'Position not found.');
    }
    return viewOf(campaign, db);
  });
}

// R1: a campaign publishes only when it is complete; otherwise it stays a draft.
export function publishCampaign(id) {
  return withTransaction(async (db) => {
    await campaigns.lockPublishing(db);
    const campaign = await lockedCampaign(id, db);
    if (campaign.status === 'published') {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        'CAMPAIGN_ALREADY_PUBLISHED',
        'Campaign is already published.',
      );
    }
    await refuseActiveConflict(campaign, db);

    const positions = await campaigns.findPositions(id, db);
    const errors = { ...campaignErrors(campaign), ...positionErrors(positions) };
    if (positions.length === 0) errors.positions = 'Add at least one position.';
    // shortcut: rooms and interviewer assignments come with migration 040 (T051); until then
    // none can exist, so publish is always refused here. Check the saved setup then.
    errors.roomIds = 'Select at least one room.';
    errors.assignments = 'Every position needs an eligible interviewer.';
    refuseFields(errors, 'The campaign is not complete.');

    await campaigns.markPublished(id, db);
    return viewOf(await campaigns.findCampaign(id, db), db);
  });
}

// docs/api/02-public-applicant.md (Q-03 early close). applicationsClosedAt is the real time of the
// action; every check only asks whether it is null, never compares it with env.appToday.
export function closeApplications(id) {
  return withTransaction(async (db) => {
    const campaign = await lockedCampaign(id, db);
    // shortcut: schedule confirmation (T055) is not stored yet, so 409 CAMPAIGN_LOCKED cannot
    // happen; refuse it here, before the phase check, once it is.
    if (phaseOf(campaign) !== 'open') {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        'CAMPAIGN_NOT_ACCEPTING',
        'Campaign is not accepting applications.',
      );
    }
    await campaigns.markApplicationsClosed(id, db);
    const closed = await campaigns.findCampaign(id, db);
    const phase = phaseOf(closed);
    return {
      campaign: {
        id: closed.id,
        name: closed.name,
        status: closed.status,
        applicationsClosedAt: closed.applicationsClosedAt,
      },
      phase,
      acceptingApplications: phase === 'open',
    };
  });
}
