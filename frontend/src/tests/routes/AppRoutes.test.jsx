import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ROUTES } from '../../routes/paths.js';
import { getHealth } from '../../services/healthService.js';
import { renderApp } from '../helpers/renderApp.jsx';

describe('AppRoutes', () => {
  beforeEach(() => {
    getHealth.mockResolvedValue({ status: 'ok' });
  });

  it.each([
    [ROUTES.EXECUTIVE_CAMPAIGN, 'Create Recruitment Campaign'],
    [ROUTES.EXECUTIVE_REVIEW, 'Application Review'],
    [`${ROUTES.EXECUTIVE_REVIEW}?tab=results`, 'Application Review'],
    [ROUTES.EXECUTIVE_SCHEDULING, 'Interview Scheduling'],
    [ROUTES.INTERVIEWER, 'Interviewer Workspace'],
    [`${ROUTES.HOME}?tab=apply`, 'Applicant Portal'],
  ])('renders %s inside the app shell with exactly one h1', async (path, title) => {
    renderApp(path);

    await screen.findByRole('heading', { level: 1, name: title });
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('keeps the API health check in the shell footer', async () => {
    renderApp(ROUTES.INTERVIEWER);

    expect(await screen.findByText('API connected')).toBeInTheDocument();
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
