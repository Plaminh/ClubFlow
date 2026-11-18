import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as authService from '../../services/authService.js';
import { setMockApiDelay, setMockApiMode } from '../helpers/mockApi.js';
import { DEMO_PASSWORD, renderApp, signOut, submitSignIn } from '../helpers/renderApp.jsx';

const PATH = '/login';

afterEach(() => vi.restoreAllMocks());

describe('Sign In over HTTP', () => {
  it('renders labelled username/password fields and all canonical examples', async () => {
    renderApp(PATH);
    await screen.findByRole('heading', { level: 1, name: 'Đăng nhập' });
    expect(screen.getByLabelText('Tên đăng nhập')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Mật khẩu')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('link', { name: 'Quay về trang tuyển dụng' })).toHaveAttribute('href', '/');
    const examples = screen.getByRole('complementary', { name: 'Tài khoản demo' });
    for (const username of ['exec', 'studentA', 'studentB', 'int-content', 'int-comms']) expect(await within(examples).findByText(username)).toBeInTheDocument();
    expect(within(examples).getAllByText(DEMO_PASSWORD)).toHaveLength(5);
  });

  it('offers no registration, recovery, or social sign-in', async () => {
    renderApp(PATH);
    await screen.findByRole('heading', { level: 1, name: 'Đăng nhập' });
    expect(screen.queryByText(/đăng ký|quên mật khẩu|sign up|forgot|google/i)).not.toBeInTheDocument();
  });

  it('toggles password visibility without submitting', async () => {
    renderApp(PATH);
    const password = await screen.findByLabelText('Mật khẩu');
    fireEvent.click(screen.getByRole('button', { name: 'Hiện mật khẩu' }));
    expect(password).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Ẩn mật khẩu' }));
    expect(password).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Hiện mật khẩu' })).toHaveAttribute('type', 'button');
  });

  it('requires both fields and focuses the username', async () => {
    renderApp(PATH);
    fireEvent.click(await screen.findByRole('button', { name: 'Đăng nhập' }));
    expect(screen.getByText('Tên đăng nhập là bắt buộc.')).toBeInTheDocument();
    expect(screen.getByText('Mật khẩu là bắt buộc.')).toBeInTheDocument();
    expect(screen.getByLabelText('Tên đăng nhập')).toHaveFocus();
  });

  it('reports backend invalid credentials and remains a visitor', async () => {
    renderApp(PATH);
    await submitSignIn('studentA', 'wrong-password');
    expect(await screen.findByText('Username or password is incorrect.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument();
    expect(screen.getByText('Khách (chưa đăng nhập)')).toBeInTheDocument();
  });

  it('shows a network failure and succeeds on retry', async () => {
    renderApp(PATH);
    setMockApiMode('network-error');
    await submitSignIn('studentA');
    expect(await screen.findByText(/Không kết nối được tới máy chủ/)).toBeInTheDocument();
    setMockApiMode('normal');
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(await screen.findByText('Nguyen Minh Anh · Ứng viên', { ignore: 'option' })).toBeInTheDocument();
  });

  it('disables the form and prevents duplicate submissions while pending', async () => {
    setMockApiDelay(40);
    const signIn = vi.spyOn(authService, 'signIn');
    renderApp(PATH);
    await submitSignIn('studentA');
    fireEvent.submit(screen.getByLabelText('Tên đăng nhập').closest('form'));
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Đang đăng nhập…' })).toBeDisabled();
    await screen.findByRole('heading', { level: 1, name: 'Applicant Portal' });
  });

  it.each([
    ['exec', 'Create Recruitment Campaign', 'Recruitment Executive · Ban tuyển dụng'],
    ['studentA', 'Applicant Portal', 'Nguyen Minh Anh · Ứng viên'],
    ['int-content', 'Interviewer Workspace', 'Gia Huy · Người phỏng vấn'],
  ])('signs %s in and lands on the role home', async (username, title, who) => {
    renderApp(PATH);
    await submitSignIn(username);
    await screen.findByRole('heading', { level: 1, name: title });
    expect(screen.getByText(who, { selector: '.app-header__who' })).toBeInTheDocument();
  });

  it('stores only the bearer token/session metadata and restores on reload', async () => {
    renderApp(PATH);
    await submitSignIn('studentA');
    await screen.findByRole('heading', { level: 1, name: 'Applicant Portal' });
    await waitFor(() => expect(JSON.parse(window.sessionStorage.getItem('clubflow.demoSession'))).toMatchObject({ token: 'mock-token-studentA' }));
    expect(JSON.stringify({ ...window.sessionStorage, ...window.localStorage })).not.toContain(DEMO_PASSWORD);
  });

  it('signs out, clears the token, and returns to the public portal', async () => {
    renderApp(PATH);
    await submitSignIn('int-content');
    await screen.findByRole('heading', { level: 1, name: 'Interviewer Workspace' });
    await signOut();
    await screen.findByRole('heading', { level: 1, name: 'Applicant Portal' });
    expect(await screen.findByText('Khách (chưa đăng nhập)')).toBeInTheDocument();
    await waitFor(() => expect(JSON.parse(window.sessionStorage.getItem('clubflow.demoSession')).token).toBeNull());
  });
});
