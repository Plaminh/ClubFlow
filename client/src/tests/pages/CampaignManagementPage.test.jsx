import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EXECUTIVE, renderApp } from '../helpers/renderApp.jsx';
import { getMockApiState, setMockApiMode } from '../helpers/mockApi.js';

const PATH = '/executive/campaign';

async function openAs(scenarioId) {
  renderApp(PATH, { accountId: EXECUTIVE, scenarioId });
  await screen.findByRole('heading', { level: 2, name: 'Thông tin chiến dịch' });
}

// A locked campaign shows text only: no form field and no save, publish, add, or remove action.
// (Queries are limited to <main>: the demo bar above it has its own selects.)
function expectNoEditingControls() {
  const page = within(screen.getByRole('main'));
  expect(page.queryAllByRole('textbox')).toEqual([]);
  expect(page.queryAllByRole('combobox')).toEqual([]);
  expect(page.queryByLabelText('Ngày mở đơn')).not.toBeInTheDocument();
  for (const name of ['Lưu bản nháp', 'Công bố chiến dịch', 'Lưu thay đổi', '+ Thêm vị trí', 'Xóa vị trí']) {
    expect(page.queryAllByRole('button', { name })).toEqual([]);
  }
}

describe('Campaign Management', () => {
  it('sends visitors to Sign In instead of showing the screen', async () => {
    renderApp(PATH);

    await screen.findByRole('heading', { level: 1, name: 'Đăng nhập' });
    expect(screen.queryByLabelText('Tên chiến dịch')).not.toBeInTheDocument();
  });

  it('shows a restricted state to a signed-in account with another role', async () => {
    renderApp(PATH, { accountId: 'ap-minhanh' });

    await screen.findByRole('heading', { level: 1, name: 'Create Recruitment Campaign' });
    expect(screen.getByText('Màn hình này dành cho Ban tuyển dụng')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về trang của tôi' })).toHaveAttribute('href', '/');
    expect(screen.queryByLabelText('Tên chiến dịch')).not.toBeInTheDocument();
  });

  it('renders the reference layout: step strip, timeline, campaign context and positions', async () => {
    await openAs('draft');

    expect(screen.getByText('Bước 1 / 3 · Thiết lập chiến dịch')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Tiến trình tuyển thành viên' })).toBeInTheDocument();
    expect(screen.getByText('12/10/2026')).toBeInTheDocument();
    expect(screen.getByText('Phỏng vấn · 09:00–12:00')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Tên vị trí (Position)').map((input) => input.value)).toEqual([
      'User Experience Design',
      'Content Creation',
    ]);
    expect(screen.getByText('Bản nháp')).toBeInTheDocument();
  });

  it('keeps a draft editable and does not label the informational preview card as locked', async () => {
    await openAs('draft');

    expect(screen.getByLabelText('Tên chiến dịch')).toBeEnabled();
    expect(screen.getByLabelText('Thời lượng mỗi ca')).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Lưu bản nháp' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Công bố chiến dịch' })).toBeEnabled();
    expect(screen.getByRole('heading', { level: 2, name: 'Xem trước chiến dịch' })).toBeInTheDocument();
    expect(screen.queryByText(/chỉ đọc/i)).not.toBeInTheDocument();
  });

  it('blocks publication with specific errors, keeps valid input, and focuses the first error (BR-01)', async () => {
    await openAs('draft');
    fireEvent.change(screen.getByLabelText('Mô tả chiến dịch'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Ngày đóng đơn'), { target: { value: '2026-10-01' } });
    fireEvent.change(screen.getAllByLabelText('Chỉ tiêu')[0], { target: { value: '0' } });

    fireEvent.click(screen.getByRole('button', { name: 'Công bố chiến dịch' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Chưa thể công bố chiến dịch');
    expect(screen.getByText('Mô tả chiến dịch là bắt buộc. Hãy thêm mô tả trước khi công bố.')).toBeInTheDocument();
    expect(screen.getByText('Ngày đóng đơn phải sau ngày mở đơn.')).toBeInTheDocument();
    expect(screen.getByText('Chỉ tiêu phải là số nguyên dương (ví dụ 2).')).toBeInTheDocument();
    expect(screen.getByLabelText('Câu lạc bộ chủ trì')).toHaveValue('CLB Công nghệ & Sáng tạo');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Mô tả chiến dịch')).toHaveFocus());
  });

  it('requires at least one position before publishing', async () => {
    await openAs('draft');
    for (const button of screen.getAllByRole('button', { name: 'Xóa vị trí' })) {
      fireEvent.click(button);
      const dialog = await screen.findByRole('dialog', { name: 'Xóa vị trí?' });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Xóa vị trí' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    }

    fireEvent.click(screen.getByRole('button', { name: 'Công bố chiến dịch' }));

    expect(await screen.findByText('Chiến dịch cần ít nhất một vị trí tuyển.')).toBeInTheDocument();
  });

  it('saves a draft, previews it, and publishes after confirmation', async () => {
    await openAs('draft');

    fireEvent.click(screen.getByRole('button', { name: '+ Thêm vị trí' }));
    const last = (label) => screen.getAllByLabelText(label).at(-1);
    fireEvent.change(last('Ban (Department)'), { target: { value: 'Events' } });
    fireEvent.change(last('Tên vị trí (Position)'), { target: { value: 'Event Coordinator' } });
    fireEvent.change(last('Chỉ tiêu'), { target: { value: '1' } });
    fireEvent.change(last('Mô tả công việc'), { target: { value: 'Điều phối sự kiện.' } });
    fireEvent.change(last('Yêu cầu'), { target: { value: 'Chủ động.' } });

    fireEvent.click(screen.getByRole('button', { name: 'Lưu bản nháp' }));
    expect(await screen.findByText('Đã lưu thay đổi')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Xem trước' }));
    const preview = await screen.findByRole('dialog', { name: 'Xem trước chiến dịch' });
    expect(within(preview).getByText('Event Coordinator')).toBeInTheDocument();
    fireEvent.keyDown(preview, { key: 'Escape' });

    fireEvent.click(screen.getByRole('button', { name: 'Công bố chiến dịch' }));
    const confirm = await screen.findByRole('dialog', { name: 'Công bố chiến dịch?' });
    expect(within(confirm).getByText(/chi tiết và vị trí chỉ được chỉnh sửa trong giới hạn Q-03/)).toBeInTheDocument();
    fireEvent.click(within(confirm).getByRole('button', { name: 'Công bố chiến dịch' }));

    expect(await screen.findByText('Đã công bố chiến dịch')).toBeInTheDocument();
    expect(screen.getByText(/Chi tiết vẫn có thể chỉnh sửa theo giới hạn Q-03/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mở Application Review →' })).toHaveAttribute('href', '/executive/review');
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeEnabled();
    expect(screen.getAllByLabelText('Tên vị trí (Position)').at(-1)).toHaveValue('Event Coordinator');
  });

  it('cancelling the publish confirmation keeps the draft editable', async () => {
    await openAs('draft');

    fireEvent.click(screen.getByRole('button', { name: 'Công bố chiến dịch' }));
    const confirm = await screen.findByRole('dialog', { name: 'Công bố chiến dịch?' });
    fireEvent.click(within(confirm).getByRole('button', { name: 'Hủy' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Bản nháp')).toBeInTheDocument();
    expect(screen.getByLabelText('Tên chiến dịch')).toBeEnabled();
  });

  it('keeps constrained published details editable but locks Interview Setup after applications (Q-03)', async () => {
    await openAs('screening');

    const alert = screen.getByText('Chiến dịch đã được công bố').closest('.alert');
    expect(within(alert).getByText(/Interview Setup khóa sau hồ sơ hợp lệ đầu tiên/)).toBeInTheDocument();
    expect(screen.getByText('Đã công bố')).toBeInTheDocument();
    expect(screen.getByLabelText('Tên chiến dịch')).toBeEnabled();
    expect(screen.queryByLabelText('Ngày phỏng vấn')).not.toBeInTheDocument();

    // Constrained detail fields remain editable while setup is shown read-only.
    expect(screen.getByLabelText('Ngày mở đơn')).toHaveValue('2026-10-12');
    expect(screen.getByText('15 phút/ca')).toBeInTheDocument();
    expect(screen.getAllByText('3 hồ sơ đang liên kết với vị trí này.')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Xem trước' }));
    const preview = await screen.findByRole('dialog', { name: 'Xem trước chiến dịch' });
    expect(within(preview).getByText('Nội dung ứng viên sẽ thấy')).toBeInTheDocument();
  });

  it('stays read-only after the schedule is confirmed (BR-14)', async () => {
    await openAs('confirmed');

    expect(screen.getByText('Cấu hình chiến dịch đang ở chế độ chỉ đọc')).toBeInTheDocument();
    expect(screen.getByText(/lịch phỏng vấn đã được xác nhận, nên cấu hình chiến dịch được khóa \(BR-14\)/)).toBeInTheDocument();
    expectNoEditingControls();
    expect(screen.getByRole('button', { name: 'Xem trước' })).toBeEnabled();
  });

  it('closes applications early after confirmation (Q-03) and hides the action afterwards', async () => {
    await openAs('accepting');
    fireEvent.click(screen.getByRole('button', { name: 'Đóng nhận hồ sơ sớm' }));
    const dialog = await screen.findByRole('dialog', { name: 'Đóng nhận hồ sơ sớm?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Đóng nhận hồ sơ' }));

    expect(await screen.findByText('Đã đóng nhận hồ sơ')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đóng nhận hồ sơ sớm' })).not.toBeInTheDocument();
    expect(getMockApiState().closedEarlyAt).toEqual(expect.any(String));
  });

  it('creates a new draft campaign, then continues on its own id with publish available (C3)', async () => {
    await openAs('accepting');
    fireEvent.click(screen.getByRole('button', { name: 'Tạo chiến dịch mới' }));
    await screen.findByRole('heading', { level: 2, name: 'Thông tin chiến dịch' });
    expect(screen.getByLabelText('Tên chiến dịch')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Công bố chiến dịch' })).not.toBeInTheDocument();

    // Server validation errors are shown on the blank draft and nothing is created.
    fireEvent.click(screen.getByRole('button', { name: 'Lưu bản nháp' }));
    expect(await screen.findByText('Campaign fields are invalid.')).toBeInTheDocument();
    expect(getMockApiState().created).toBeUndefined();

    fireEvent.change(screen.getByLabelText('Tên chiến dịch'), { target: { value: 'ClubFlow 2027 Recruitment' } });
    fireEvent.change(screen.getByLabelText('Mô tả chiến dịch'), { target: { value: 'Recruit the next cohort.' } });
    fireEvent.change(screen.getByLabelText('Hướng dẫn ứng tuyển'), { target: { value: 'Submit one PDF CV.' } });
    fireEvent.change(screen.getByLabelText('Ngày mở đơn'), { target: { value: '2027-01-10' } });
    fireEvent.change(screen.getByLabelText('Ngày đóng đơn'), { target: { value: '2027-01-25' } });
    fireEvent.change(screen.getByLabelText('Ngày phỏng vấn'), { target: { value: '2027-02-01' } });
    fireEvent.click(screen.getByRole('button', { name: '+ Thêm vị trí' }));
    fireEvent.change(screen.getByLabelText('Ban (Department)'), { target: { value: 'Communications' } });
    fireEvent.change(screen.getByLabelText('Tên vị trí (Position)'), { target: { value: 'Content' } });
    fireEvent.change(screen.getByLabelText('Chỉ tiêu'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Mô tả công việc'), { target: { value: 'Write content.' } });
    fireEvent.change(screen.getByLabelText('Yêu cầu'), { target: { value: 'Clear writing.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu bản nháp' }));

    expect(await screen.findByText('Đã tạo bản nháp chiến dịch')).toBeInTheDocument();
    expect(getMockApiState().campaign).toMatchObject({ id: 'cmp-2027-hk1', status: 'draft', name: 'ClubFlow 2027 Recruitment' });
    expect(screen.getByRole('button', { name: 'Công bố chiến dịch' })).toBeInTheDocument();
  });

  it('offers early close only while applications are open', async () => {
    await openAs('screening');
    expect(screen.queryByRole('button', { name: 'Đóng nhận hồ sơ sớm' })).not.toBeInTheDocument();
  });

  it('shows a retryable HTTP error and recovers without leaving the route', async () => {
    setMockApiMode('error');
    renderApp(PATH, { accountId: EXECUTIVE, scenarioId: 'draft' });
    expect(await screen.findByText('The mock is running in deterministic error mode.')).toBeInTheDocument();

    setMockApiMode('normal');
    fireEvent.click(screen.getByRole('button', { name: /Thử lại/ }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Thông tin chiến dịch' })).toBeInTheDocument();
  });

  it('renders an empty Position collection without inventing business data', async () => {
    setMockApiMode('empty');
    renderApp(PATH, { accountId: EXECUTIVE, scenarioId: 'draft' });
    await screen.findByRole('heading', { level: 2, name: 'Thông tin chiến dịch' });
    expect(screen.queryByLabelText('Tên vị trí (Position)')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Thêm vị trí' })).toBeEnabled();
  });
});
