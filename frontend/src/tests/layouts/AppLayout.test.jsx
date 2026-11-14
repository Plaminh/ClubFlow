import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp, signInAs } from '../helpers/renderApp.jsx';

function navLinks() {
  const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
  return within(nav)
    .getAllByRole('link')
    .map((link) => link.textContent);
}

describe('AppLayout', () => {
  it('shows visitor navigation and a sign-in entry by default', async () => {
    renderApp('/');

    expect(await screen.findByText('Khách (chưa đăng nhập)')).toBeInTheDocument();
    expect(navLinks()).toEqual(['Applicant Portal']);
    expect(screen.getByRole('link', { name: 'Applicant Portal' })).toHaveAttribute('aria-current', 'page');
  });

  it('switches to Executive navigation after a demo sign-in and lands on the campaign screen', async () => {
    renderApp('/');

    await signInAs('Ban tuyển dụng · CLB Công nghệ & Sáng tạo');

    expect(await screen.findByRole('heading', { level: 1, name: 'Create Recruitment Campaign' })).toBeInTheDocument();
    expect(navLinks()).toEqual(['Chiến dịch', 'Duyệt hồ sơ', 'Xếp lịch', 'Trang công khai']);
    expect(screen.getByRole('link', { name: 'Chiến dịch' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Ban tuyển dụng · Ban tuyển dụng')).toBeInTheDocument();
  });

  it('marks the active link and focuses the main region when navigating', async () => {
    renderApp('/');
    await signInAs('Ban tuyển dụng · CLB Công nghệ & Sáng tạo');

    fireEvent.click(screen.getByRole('link', { name: 'Xếp lịch' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Interview Scheduling' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xếp lịch' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Chiến dịch' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('sends an Interviewer to the workspace and signs out back to the public portal', async () => {
    renderApp('/');
    await signInAs('Hà My · User Experience Design');

    expect(await screen.findByRole('heading', { level: 1, name: 'Interviewer Workspace' })).toBeInTheDocument();
    expect(navLinks()).toEqual(['Interviewer Workspace']);

    fireEvent.click(screen.getByRole('button', { name: 'Sign Out' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Applicant Portal' })).toBeInTheDocument();
    expect(await screen.findByText('Khách (chưa đăng nhập)')).toBeInTheDocument();
  });

  it('keeps an Applicant on the portal after signing in there', async () => {
    renderApp('/');
    await signInAs('Nguyễn Minh Anh');

    expect(screen.getByRole('heading', { level: 1, name: 'Applicant Portal' })).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Minh Anh · Ứng viên')).toBeInTheDocument();
  });

  it('labels the sign-in dialog as a demo, focuses it, and returns focus on Escape', async () => {
    renderApp('/');
    const opener = await screen.findByRole('button', { name: 'Sign In' });
    opener.focus();

    fireEvent.click(opener);
    const dialog = await screen.findByRole('dialog', { name: 'Sign In' });
    expect(within(dialog).getByText(/không có xác thực thật/)).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Chọn tài khoản demo')).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('places the skip link before the header so keyboard users reach it first', async () => {
    const { container } = renderApp('/');
    await screen.findByText('Khách (chưa đăng nhập)');

    const firstFocusable = container.querySelector('a[href], button');
    expect(firstFocusable).toHaveTextContent('Bỏ qua điều hướng');
    expect(firstFocusable).toHaveAttribute('href', '#main-content');
  });
});
