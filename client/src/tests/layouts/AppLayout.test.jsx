import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { openAccountMenu, renderApp, signInAs, signOut } from '../helpers/renderApp.jsx';

const who = (text) => screen.getByText(text, { selector: '.app-header__who' });

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
    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('button', { name: /^Tài khoản của/ })).not.toBeInTheDocument();
  });

  it('switches to Executive navigation after a DemoBar account switch and lands on the campaign screen', async () => {
    renderApp('/');

    await signInAs('Executive');

    await screen.findByRole('heading', { level: 1, name: 'Create Recruitment Campaign' });
    expect(navLinks()).toEqual(['Chiến dịch', 'Duyệt hồ sơ', 'Xếp lịch', 'Trang công khai']);
    expect(screen.getByRole('link', { name: 'Chiến dịch' })).toHaveAttribute('aria-current', 'page');
    expect(who('Recruitment Executive · Ban tuyển dụng')).toBeInTheDocument();
  });

  it('marks the active link and focuses the main region when navigating', async () => {
    renderApp('/');
    await signInAs('Executive');

    fireEvent.click(screen.getByRole('link', { name: 'Xếp lịch' }));

    await screen.findByRole('heading', { level: 1, name: 'Interview Scheduling' });
    expect(screen.getByRole('link', { name: 'Xếp lịch' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Chiến dịch' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('sends an Interviewer to the workspace and signs out back to the public portal', async () => {
    renderApp('/');
    await signInAs('Interviewer – Content');

    await screen.findByRole('heading', { level: 1, name: 'Interviewer Workspace' });
    expect(navLinks()).toEqual(['Interviewer Workspace']);

    await signOut();

    await screen.findByRole('heading', { level: 1, name: 'Applicant Portal' });
    expect(await screen.findByText('Khách (chưa đăng nhập)')).toBeInTheDocument();
  });

  it('keeps an Applicant on the portal after signing in there', async () => {
    renderApp('/');
    await signInAs('Student A');

    expect(screen.getByRole('heading', { level: 1, name: 'Applicant Portal' })).toBeInTheDocument();
    expect(who('Nguyen Minh Anh · Ứng viên')).toBeInTheDocument();
  });

  it('switches between demo accounts and back to guest from the DemoBar', async () => {
    renderApp('/');
    await signInAs('Interviewer – Content');
    await screen.findByRole('heading', { level: 1, name: 'Interviewer Workspace' });

    await signInAs('Student A');
    await screen.findByRole('heading', { level: 1, name: 'Applicant Portal' });
    expect(who('Nguyen Minh Anh · Ứng viên')).toBeInTheDocument();

    const demo = screen.getByRole('region', { name: 'Điều khiển bản demo' });
    fireEvent.change(within(demo).getByLabelText(/Đổi tài khoản nhanh/), { target: { value: '' } });
    expect(await screen.findByText('Khách (chưa đăng nhập)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toBeInTheDocument();
  });

  it('opens the Sign In page from the header instead of an account-picker dialog', async () => {
    renderApp('/');

    fireEvent.click(await screen.findByRole('link', { name: 'Đăng nhập' }));

    await screen.findByRole('heading', { level: 1, name: 'Đăng nhập' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('offers My Profile and Sign Out in a keyboard-operable account menu', async () => {
    renderApp('/', { accountId: 'ap-minhanh' });
    const trigger = await openAccountMenu();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('link', { name: 'Hồ sơ cá nhân' }), { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('link', { name: 'Hồ sơ cá nhân' })).not.toBeInTheDocument();

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('link', { name: 'Hồ sơ cá nhân' }));
    await screen.findByRole('heading', { level: 1, name: 'Hồ sơ cá nhân' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('labels the demo controls without browser-only data, scenario, or reset controls', async () => {
    renderApp('/');
    const demo = await screen.findByRole('region', { name: 'Điều khiển bản demo' });
    expect(within(demo).getByText('Demo')).toBeInTheDocument();
    expect(within(demo).getByText('Dữ liệu từ HTTP mock')).toBeInTheDocument();
    expect(within(demo).getByLabelText(/Đổi tài khoản nhanh/)).toBeInTheDocument();
    expect(within(demo).queryByLabelText('Kịch bản')).not.toBeInTheDocument();
    expect(within(demo).queryByRole('button', { name: /Đặt lại/ })).not.toBeInTheDocument();
    expect(within(demo).queryByText(/bộ nhớ trình duyệt/)).not.toBeInTheDocument();
  });

  it('does not move focus into the page on first load (StrictMode double effects)', async () => {
    renderApp('/');
    await screen.findByText('Khách (chưa đăng nhập)');

    expect(screen.getByRole('main')).not.toHaveFocus();
    expect(document.activeElement).toBe(document.body);
  });

  it('places the skip link before the header so keyboard users reach it first', async () => {
    const { container } = renderApp('/');
    await screen.findByText('Khách (chưa đăng nhập)');

    const firstFocusable = container.querySelector('a[href], button');
    expect(firstFocusable).toHaveTextContent('Bỏ qua điều hướng');
    expect(firstFocusable).toHaveAttribute('href', '#main-content');
  });
});
