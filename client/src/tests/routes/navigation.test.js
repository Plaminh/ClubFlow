import { describe, expect, it } from 'vitest';
import { canAccessProtectedPath, postSignInDestination } from '../../routes/navigation.js';

describe('post-sign-in destination (role-safe)', () => {
  it.each([
    ['executive', '/executive/campaign'],
    ['applicant', '/'],
    ['interviewer', '/interviewer'],
  ])('sends %s to the role home when there is no intended destination', (role, home) => {
    expect(postSignInDestination(role, undefined)).toBe(home);
    expect(postSignInDestination(role, null)).toBe(home);
    expect(postSignInDestination(role, {})).toBe(home);
  });

  it('restores an intended destination the role may open, with its query string', () => {
    expect(
      postSignInDestination('executive', { pathname: '/executive/review', search: '?tab=results' }),
    ).toBe('/executive/review?tab=results');
    expect(postSignInDestination('applicant', { pathname: '/', search: '?tab=apply' })).toBe(
      '/?tab=apply',
    );
    expect(postSignInDestination('interviewer', { pathname: '/profile' })).toBe('/profile');
  });

  it.each([
    ['applicant', '/executive/campaign', '/'],
    ['interviewer', '/executive/review', '/interviewer'],
    ['executive', '/interviewer', '/executive/campaign'],
    ['executive', '/', '/executive/campaign'],
  ])('ignores %s -> %s (forbidden for the role) and uses the role home', (role, pathname, home) => {
    expect(postSignInDestination(role, { pathname })).toBe(home);
  });

  it.each([
    '/login',
    '/unknown',
    '//evil.example',
    'https://evil.example/profile',
    '/profile/../executive/campaign',
  ])('ignores the unknown or external destination %s', (pathname) => {
    expect(postSignInDestination('applicant', { pathname })).toBe('/');
    expect(canAccessProtectedPath('applicant', pathname)).toBe(false);
  });

  it('grants nothing to visitors or unknown roles', () => {
    expect(canAccessProtectedPath('visitor', '/profile')).toBe(false);
    expect(canAccessProtectedPath('admin', '/profile')).toBe(false);
    expect(postSignInDestination('admin', { pathname: '/profile' })).toBe('/');
  });
});
