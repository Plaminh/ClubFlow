import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppRoutes from '../../routes/AppRoutes.jsx';
import { ROUTES } from '../../routes/paths.js';
import { getHealth } from '../../services/healthService.js';

vi.mock('../../services/healthService.js', () => ({
  getHealth: vi.fn(),
}));

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe('AppRoutes', () => {
  beforeEach(() => {
    getHealth.mockResolvedValue({ status: 'ok' });
  });

  it.each([
    [ROUTES.EXECUTIVE_CAMPAIGN, 'Quản lý chiến dịch'],
    [ROUTES.EXECUTIVE_REVIEW, 'Duyệt hồ sơ'],
    [`${ROUTES.EXECUTIVE_REVIEW}?tab=results`, 'Duyệt hồ sơ'],
    [ROUTES.EXECUTIVE_SCHEDULING, 'Xếp lịch phỏng vấn'],
    [ROUTES.INTERVIEWER, 'Không gian người phỏng vấn'],
  ])('renders the temporary %s screen', (path, title) => {
    renderAt(path);

    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText(/Trang tạm thời \(UI-1\.1\)/)).toBeInTheDocument();
  });

  it('renders the applicant portal entry at "/" and keeps the API health check', async () => {
    renderAt(`${ROUTES.HOME}?tab=apply`);

    expect(screen.getByRole('heading', { level: 1, name: 'Cổng ứng viên' })).toBeInTheDocument();
    expect(await screen.findByText('API connected')).toBeInTheDocument();
    expect(getHealth).toHaveBeenCalledTimes(1);
  });

  it('shows the API error on "/" when the health check fails', async () => {
    getHealth.mockRejectedValue(new Error('API request failed with status 503'));

    renderAt(ROUTES.HOME);

    expect(await screen.findByText('API unavailable')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('API request failed with status 503');
  });

  it('shows a not-found state with a link home for unknown paths', () => {
    renderAt('/executive/unknown-page');

    expect(screen.getByRole('heading', { level: 1, name: 'Không tìm thấy trang' })).toBeInTheDocument();
    expect(screen.getByText(/"\/executive\/unknown-page"/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về trang chủ' })).toHaveAttribute('href', ROUTES.HOME);
  });

  it('does not treat a tab name as its own route', () => {
    renderAt('/executive/review/results');

    expect(screen.getByRole('heading', { level: 1, name: 'Không tìm thấy trang' })).toBeInTheDocument();
  });
});
