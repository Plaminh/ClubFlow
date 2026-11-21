import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { setMockApiDelay, setMockApiMode } from '../helpers/mockApi.js';
import { EXECUTIVE, renderApp, submitSignIn } from '../helpers/renderApp.jsx';

const PATH = '/profile';
const who = (text) => screen.getByText(text, { selector: '.app-header__who' });

async function openProfile(accountId) {
  renderApp(PATH, { accountId });
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

describe('My Profile over HTTP', () => {
  it('preserves the intended profile route through HTTP sign-in', async () => {
    renderApp(PATH);
    await screen.findByRole('heading', { level: 1, name: 'Đăng nhập' });
    await submitSignIn('int-content');
    const card = await screen.findByRole('region', { name: 'Thông tin cá nhân' });
    expect(within(card).getByRole('heading', { name: 'Gia Huy' })).toBeInTheDocument();
  });

  it.each([
    [EXECUTIVE, 'Recruitment Executive', 'executive@clubflow.demo.example', 'exec-recruitment'],
    ['iv-giahuy', 'Gia Huy', 'gia.huy@clubflow.demo.example', 'iv-giahuy'],
    ['ap-minhanh', 'Nguyen Minh Anh', 'minh.anh@demo.example', 'ap-minhanh'],
  ])('shows HTTP identity for %s', async (accountId, name, email, id) => {
    const card = await openProfile(accountId);
    expect(within(card).getByRole('heading', { level: 3, name })).toBeInTheDocument();
    expect(within(card).getByText(email)).toBeInTheDocument();
    expect(within(card).getByText(id)).toBeInTheDocument();
  });

  it('shows student fields only for applicants', async () => {
    let card = await openProfile('ap-minhanh');
    expect(within(card).getByText('Mã sinh viên')).toBeInTheDocument();
    expect(within(card).getByText('Khoa')).toBeInTheDocument();
  });

  it('saves editable fields and updates the header', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('Minh Anh Updated', 'anh.moi@demo.example');
    save();
    expect(await screen.findByText('Đã lưu thay đổi')).toBeInTheDocument();
    const card = screen.getByRole('region', { name: 'Thông tin cá nhân' });
    expect(within(card).getByRole('heading', { name: 'Minh Anh Updated' })).toBeInTheDocument();
    expect(within(card).getByText('anh.moi@demo.example')).toBeInTheDocument();
    expect(who('Minh Anh Updated · Ứng viên')).toBeInTheDocument();
  });

  it('discards edits on Cancel without calling the API', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('Không lưu', 'khong.luu@demo.example');
    const before = fetch.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Hủy thay đổi' }));

    expect(screen.queryByRole('region', { name: 'Chỉnh sửa hồ sơ' })).not.toBeInTheDocument();
    const card = screen.getByRole('region', { name: 'Thông tin cá nhân' });
    expect(within(card).getByRole('heading', { name: 'Nguyen Minh Anh' })).toBeInTheDocument();
    expect(within(card).queryByText('khong.luu@demo.example')).not.toBeInTheDocument();
    expect(fetch.mock.calls.slice(before).some(([, init]) => init?.method === 'PATCH')).toBe(false);
  });

  it('sends a double-clicked Save only once', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('Minh Anh', 'minh.anh@demo.example');
    setMockApiDelay(50);
    const button = screen.getByRole('button', { name: 'Lưu thay đổi' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(await screen.findByText('Đã lưu thay đổi')).toBeInTheDocument();
    expect(
      fetch.mock.calls.filter(
        ([url, init]) => String(url).includes('/api/me/profile') && init?.method === 'PATCH',
      ),
    ).toHaveLength(1);
  });

  it('validates required fields locally and focuses the first error', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('  ', 'invalid');
    save();
    expect(screen.getByText('Họ và tên là bắt buộc.')).toBeInTheDocument();
    expect(screen.getByText('Email chưa đúng định dạng.')).toBeInTheDocument();
    expect(screen.getByLabelText('Họ và tên')).toHaveFocus();
  });

  it('maps backend duplicate-email fields and keeps the editor open', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('Nguyen Minh Anh', 'quoc.bao@demo.example');
    save();
    await waitFor(() =>
      expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(/already in use/i),
    );
    expect(screen.getByRole('region', { name: 'Chỉnh sửa hồ sơ' })).toBeInTheDocument();
  });

  it('shows a retryable network error without losing typed values', async () => {
    await openProfile('ap-minhanh');
    await startEditing();
    fill('Minh Anh Updated', 'anh.moi@demo.example');
    setMockApiMode('network-error');
    save();
    expect(await screen.findByText(/Không kết nối được tới máy chủ/)).toBeInTheDocument();
    expect(screen.getByLabelText('Họ và tên')).toHaveValue('Minh Anh Updated');
  });
});
