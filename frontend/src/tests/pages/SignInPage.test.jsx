import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSessionAccountId, setSimulation } from '../../mocks/store.js';
import * as authService from '../../services/authService.js';
import { DEMO_PASSWORD, renderApp, signOut, submitSignIn } from '../helpers/renderApp.jsx';

const PATH = '/login';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Sign In (simulated)', () => {
  it('renders labelled fields, the public link, and fictional example logins for the three roles', async () => {
    renderApp(PATH);
    await screen.findByRole('heading', { level: 1, name: 'Đăng nhập' });

    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Mật khẩu')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('link', { name: 'Quay về trang tuyển dụng' })).toHaveAttribute('href', '/');
    expect(screen.getByText('Không phải xác thực thật')).toBeInTheDocument();

    const examples = screen.getByRole('complementary', { name: 'Tài khoản demo' });
    for (const email of ['executive@clubflow.demo.example', 'minh.anh@demo.example', 'ha.my@clubflow.demo.example']) {
      expect(await within(examples).findByText(email)).toBeInTheDocument();
    }
    expect(within(examples).getAllByText(DEMO_PASSWORD)).toHaveLength(3);
  });

  it('offers no registration, password recovery, or social sign-in', async () => {
    renderApp(PATH);
    await screen.findByRole('heading', { level: 1, name: 'Đăng nhập' });

    expect(screen.queryByText(/đăng ký|quên mật khẩu|sign up|forgot|google/i)).not.toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    renderApp(PATH);
    const password = await screen.findByLabelText('Mật khẩu');

    fireEvent.click(screen.getByRole('button', { name: 'Hiện mật khẩu' }));
    expect(password).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: 'Ẩn mật khẩu' }));
    expect(password).toHaveAttribute('type', 'password');

    // The toggle is not a submit button: no validation ran and nothing was sent.
    expect(screen.getByRole('button', { name: 'Hiện mật khẩu' })).toHaveAttribute('type', 'button');
    expect(screen.queryByText('Email là bắt buộc.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeEnabled();
  });

  it('requires both fields and focuses the first invalid one', async () => {
    renderApp(PATH);
    fireEvent.click(await screen.findByRole('button', { name: 'Đăng nhập' }));

    expect(screen.getByText('Email là bắt buộc.')).toBeInTheDocument();
    expect(screen.getByText('Mật khẩu là bắt buộc.')).toBeInTheDocument();
    const email = screen.getByLabelText('Email');
    expect(email).toHaveFocus();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Email là bắt buộc.');
  });

  it('rejects a malformed email before calling the service', async () => {
    renderApp(PATH);
    await submitSignIn('not-an-email');

    expect(screen.getByText('Email chưa đúng định dạng.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('reports invalid credentials and stays on the form as a guest', async () => {
    renderApp(PATH);
    await submitSignIn('minh.anh@demo.example', 'wrong-password');

    expect(await screen.findByText('Email hoặc mật khẩu demo không đúng.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument();
    expect(screen.getByText('Khách (chưa đăng nhập)')).toBeInTheDocument();
  });

  it('shows the simulated network failure and lets the user retry', async () => {
    renderApp(PATH);
    await screen.findByLabelText('Email');
    setSimulation('error');
    await submitSignIn('minh.anh@demo.example');

    expect(await screen.findByText(/mô phỏng lỗi mạng/)).toBeInTheDocument();

    setSimulation('normal');
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(await screen.findByText('Nguyễn Minh Anh · Ứng viên', { ignore: 'option' })).toBeInTheDocument();
  });

  it('disables the form while the simulated request is pending and sends it only once', async () => {
    const signIn = vi.spyOn(authService, 'signIn');
    renderApp(PATH);
    await submitSignIn('minh.anh@demo.example');
    fireEvent.submit(screen.getByLabelText('Email').closest('form'));
    expect(signIn).toHaveBeenCalledTimes(1);

    expect(screen.getByRole('button', { name: 'Đang đăng nhập…' })).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    await screen.findByRole('heading', { level: 1, name: 'Applicant Portal' });
  });

  it.each([
    ['executive@clubflow.demo.example', 'Create Recruitment Campaign', 'Ban tuyển dụng · CLB Công nghệ & Sáng tạo'],
    ['minh.anh@demo.example', 'Applicant Portal', 'Nguyễn Minh Anh · Ứng viên'],
    ['ha.my@clubflow.demo.example', 'Interviewer Workspace', 'Hà My · Người phỏng vấn'],
  ])('signs %s in and lands on %s', async (email, title, who) => {
    renderApp(PATH);
    await submitSignIn(email);

    await screen.findByRole('heading', { level: 1, name: title });
    expect(screen.getByText(who, { selector: '.app-header__who' })).toBeInTheDocument();
  });

  it('does not sign the visitor in when the demo data is replaced while the request is pending', async () => {
    renderApp(PATH);
    await submitSignIn('minh.anh@demo.example');
    fireEvent.click(screen.getByRole('button', { name: 'Đặt lại dữ liệu demo' }));

    expect(await screen.findByText(/Thao tác đã bị hủy/)).toBeInTheDocument();
    expect(screen.getByText('Khách (chưa đăng nhập)')).toBeInTheDocument();
    expect(getSessionAccountId()).toBeNull();
    expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument();
  });

  it('keeps the password out of browser storage', async () => {
    renderApp(PATH);
    await submitSignIn('minh.anh@demo.example');
    await screen.findByRole('heading', { level: 1, name: 'Applicant Portal' });

    await waitFor(() =>
      expect(JSON.parse(window.sessionStorage.getItem('clubflow.demoSession'))).toMatchObject({ accountId: 'ap-minhanh' }),
    );
    const stored = JSON.stringify({ ...window.sessionStorage, ...window.localStorage });
    expect(stored).not.toContain(DEMO_PASSWORD);
    expect(stored).not.toMatch(/token|jwt/i);
  });

  it('signs out to the public portal and protects the previous screen again', async () => {
    renderApp(PATH);
    await submitSignIn('ha.my@clubflow.demo.example');
    await screen.findByRole('heading', { level: 1, name: 'Interviewer Workspace' });

    await signOut();

    await screen.findByRole('heading', { level: 1, name: 'Applicant Portal' });
    expect(await screen.findByText('Khách (chưa đăng nhập)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toBeInTheDocument();
  });
});
