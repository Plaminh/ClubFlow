import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EXECUTIVE, renderApp } from '../helpers/renderApp.jsx';

const PATH = '/executive/campaign';

async function openAs(scenarioId) {
  renderApp(PATH, { accountId: EXECUTIVE, scenarioId });
  await screen.findByRole('heading', { level: 2, name: 'Thông tin chiến dịch' });
}

describe('Campaign Management', () => {
  it('shows a restricted state to visitors', async () => {
    renderApp(PATH);

    expect(await screen.findByRole('heading', { level: 1, name: 'Create Recruitment Campaign' })).toBeInTheDocument();
    expect(screen.getByText('Màn hình này dành cho Ban tuyển dụng')).toBeInTheDocument();
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
    expect(await screen.findByText('Đã lưu bản nháp (mô phỏng)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Xem trước' }));
    const preview = await screen.findByRole('dialog', { name: 'Xem trước chiến dịch' });
    expect(within(preview).getByText('Event Coordinator')).toBeInTheDocument();
    fireEvent.keyDown(preview, { key: 'Escape' });

    fireEvent.click(screen.getByRole('button', { name: 'Công bố chiến dịch' }));
    const confirm = await screen.findByRole('dialog', { name: 'Công bố chiến dịch?' });
    fireEvent.click(within(confirm).getByRole('button', { name: 'Công bố chiến dịch' }));

    expect(await screen.findByText('Đã công bố chiến dịch (mô phỏng)')).toBeInTheDocument();
    expect(screen.getByText('Chiến dịch đã được công bố')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mở Application Review →' })).toHaveAttribute('href', '/executive/review');
  });

  it('blocks removing a position that already has applications (BR-04)', async () => {
    await openAs('screening');

    fireEvent.click(screen.getAllByRole('button', { name: 'Xóa vị trí' })[0]);
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Xóa vị trí' }));

    expect(await screen.findByText(/Không thể xóa vị trí này vì đã có 3 hồ sơ ứng tuyển/)).toBeInTheDocument();
    expect(screen.getAllByLabelText('Tên vị trí (Position)')).toHaveLength(2);
  });

  it('is read-only after the schedule is confirmed (BR-14)', async () => {
    await openAs('confirmed');

    expect(screen.getByText('Cấu hình chiến dịch đang ở chế độ chỉ đọc')).toBeInTheDocument();
    expect(screen.getByLabelText('Tên chiến dịch')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Xem trước' })).toBeEnabled();
  });
});
