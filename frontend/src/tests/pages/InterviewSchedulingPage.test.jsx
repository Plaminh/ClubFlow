import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as applicationService from '../../services/applicationService.js';
import * as demoSessionService from '../../services/demoSessionService.js';
import { EXECUTIVE, renderApp } from '../helpers/renderApp.jsx';

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

    expect(screen.getByRole('button', { name: 'Duyệt & xác nhận lịch' })).toBeDisabled();
    expect(screen.getByText('Chưa thể xác nhận')).toBeInTheDocument();
    expect(screen.getByText('CF-028 · Trần Bảo Ngọc vẫn đang chờ duyệt.')).toBeInTheDocument();
    expect(screen.getByText('Còn 2 bản ghi Conflict.')).toBeInTheDocument();
    expect(screen.getByText('CF-031 vẫn Unassigned.')).toBeInTheDocument();
    expect(screen.getByText('Đã đóng đơn ngày 30/10/2026.')).toBeInTheDocument();
  });

  it('flags a manual edit that double-books a room', async () => {
    await openScheduling();

    await editRow('Gán khung giờ CF-031', { start: '09:15–09:30', room: 'A-201' });

    expect(await screen.findByText('Đã cập nhật CF-031: vẫn còn vấn đề')).toBeInTheDocument();
    expect(screen.getAllByText(/Chồng giờ với CF-030 \(cùng phòng A-201\)/).length).toBeGreaterThan(0);
    expect(stat('Unassigned')).toBe('0');
  });

  it('resolves the draft, saves, confirms, and becomes read-only (BR-13, BR-14)', async () => {
    demoSessionService.restoreDemoState({ accountId: EXECUTIVE });
    await applicationService.setScreening('CF-028', 'rejected');
    await openScheduling();

    await editRow('Sửa CF-027', { start: '09:15–09:30' });
    await editRow('Gán khung giờ CF-031', { start: '09:00–09:15', room: 'B-105' });

    expect(stat('Proposed')).toBe('4');
    expect(screen.getByText('Có thay đổi chưa lưu')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(await screen.findByText('Đã lưu lịch nháp (mô phỏng)')).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'Duyệt & xác nhận lịch' });
    expect(confirmButton).toBeEnabled();
    fireEvent.click(confirmButton);
    const dialog = await screen.findByRole('dialog', { name: 'Xác nhận lịch phỏng vấn?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Duyệt & xác nhận lịch' }));

    expect(await screen.findByText('Đã xác nhận lịch phỏng vấn (mô phỏng)')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Lịch Confirmed' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Sửa / })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tạo lại lịch nháp' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Xuất lịch' })).toBeEnabled();
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
    expect(screen.queryByRole('button', { name: 'Duyệt & xác nhận lịch' })).not.toBeInTheDocument();
  });

  it('explains the skipped confirmation when no application is shortlisted', async () => {
    renderApp(PATH, { accountId: EXECUTIVE, scenarioId: 'accepting' });

    expect(await screen.findByText('Không có hồ sơ qua vòng CV')).toBeInTheDocument();
    expect(screen.getByText(/bước xác nhận lịch phỏng vấn được bỏ qua \(BR-13\)/)).toBeInTheDocument();
  });
});
