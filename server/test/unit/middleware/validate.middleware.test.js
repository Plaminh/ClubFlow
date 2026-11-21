import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { validate } from '../../../src/middleware/validate.middleware.js';
import { errorHandler } from '../../../src/middleware/errorHandler.js';

// A small app with the real validate() and the real error handler, so the answers are the ones
// every endpoint will give.
function appWith(schemas) {
  const app = express();
  app.use(express.json());
  app.post('/things/:thingId', validate(schemas), (req, res) => {
    res.json(req.validated);
  });
  app.use(errorHandler);
  return app;
}

const thingSchemas = {
  params: z.object({ thingId: z.string().regex(/^T\d+$/, 'Unknown thing id.') }),
  query: z.object({ page: z.coerce.number().int().min(1).optional() }),
  body: z.object({
    name: z.string().trim().min(1, 'Name is required.'),
    quota: z.number().int().min(1, 'Quota must be at least 1.'),
    rows: z.array(z.object({ label: z.string().min(1, 'Label is required.') })).optional(),
  }),
};

describe('validate() middleware', () => {
  it('passes parsed values on and drops body fields the schema does not list', async () => {
    const response = await request(appWith(thingSchemas))
      .post('/things/T7?page=2')
      .send({ name: '  Content  ', quota: 2, role: 'executive' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      params: { thingId: 'T7' },
      query: { page: 2 },
      body: { name: 'Content', quota: 2 },
    });
  });

  it('answers 400 VALIDATION_ERROR with one message per body field', async () => {
    const response = await request(appWith(thingSchemas))
      .post('/things/T7')
      .send({ name: '   ', quota: 0 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Some fields are invalid.',
      code: 'VALIDATION_ERROR',
      fieldErrors: { name: 'Name is required.', quota: 'Quota must be at least 1.' },
    });
  });

  it('keys a nested field by its dotted path', async () => {
    const response = await request(appWith(thingSchemas))
      .post('/things/T7')
      .send({ name: 'Content', quota: 1, rows: [{ label: 'ok' }, { label: '' }] });

    expect(response.status).toBe(400);
    expect(response.body.fieldErrors).toEqual({ 'rows.1.label': 'Label is required.' });
  });

  it('refuses a value of the wrong type instead of passing it on', async () => {
    const response = await request(appWith(thingSchemas))
      .post('/things/T7')
      .send({ name: ['Content'], quota: '2; DROP TABLE users' });

    expect(response.status).toBe(400);
    expect(Object.keys(response.body.fieldErrors).sort()).toEqual(['name', 'quota']);
  });

  it('answers 400 INVALID_QUERY for a bad query value and VALIDATION_ERROR for a bad path value', async () => {
    const badQuery = await request(appWith(thingSchemas))
      .post('/things/T7?page=0')
      .send({ name: 'Content', quota: 1 });
    expect(badQuery.status).toBe(400);
    expect(badQuery.body.code).toBe('INVALID_QUERY');
    expect(badQuery.body.fieldErrors).toHaveProperty('page');

    const badPath = await request(appWith(thingSchemas))
      .post("/things/' OR '1'='1")
      .send({ name: 'Content', quota: 1 });
    expect(badPath.status).toBe(400);
    expect(badPath.body.code).toBe('VALIDATION_ERROR');
    expect(badPath.body.fieldErrors).toEqual({ thingId: 'Unknown thing id.' });
  });

  it('treats a missing body as an empty object, so required fields are reported', async () => {
    const response = await request(appWith(thingSchemas)).post('/things/T7');

    expect(response.status).toBe(400);
    expect(Object.keys(response.body.fieldErrors).sort()).toEqual(['name', 'quota']);
  });
});
