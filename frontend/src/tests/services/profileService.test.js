import { describe, expect, it } from 'vitest';
import { DEMO_PASSWORD } from '../../mocks/auth.js';
import { ACCOUNTS } from '../../mocks/fixtures.js';
import { setSessionAccountId, setSimulation } from '../../mocks/store.js';
import * as applicationService from '../../services/applicationService.js';
import * as authService from '../../services/authService.js';
import * as demoSessionService from '../../services/demoSessionService.js';
import * as portalService from '../../services/portalService.js';
import * as profileService from '../../services/profileService.js';

const signInByEmail = (email) => authService.signIn({ email, password: DEMO_PASSWORD });

describe('profileService (simulated profile)', () => {
  it('requires a signed-in account', async () => {
    await expect(profileService.getProfile()).rejects.toMatchObject({ kind: 'forbidden' });
    await expect(profileService.updateProfile({ displayName: 'A', email: 'a@demo.example' })).rejects.toMatchObject({
      kind: 'forbidden',
    });
  });

  it.each(['exec-recruitment', 'ap-minhanh', 'iv-hamy'])('returns the profile of %s', async (id) => {
    await demoSessionService.signIn(id);

    const fixture = ACCOUNTS.find((account) => account.id === id);
    expect(await profileService.getProfile()).toMatchObject({ id, role: fixture.role, email: fixture.email });
  });

  it('updates only display name and email; identity and student fields stay read-only', async () => {
    await demoSessionService.signIn('ap-minhanh');
    const before = await profileService.getProfile();

    const updated = await profileService.updateProfile({
      displayName: '  Minh Anh Mới ',
      email: ' New.Mail@Demo.Example ',
      id: 'exec-recruitment',
      role: 'executive',
      studentId: 'HACKED',
      faculty: 'X',
      year: 'Y',
    });

    expect(updated).toEqual({ ...before, displayName: 'Minh Anh Mới', email: 'new.mail@demo.example' });
    expect(await profileService.getProfile()).toEqual(updated);
  });

  it.each([
    [{ displayName: ' ', email: 'ok@demo.example' }, 'displayName'],
    [{ displayName: 'Tên', email: '' }, 'email'],
    [{ displayName: 'Tên', email: 'not-an-email' }, 'email'],
  ])('rejects invalid input %o', async (input, field) => {
    await demoSessionService.signIn('ap-minhanh');

    const error = await profileService.updateProfile(input).catch((caught) => caught);

    expect(error.kind).toBe('validation');
    expect(error.fieldErrors[field]).toBeTruthy();
    expect(await profileService.getProfile()).toMatchObject({ displayName: 'Nguyễn Minh Anh', email: 'minh.anh@demo.example' });
  });

  it('rejects an email that belongs to another demo account, but allows keeping your own', async () => {
    await demoSessionService.signIn('ap-minhanh');

    const error = await profileService
      .updateProfile({ displayName: 'Nguyễn Minh Anh', email: 'HA.MY@clubflow.demo.example' })
      .catch((caught) => caught);
    expect(error.kind).toBe('validation');
    expect(error.fieldErrors.email).toMatch(/tài khoản demo khác/);

    await expect(
      profileService.updateProfile({ displayName: 'Minh Anh', email: 'minh.anh@demo.example' }),
    ).resolves.toMatchObject({ displayName: 'Minh Anh' });
  });

  it('restores the same account when signing in again with the changed email', async () => {
    await signInByEmail('minh.anh@demo.example');
    await profileService.updateProfile({ displayName: 'Nguyễn Minh Anh', email: 'anh.moi@demo.example' });
    await authService.signOut();

    await expect(signInByEmail('minh.anh@demo.example')).rejects.toMatchObject({ kind: 'forbidden' });
    const restored = await signInByEmail('anh.moi@demo.example');

    expect(restored).toMatchObject({ id: 'ap-minhanh', email: 'anh.moi@demo.example' });
    const examples = await authService.listDemoCredentials();
    expect(examples.find((item) => item.role === 'applicant').email).toBe('anh.moi@demo.example');
  });

  it('keeps profile changes isolated to the edited account', async () => {
    await demoSessionService.signIn('ap-minhanh');
    await profileService.updateProfile({ displayName: 'Tên Đã Đổi', email: 'doi@demo.example' });

    await demoSessionService.signIn('ap-quocbao');

    const other = ACCOUNTS.find((account) => account.id === 'ap-quocbao');
    expect(await profileService.getProfile()).toMatchObject({ id: 'ap-quocbao', displayName: other.displayName, email: other.email });
  });

  // Race conditions. Deterministic: the context change happens synchronously
  // after the save starts, i.e. while its simulated request is still pending.
  const EDIT = { displayName: 'Ghi Nhầm', email: 'ghi.nham@demo.example' };
  const untouched = async () => {
    const accounts = await demoSessionService.listAccounts();
    expect(accounts).toEqual(ACCOUNTS);
  };

  it('cancels an in-flight save when the account is switched, leaving every profile untouched', async () => {
    await demoSessionService.signIn('ap-minhanh');
    const pending = profileService.updateProfile(EDIT);
    setSessionAccountId('ap-quocbao');

    await expect(pending).rejects.toMatchObject({ kind: 'conflict' });
    await untouched();
  });

  it('cancels an in-flight save when the account is switched away and back again', async () => {
    await demoSessionService.signIn('ap-minhanh');
    const pending = profileService.updateProfile(EDIT);
    setSessionAccountId('ap-quocbao');
    setSessionAccountId('ap-minhanh');

    await expect(pending).rejects.toMatchObject({ kind: 'conflict' });
    await untouched();
  });

  it('cancels an in-flight save when the user signs out', async () => {
    await demoSessionService.signIn('ap-minhanh');
    const pending = profileService.updateProfile(EDIT);
    await authService.signOut();

    await expect(pending).rejects.toMatchObject({ kind: 'conflict' });
    await untouched();
  });

  it.each([
    ['the scenario is switched', () => demoSessionService.setScenario('confirmed')],
    ['demo data is reset', () => demoSessionService.resetDemoData()],
  ])('cancels an in-flight save when %s, so the fresh fixtures are not modified', async (_label, change) => {
    await demoSessionService.signIn('ap-minhanh');
    const pending = profileService.updateProfile(EDIT);
    change();

    await expect(pending).rejects.toMatchObject({ kind: 'conflict' });
    await untouched();
  });

  it('applies two overlapping saves in order to the same account only', async () => {
    await demoSessionService.signIn('ap-minhanh');
    const first = profileService.updateProfile({ displayName: 'Lần Một', email: 'lan.mot@demo.example' });
    const second = profileService.updateProfile({ displayName: 'Lần Hai', email: 'lan.hai@demo.example' });

    await expect(first).resolves.toMatchObject({ id: 'ap-minhanh', displayName: 'Lần Một' });
    await expect(second).resolves.toMatchObject({ id: 'ap-minhanh', displayName: 'Lần Hai' });
    const accounts = await demoSessionService.listAccounts();
    expect(accounts.filter((account) => account.displayName.startsWith('Lần'))).toHaveLength(1);
    expect(accounts.find((account) => account.id === 'ap-minhanh').email).toBe('lan.hai@demo.example');
  });

  it('does not mutate anything when the simulated network fails, and succeeds on retry', async () => {
    await demoSessionService.signIn('ap-minhanh');
    setSimulation('error');
    await expect(profileService.updateProfile(EDIT)).rejects.toMatchObject({ kind: 'network' });
    await untouched();

    setSimulation('normal');
    await expect(profileService.updateProfile(EDIT)).resolves.toMatchObject({ id: 'ap-minhanh', ...EDIT });
  });

  it('restores fixture profiles and the original sign-in email on scenario switch and demo reset', async () => {
    await signInByEmail('minh.anh@demo.example');
    await profileService.updateProfile({ displayName: 'Tên Đã Đổi', email: 'doi@demo.example' });

    demoSessionService.resetDemoData();
    expect(await profileService.getProfile()).toMatchObject({ displayName: 'Nguyễn Minh Anh', email: 'minh.anh@demo.example' });

    await profileService.updateProfile({ displayName: 'Tên Đã Đổi', email: 'doi@demo.example' });
    demoSessionService.setScenario('confirmed');
    expect(await profileService.getProfile()).toMatchObject({ displayName: 'Nguyễn Minh Anh', email: 'minh.anh@demo.example' });

    await authService.signOut();
    await expect(signInByEmail('doi@demo.example')).rejects.toMatchObject({ kind: 'forbidden' });
    await expect(signInByEmail('minh.anh@demo.example')).resolves.toMatchObject({ id: 'ap-minhanh' });
  });

  it('does not change the snapshot of an application that was already submitted', async () => {
    demoSessionService.setScenario('confirmed');
    await demoSessionService.signIn('ap-minhanh');
    const mineBefore = await portalService.listMyApplications();
    await demoSessionService.signIn('exec-recruitment');
    const detailBefore = await applicationService.get(mineBefore[0].id);

    await demoSessionService.signIn('ap-minhanh');
    await profileService.updateProfile({ displayName: 'Tên Đã Đổi', email: 'doi@demo.example' });

    expect(await portalService.listMyApplications()).toEqual(mineBefore);
    await demoSessionService.signIn('exec-recruitment');
    const detailAfter = await applicationService.get(mineBefore[0].id);
    expect(detailAfter.student).toEqual(detailBefore.student);
    expect(detailAfter.student.name).toBe('Nguyễn Minh Anh');
    expect(detailAfter.applicantName).toBe('Nguyễn Minh Anh');
  });
});
