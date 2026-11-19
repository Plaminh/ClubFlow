import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as applicationService from '../../services/applicationService.js';
import { EXECUTIVE, renderApp } from '../helpers/renderApp.jsx';
import { setMockApiDelay, setMockApiMode } from '../helpers/mockApi.js';

const PATH = '/executive/scheduling';

async function openScheduling(scenarioId = 'screening') {
  renderApp(PATH, { accountId: EXECUTIVE, scenarioId });
  await screen.findByRole('heading', { level: 2, name: /^Lịch (nháp|Confirmed)$/ });
}

function stat(label) {
  const region = screen.getByRole('region', { name: 'Tổng quan trạng thái lịch' });
  return within(region).getByText(label, { selector: '.stat-card__label' }).previousSibling.textContent;
}

const tableRows = () =>
  within(screen.getByRole('table', { name: /Bảng lịch nháp|Lịch phỏng vấn đã xác nhận/ }))
    .getAllByRole('row')
    .slice(1);

async function editRow(buttonName, { start, room }) {
  fireEvent.click(screen.getByRole('button', { name: buttonName }));
  const dialog = await screen.findByRole('dialog');
  const startSelect = within(dialog).getByLabelText('Ca phỏng vấn');
  const startOption = within(startSelect).getByRole('option', { name: start });
  fireEvent.change(startSelect, { target: { value: startOption.value } });
  if (room) {
    const roomSelect = within(dialog).getByLabelText('Phòng');
    fireEvent.change(roomSelect, { target: { value: within(roomSelect).getByRole('option', { name: room }).value } });
  }
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cập nhật ca' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
}

