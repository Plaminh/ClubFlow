import { cleanup, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ROUTES } from '../../routes/paths.js';
import { getHealth } from '../../services/healthService.js';
import { setMockApiMode } from '../helpers/mockApi.js';
import { EXECUTIVE, renderApp, submitSignIn } from '../helpers/renderApp.jsx';

describe('AppRoutes', () => {
  beforeEach(() => {
    getHealth.mockResolvedValue({ status: 'ok' });
  });

  it.each([
    [ROUTES.EXECUTIVE_CAMPAIGN, 'Create Recruitment Campaign', EXECUTIVE],
    [ROUTES.EXECUTIVE_REVIEW, 'Application Review', EXECUTIVE],
    [`${ROUTES.EXECUTIVE_REVIEW}?tab=results`, 'Application Review', EXECUTIVE],
    [ROUTES.EXECUTIVE_SCHEDULING, 'Interview Scheduling', EXECUTIVE],
    [ROUTES.INTERVIEWER, 'Interviewer Workspace', 'iv-giahuy'],
    [`${ROUTES.HOME}?tab=apply`, 'Applicant Portal', undefined],
    [ROUTES.LOGIN, 'Đăng nhập', undefined],
    [ROUTES.PROFILE, 'Hồ sơ cá nhân', 'ap-minhanh'],
  ])('renders %s inside the app shell with exactly one h1', async (path, title, accountId) => {
    renderApp(path, { accountId });

    await screen.findByRole('heading', { level: 1, name: title });
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it.each([
    ROUTES.PROFILE,
    ROUTES.EXECUTIVE_CAMPAIGN,
    ROUTES.EXECUTIVE_REVIEW,
    ROUTES.EXECUTIVE_SCHEDULING,
    ROUTES.INTERVIEWER,
  ])('redirects a guest from protected %s to Sign In', async (path) => {
    renderApp(path);

    await screen.findByRole('heading', { level: 1, name: 'Đăng nhập' });
    expect(screen.getByLabelText('Tên đăng nhập')).toBeInTheDocument();
  });

  it('returns a guest to the intended protected route after signing in with a role that may open it', async () => {
    renderApp(`${ROUTES.EXECUTIVE_REVIEW}?tab=results`);

    await submitSignIn('exec');

    await screen.findByRole('heading', { level: 1, name: 'Application Review' });
    expect(screen.getByRole('tab', { name: /Final Results/, selected: true })).toBeInTheDocument();
  });

  it('ignores an intended route the signed-in role may not open and uses the role home instead', async () => {
    renderApp(ROUTES.EXECUTIVE_CAMPAIGN);

    await submitSignIn('int-content');

    await screen.findByRole('heading', { level: 1, name: 'Interviewer Workspace' });
  });

  it.each([
    ['ap-minhanh', 'Applicant Portal'],
    [EXECUTIVE, 'Create Recruitment Campaign'],
    ['iv-giahuy', 'Interviewer Workspace'],
  ])('sends signed-in %s away from /login to the role home', async (accountId, title) => {
    renderApp(ROUTES.LOGIN, { accountId });

    await screen.findByRole('heading', { level: 1, name: title });
    expect(screen.queryByLabelText('Mật khẩu')).not.toBeInTheDocument();
  });

  it('keeps the API health check in the shell footer', async () => {
    renderApp(ROUTES.INTERVIEWER);

    expect(await screen.findByText('API connected')).toBeInTheDocument();
  });

  it('clears an invalid stored token before redirecting a protected reload to Sign In', async () => {
    window.sessionStorage.setItem('clubflow.demoSession', JSON.stringify({ token: 'invalid-token' }));

    renderApp(ROUTES.PROFILE);

    await screen.findByRole('heading', { level: 1, name: 'Đăng nhập' });
    expect(JSON.parse(window.sessionStorage.getItem('clubflow.demoSession')).token).toBeNull();
  });

  it('keeps a saved session through a server error on reload and shows Retry instead of signing out', async () => {
    window.sessionStorage.setItem('clubflow.demoSession', JSON.stringify({ token: 'invalid-token', user: { id: 'x', role: 'executive' } }));
    renderApp(ROUTES.PROFILE);
    // 401 still ends a session even when a user snapshot exists.
    await screen.findByRole('heading', { level: 1, name: 'Đăng nhập' });
    cleanup();

    setMockApiMode('error');
    renderApp(ROUTES.EXECUTIVE_CAMPAIGN, { accountId: EXECUTIVE, scenarioId: 'draft' });
    expect(await screen.findByRole('heading', { level: 1, name: 'Create Recruitment Campaign' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Thử lại/ })).toBeInTheDocument();
    expect(JSON.parse(window.sessionStorage.getItem('clubflow.demoSession')).token).toBe('mock-token-exec');
  });

  it('shows the API error state when the health check fails', async () => {
    getHealth.mockRejectedValue(new Error('API request failed with status 503'));

    renderApp(ROUTES.INTERVIEWER);

    expect(await screen.findByText('API unavailable')).toBeInTheDocument();
  });

  it('shows a not-found state with a link home for unknown paths', async () => {
    renderApp('/executive/unknown-page');

    await screen.findByRole('heading', { level: 1, name: 'Không tìm thấy trang' });
    expect(screen.getByText(/"\/executive\/unknown-page"/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về trang chủ' })).toHaveAttribute('href', ROUTES.HOME);
  });

  it('does not treat a tab name as its own route', async () => {
    renderApp('/executive/review/results');

    await screen.findByRole('heading', { level: 1, name: 'Không tìm thấy trang' });
  });
});
