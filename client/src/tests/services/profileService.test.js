import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setAuthTokenProvider } from '../../services/apiClient.js';
import * as profileService from '../../services/profileService.js';

describe('profileService HTTP adapter', () => {
  beforeEach(() => setAuthTokenProvider(() => 'mock-token-studentA'));
  afterEach(() => setAuthTokenProvider(null));

  it('loads only the bearer token owner profile', async () => {
    await expect(profileService.getProfile()).resolves.toMatchObject({ id: 'ap-minhanh', role: 'applicant', studentId: '26DEMO0142' });
  });

  it('sends only normalized editable fields', async () => {
    const updated = await profileService.updateProfile({
      displayName: '  Minh Anh Updated ',
      email: ' New.Mail@Demo.Example ',
      id: 'exec-recruitment',
      role: 'executive',
      studentId: 'HACKED',
    });
    expect(updated).toMatchObject({ id: 'ap-minhanh', role: 'applicant', displayName: 'Minh Anh Updated', email: 'new.mail@demo.example', studentId: '26DEMO0142' });
    await expect(profileService.getProfile()).resolves.toEqual(updated);
  });

  it('passes backend field errors and conflict codes through', async () => {
    await expect(profileService.updateProfile({ displayName: '', email: 'invalid' })).rejects.toMatchObject({
      kind: 'validation',
      code: 'VALIDATION_ERROR',
      fieldErrors: { displayName: expect.any(String), email: expect.any(String) },
    });
    await expect(profileService.updateProfile({ displayName: 'Minh Anh', email: 'quoc.bao@demo.example' })).rejects.toMatchObject({
      kind: 'conflict',
      code: 'EMAIL_ALREADY_USED',
      fieldErrors: { email: expect.any(String) },
    });
  });

  it('requires authentication', async () => {
    setAuthTokenProvider(null);
    await expect(profileService.getProfile()).rejects.toMatchObject({ kind: 'forbidden', code: 'INVALID_TOKEN' });
  });
});