describe('Interview Scheduling', () => {
  it('shows loading, then supports retry after an HTTP failure', async () => {
    setMockApiDelay(50);
    renderApp(PATH, { accountId: EXECUTIVE, scenarioId: 'screening' });
    expect(await screen.findByText('Đang tải dữ liệu…')).toBeInTheDocument();
    await screen.findByRole('heading', { level: 2, name: /^Lịch (nháp|Confirmed)$/ });

    setMockApiDelay(0);
    setMockApiMode('error');
    fireEvent.click(screen.getByRole('button', { name: 'Tạo lại lịch nháp' }));
    const dialog = await screen.findByRole('dialog', { name: 'Tạo lại lịch nháp?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Thay thế lịch nháp' }));
    expect(await screen.findByText('Chưa thực hiện được')).toBeInTheDocument();

    setMockApiMode('normal');
    fireEvent.click(screen.getByRole('button', { name: 'Tạo lại lịch nháp' }));
    const retryDialog = await screen.findByRole('dialog', { name: 'Tạo lại lịch nháp?' });
    fireEvent.click(within(retryDialog).getByRole('button', { name: 'Thay thế lịch nháp' }));
    expect(await screen.findByText('Đã tạo lịch nháp')).toBeInTheDocument();
  });

  it('shows the reference draft with summary counts that match the rows', async () => {
    await openScheduling();

    expect(screen.getByText('Bước 3 / 3 · CLB Công nghệ & Sáng tạo')).toBeInTheDocument();
    expect(stat('Hồ sơ đủ điều kiện')).toBe('4');
    expect(stat('Proposed')).toBe('1');
    expect(stat('Conflict')).toBe('2');
    expect(stat('Unassigned')).toBe('1');
    const statuses = tableRows().map((row) => within(row).getAllByRole('cell')[6].querySelector('.badge').textContent);
    expect(statuses.filter((status) => status === 'Conflict')).toHaveLength(2);
    expect(statuses.filter((status) => status === 'Proposed')).toHaveLength(1);
    expect(statuses.filter((status) => status === 'Unassigned')).toHaveLength(1);
  });

  it('explains real conflicts, including the same applicant across positions (BR-11)', async () => {
    await openScheduling();

    const alert = screen.getByText('2 bản ghi Conflict cần xử lý').closest('.alert');
    expect(within(alert).getByText(/CF-026 · Nguyễn Minh Anh: Chồng giờ với CF-027 của cùng ứng viên/)).toBeInTheDocument();
    expect(within(alert).getByText(/CF-027 · Nguyễn Minh Anh: Chồng giờ với CF-026 của cùng ứng viên/)).toBeInTheDocument();
    expect(screen.getAllByText(/Gia Huy và cả hai phòng đã được xếp/).length).toBeGreaterThan(0);
  });

  it('blocks confirmation and lists each unmet condition (BR-13)', async () => {
    await openScheduling();

    expect(screen.getByRole('button', { name: 'Approve & Confirm Schedule' })).toBeDisabled();
    expect(screen.getByText('Chưa thể xác nhận')).toBeInTheDocument();
    expect(screen.getByText('CF-028 · Trần Bảo Ngọc vẫn đang chờ duyệt.')).toBeInTheDocument();
    expect(screen.getByText('Còn 2 bản ghi Conflict.')).toBeInTheDocument();
    expect(screen.getByText('CF-031 vẫn Unassigned.')).toBeInTheDocument();
    expect(screen.getByText('Đã đóng đơn ngày 30/10/2026.')).toBeInTheDocument();
  });

  it('flags a manual edit that double-books a room', async () => {
    await openScheduling();

    await editRow('Assign Slot CF-031', { start: '09:15–09:30', room: 'A-201' });

    expect(await screen.findByText('Đã cập nhật CF-031: vẫn còn vấn đề')).toBeInTheDocument();
    expect(screen.getAllByText(/Chồng giờ với CF-030 \(cùng phòng A-201\)/).length).toBeGreaterThan(0);
    expect(stat('Unassigned')).toBe('0');
  });

  it('resolves the draft, saves, confirms, and becomes read-only (BR-13, BR-14)', async () => {
    await openScheduling();
    await applicationService.setScreening('CF-028', 'rejected');

    await editRow('Resolve CF-027', { start: '09:15–09:30' });
    await editRow('Assign Slot CF-031', { start: '09:00–09:15', room: 'B-105' });

    expect(stat('Proposed')).toBe('4');
    expect(screen.getByText('Có thay đổi chưa lưu')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByText('Đã lưu lịch nháp')).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'Approve & Confirm Schedule' });
    expect(confirmButton).toBeEnabled();
    fireEvent.click(confirmButton);
    const dialog = await screen.findByRole('dialog', { name: 'Xác nhận lịch phỏng vấn?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Duyệt & xác nhận lịch' }));

    expect(await screen.findByText('Đã xác nhận lịch phỏng vấn')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Lịch Confirmed' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Edit / })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tạo lại lịch nháp' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Xuất lịch' })).toBeEnabled();
  });

  it('summarizes the locked Campaign Interview Setup and still permits draft generation (Q-03)', async () => {
    await openScheduling();

    const configuration = screen.getByRole('region', { name: 'Cấu hình phỏng vấn của chiến dịch' });
    expect(within(configuration).getByText('05/11/2026 · một ngày cho cả chiến dịch')).toBeInTheDocument();
    expect(within(configuration).getByText('09:00–12:00')).toBeInTheDocument();
    expect(within(configuration).getByText('15 phút · dùng chung cho mọi buổi phỏng vấn')).toBeInTheDocument();
    expect(within(configuration).getByText(/đã khóa từ khi chiến dịch được công bố/)).toBeInTheDocument();
    // No form control pretends the campaign configuration could be changed here.
    const page = within(screen.getByRole('main'));
    expect(page.queryAllByRole('combobox')).toEqual([]);
    expect(page.queryAllByRole('textbox')).toEqual([]);

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByText('A-201, B-105')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tạo lại lịch nháp' })).toBeEnabled();
  });

  it('asks before replacing an existing draft', async () => {
    await openScheduling();

    fireEvent.click(screen.getByRole('button', { name: 'Tạo lại lịch nháp' }));

    const dialog = await screen.findByRole('dialog', { name: 'Tạo lại lịch nháp?' });
    expect(within(dialog).getByText(/sẽ bị thay thế/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Hủy' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the confirmed schedule read-only in the confirmed scenario', async () => {
    await openScheduling('confirmed');

    expect(screen.getByText('Confirmed · chỉ đọc')).toBeInTheDocument();
    expect(tableRows()).toHaveLength(4);
    expect(screen.queryByRole('button', { name: 'Approve & Confirm Schedule' })).not.toBeInTheDocument();
    // Rooms are part of the locked schedule now: shown as text, not as disabled checkboxes.
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByText('A-201, B-105')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^(Edit|Resolve|Assign Slot) / })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tạo lại lịch nháp' })).toBeDisabled();
  });

  it('explains the skipped confirmation when no application is shortlisted', async () => {
    renderApp(PATH, { accountId: EXECUTIVE, scenarioId: 'accepting' });

    expect(await screen.findByText('Không có hồ sơ qua vòng CV')).toBeInTheDocument();
    expect(screen.getByText(/bước xác nhận lịch phỏng vấn được bỏ qua \(BR-13\)/)).toBeInTheDocument();
  });
});
