import { describe, expect, it } from 'vitest';
import { DEMO_PASSWORD } from '../../mocks/auth.js';
import { getSessionAccountId, loadScenario, setSimulation } from '../../mocks/store.js';
import * as authService from '../../services/authService.js';

describe('authService (simulated sign-in)', () => {
  it.each([
    ['executive@clubflow.demo.example', 'exec-recruitment', 'executive'],
    ['minh.anh@demo.example', 'ap-minhanh', 'applicant'],
    ['ha.my@clubflow.demo.example', 'iv-hamy', 'interviewer'],
  ])('signs %s in as %s', async (email, id, role) => {
    const user = await authService.signIn({ email, password: DEMO_PASSWORD });

    expect(user).toMatchObject({ id, role, email });
    expect(getSessionAccountId()).toBe(id);
    expect(await authService.getCurrentUser()).toMatchObject({ id });
  });

  it('ignores email case and surrounding spaces', async () => {
    const user = await authService.signIn({ email: '  Minh.Anh@Demo.Example ', password: DEMO_PASSWORD });

    expect(user.id).toBe('ap-minhanh');
  });

  it.each([
    [{ email: 'minh.anh@demo.example', password: 'wrong' }],
    [{ email: 'nobody@demo.example', password: DEMO_PASSWORD }],
    [{ email: '', password: '' }],
    [{}],
  ])('rejects invalid credentials %o without starting a session', async (credentials) => {
    await expect(authService.signIn(credentials)).rejects.toMatchObject({ kind: 'forbidden' });
    expect(getSessionAccountId()).toBeNull();
  });

  it('rejects the old signIn(accountId) call shape instead of treating an id as credentials', async () => {
    await expect(authService.signIn('ap-minhanh')).rejects.toThrow(/expects \{ email, password \}/);
    expect(getSessionAccountId()).toBeNull();
  });

  it('never returns the password with the user and reports the simulated network failure', async () => {
    const user = await authService.signIn({ email: 'minh.anh@demo.example', password: DEMO_PASSWORD });
    expect(JSON.stringify(user)).not.toContain(DEMO_PASSWORD);

    await authService.signOut();
    setSimulation('error');
    await expect(authService.signIn({ email: 'minh.anh@demo.example', password: DEMO_PASSWORD })).rejects.toMatchObject({
      kind: 'network',
    });
    expect(getSessionAccountId()).toBeNull();
  });

  it('signs out and reports no current user', async () => {
    await authService.signIn({ email: 'minh.anh@demo.example', password: DEMO_PASSWORD });

    await authService.signOut();

    expect(getSessionAccountId()).toBeNull();
    expect(await authService.getCurrentUser()).toBeNull();
  });

  it('lists one fictional example login per role', async () => {
    const examples = await authService.listDemoCredentials();

    expect(examples.map((item) => item.role).sort()).toEqual(['applicant', 'executive', 'interviewer']);
    for (const example of examples) {
      expect(example.email).toMatch(/demo\.example$/);
      await expect(authService.signIn({ email: example.email, password: example.password })).resolves.toMatchObject({
        role: example.role,
      });
    }
  });

  it('cancels a sign-in that is still in flight when the scenario is replaced', async () => {
    const pending = authService.signIn({ email: 'minh.anh@demo.example', password: DEMO_PASSWORD });
    loadScenario('confirmed');

    await expect(pending).rejects.toMatchObject({ kind: 'conflict' });
    expect(getSessionAccountId()).toBeNull();
  });
});
