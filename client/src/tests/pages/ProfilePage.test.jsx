import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ACCOUNTS } from '../../mocks/fixtures.js';
import { setSimulation } from '../../mocks/store.js';
import * as authService from '../../services/authService.js';
import * as demoSessionService from '../../services/demoSessionService.js';
import * as profileService from '../../services/profileService.js';
import { EXECUTIVE, openAccountMenu, renderApp, signInAs, signOut, submitSignIn } from '../helpers/renderApp.jsx';

const PATH = '/profile';
const who = (text) => screen.getByText(text, { selector: '.app-header__who' });

async function openProfile(accountId, options = {}) {
  renderApp(PATH, { accountId, ...options });
  return screen.findByRole('region', { name: 'Thông tin cá nhân' });
}

async function startEditing() {
  fireEvent.click(await screen.findByRole('button', { name: 'Chỉnh sửa' }));
  return screen.findByRole('region', { name: 'Chỉnh sửa hồ sơ' });
}

function fill(name, email) {
  fireEvent.change(screen.getByLabelText('Họ và tên'), { target: { value: name } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
}

const save = () => fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('My Profile (simulated)', () => {
  it('sends a guest to Sign In and returns to the profile after signing in', async () => {
    renderApp(PATH);
    await screen.findByRole('heading', { level: 1, name: 'Đăng nhập' });

    await submitSignIn('ha.my@clubflow.demo.example');

    const card = await screen.findByRole('region', { name: 'Thông tin cá nhân' });
    expect(within(card).getByRole('heading', { name: 'Hà My' })).toBeInTheDocument();
  });

  it.each([
    [EXECUTIVE, 'Ban tuyển dụng', 'executive@clubflow.demo.example', 'Ban tuyển dụng', 'TD'],
    ['iv-hamy', 'Hà My', 'ha.my@clubflow.demo.example', 'Người phỏng vấn', 'HM'],
    ['ap-minhanh', 'Nguyễn Minh Anh', 'minh.anh@demo.example', 'Ứng viên', 'MA'],
  ])('shows identity, role, and account id for %s', async (accountId, name, email, roleLabel, initials) => {
    const card = await openProfile(accountId);

    expect(within(card).getByRole('heading', { level: 3, name })).toBeInTheDocument();
    expect(within(card).getByText(email)).toBeInTheDocument();
    expect(within(card).getByText(accountId)).toBeInTheDocument();
    expect(within(card).getAllByText(roleLabel).length).toBeGreaterThan(0);
    expect(card.querySelector('.profile-summary__avatar')).toHaveTextContent(initials);
  });

  it('shows student information only for applicants', async () => {
    const card = await openProfile('ap-minhanh');
    expect(within(card).getByText('Mã sinh viên')).toBeInTheDocument();
    expect(within(card).getByText('Khoa')).toBeInTheDocument();
    expect(within(card).getByText('Năm học')).toBeInTheDocument();
  });

  it.each([EXECUTIVE, 'iv-hamy'])('omits student information for %s', async (accountId) => {
    const card = await openProfile(accountId);
    expect(within(card).queryByText('Mã sinh viên')).not.toBeInTheDocument();
  });

  it('lets the user edit only display name and email, and keeps security informational', async () => {
    await openProfile('ap-minhanh');
    const form = await startEditing();

    expect(within(form).getAllByRole('textbox').map((input) => input.id)).toEqual(['profile-display-name', 'profile-email']);
    const security = screen.getByRole('region', { name: 'Bảo mật tài khoản' });
    expect(within(security).queryByRole('button')).not.toBeInTheDocument();
    expect(within(security).queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/mật khẩu/i)).not.toBeInTheDocument();
  });

  it('saves changes, confirms them, and updates the header immediately', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('Minh Anh Nguyễn', 'anh.moi@demo.example');
    save();

    expect(await screen.findByText('Đã lưu thay đổi')).toBeInTheDocument();
    const card = screen.getByRole('region', { name: 'Thông tin cá nhân' });
    expect(within(card).getByRole('heading', { name: 'Minh Anh Nguyễn' })).toBeInTheDocument();
    expect(within(card).getByText('anh.moi@demo.example')).toBeInTheDocument();
    expect(who('Minh Anh Nguyễn · Ứng viên')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tài khoản của Minh Anh Nguyễn' })).toBeInTheDocument();
  });

  it('sends a double-clicked Save only once', async () => {
    const update = vi.spyOn(profileService, 'updateProfile');
    await openProfile('ap-minhanh');
    await startEditing();
    fill('Minh Anh Nguyễn', 'anh.moi@demo.example');
    const form = screen.getByLabelText('Email').closest('form');
    fireEvent.submit(form);
    fireEvent.submit(form);

    await screen.findByText('Đã lưu thay đổi');
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('discards edits on Cancel', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('Không Lưu', 'khong.luu@demo.example');
    fireEvent.click(screen.getByRole('button', { name: 'Hủy thay đổi' }));

    const card = await screen.findByRole('region', { name: 'Thông tin cá nhân' });
    expect(within(card).getByRole('heading', { name: 'Nguyễn Minh Anh' })).toBeInTheDocument();
    expect(who('Nguyễn Minh Anh · Ứng viên')).toBeInTheDocument();

    await startEditing();
    expect(screen.getByLabelText('Họ và tên')).toHaveValue('Nguyễn Minh Anh');
    expect(screen.getByLabelText('Email')).toHaveValue('minh.anh@demo.example');
  });

  it('validates required fields and email format, focusing the first invalid field', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('  ', 'sai-dinh-dang');
    save();

    expect(screen.getByText('Họ và tên là bắt buộc.')).toBeInTheDocument();
    expect(screen.getByText('Email chưa đúng định dạng.')).toBeInTheDocument();
    expect(screen.getByLabelText('Họ và tên')).toHaveFocus();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');

    fill('Nguyễn Minh Anh', '');
    save();
    expect(screen.getByText('Email là bắt buộc.')).toBeInTheDocument();
    expect(who('Nguyễn Minh Anh · Ứng viên')).toBeInTheDocument();
  });

  it('rejects an email used by another demo account and keeps the form open', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('Nguyễn Minh Anh', 'ha.my@clubflow.demo.example');
    save();

    const email = screen.getByLabelText('Email');
    await waitFor(() => expect(email).toHaveAccessibleDescription(/tài khoản demo khác/));
    await waitFor(() => expect(email).toHaveFocus());
    expect(screen.getByRole('region', { name: 'Chỉnh sửa hồ sơ' })).toBeInTheDocument();
  });

  it('shows a simulated network failure on save without losing the typed values', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('Minh Anh Nguyễn', 'anh.moi@demo.example');
    setSimulation('error');
    save();

    expect(await screen.findByText(/mô phỏng lỗi mạng/)).toBeInTheDocument();
    expect(screen.getByLabelText('Họ và tên')).toHaveValue('Minh Anh Nguyễn');
    expect(who('Nguyễn Minh Anh · Ứng viên')).toBeInTheDocument();
  });

  it('signs in with the changed email after signing out and restores the same account', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('Minh Anh Nguyễn', 'anh.moi@demo.example');
    save();
    await screen.findByText('Đã lưu thay đổi');

    await signOut();
    await screen.findByRole('heading', { level: 1, name: 'Applicant Portal' });
    expect(await screen.findByText('Khách (chưa đăng nhập)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Đăng nhập' }));
    await submitSignIn('minh.anh@demo.example');
    expect(await screen.findByText('Email hoặc mật khẩu demo không đúng.')).toBeInTheDocument();

    await submitSignIn('anh.moi@demo.example');
    await screen.findByRole('heading', { level: 1, name: 'Applicant Portal' });
    expect(who('Minh Anh Nguyễn · Ứng viên')).toBeInTheDocument();

    await openAccountMenu();
    fireEvent.click(screen.getByRole('link', { name: 'Hồ sơ cá nhân' }));
    const card = await screen.findByRole('region', { name: 'Thông tin cá nhân' });
    expect(within(card).getByText('ap-minhanh')).toBeInTheDocument();
  });

  it('drops unsaved edits when the account is switched and shows the other account', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('Rò Rỉ', 'ro.ri@demo.example');

    await signInAs('Hà My · User Experience Design');

    const card = await screen.findByRole('region', { name: 'Thông tin cá nhân' });
    expect(within(card).getByRole('heading', { name: 'Hà My' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Chỉnh sửa hồ sơ' })).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Rò Rỉ')).not.toBeInTheDocument();

    await startEditing();
    expect(screen.getByLabelText('Họ và tên')).toHaveValue('Hà My');
    expect(screen.getByLabelText('Email')).toHaveValue('ha.my@clubflow.demo.example');
  });

  it('cancels a save that is still in flight when the user signs out, and restores nothing stale', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('Rò Rỉ', 'ro.ri@demo.example');
    save();
    await authService.signOut(); // session ends while the simulated request is pending
    fireEvent.change(screen.getByLabelText(/Đổi tài khoản nhanh/), { target: { value: 'iv-hamy' } });

    expect(await screen.findByRole('heading', { level: 3, name: 'Hà My' })).toBeInTheDocument();
    expect(who('Hà My · Người phỏng vấn')).toBeInTheDocument();
    expect(screen.queryByText('Đã lưu thay đổi')).not.toBeInTheDocument();
    expect(await demoSessionService.listAccounts()).toEqual(ACCOUNTS);
  });

  it('shows only the new account after a save and an account switch overlap', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('Rò Rỉ', 'ro.ri@demo.example');
    save();
    await signInAs('Hà My · User Experience Design');

    expect(await screen.findByRole('heading', { level: 3, name: 'Hà My' })).toBeInTheDocument();
    expect(who('Hà My · Người phỏng vấn')).toBeInTheDocument();
    expect(screen.queryByText('Đã lưu thay đổi')).not.toBeInTheDocument();
  });

  it('restores fixture profile data and closes the editor on demo reset and scenario switch', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('Minh Anh Nguyễn', 'anh.moi@demo.example');
    save();
    await screen.findByText('Đã lưu thay đổi');

    await startEditing();
    fill('Chưa Lưu', 'chua.luu@demo.example');
    fireEvent.click(screen.getByRole('button', { name: 'Đặt lại dữ liệu demo' }));

    let card = await screen.findByRole('region', { name: 'Thông tin cá nhân' });
    expect(await within(card).findByRole('heading', { name: 'Nguyễn Minh Anh' })).toBeInTheDocument();
    expect(within(card).getByText('minh.anh@demo.example')).toBeInTheDocument();
    expect(who('Nguyễn Minh Anh · Ứng viên')).toBeInTheDocument();
    expect(screen.queryByText('Đã lưu thay đổi')).not.toBeInTheDocument();

    await startEditing();
    fill('Minh Anh Nguyễn', 'anh.moi@demo.example');
    save();
    await screen.findByText('Đã lưu thay đổi');
    fireEvent.change(screen.getByLabelText('Kịch bản'), { target: { value: 'confirmed' } });

    card = await screen.findByRole('region', { name: 'Thông tin cá nhân' });
    expect(await within(card).findByRole('heading', { name: 'Nguyễn Minh Anh' })).toBeInTheDocument();
    expect(who('Nguyễn Minh Anh · Ứng viên')).toBeInTheDocument();
  });

  it('leaves submitted application snapshots unchanged after a profile edit', async () => {
    await openProfile('ap-minhanh', { scenarioId: 'confirmed' });
    await startEditing();
    fill('Minh Anh Nguyễn', 'anh.moi@demo.example');
    save();
    await screen.findByText('Đã lưu thay đổi');

    await signInAs('Ban tuyển dụng · CLB Công nghệ & Sáng tạo');
    fireEvent.click(await screen.findByRole('link', { name: 'Duyệt hồ sơ' }));

    await screen.findByRole('heading', { level: 1, name: 'Application Review' });
    expect((await screen.findAllByText(/Nguyễn Minh Anh/)).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Minh Anh Nguyễn/, { ignore: 'option' })).not.toBeInTheDocument();
  });
});
