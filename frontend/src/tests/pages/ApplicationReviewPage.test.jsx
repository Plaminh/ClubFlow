import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EXECUTIVE, renderApp } from '../helpers/renderApp.jsx';

const PATH = '/executive/review';

async function openScreening(scenarioId = 'screening') {
  renderApp(PATH, { accountId: EXECUTIVE, scenarioId });
  await screen.findByRole('heading', { level: 2, name: 'Tìm và lọc hồ sơ' });
}

const listHeading = () => screen.getByRole('heading', { level: 2, name: /^Hồ sơ · đang hiển thị/ });
function statValue(label) {
  const stats = screen.getByRole('region', { name: 'Thống kê hồ sơ toàn chiến dịch' });
  return within(stats).getByText(label).previousSibling.textContent;
}

describe('Application Review — CV Screening', () => {
  it('shows the reference header, campaign context, and distinct application/applicant counts (BR-06)', async () => {
    await openScreening();

    expect(screen.getByRole('heading', { level: 1, name: 'Application Review' })).toBeInTheDocument();
    expect(screen.getByText(/Đóng đơn 30\/10\/2026/)).toBeInTheDocument();
    expect(statValue('Tổng hồ sơ')).toBe('6');
    expect(statValue('Ứng viên riêng biệt')).toBe('5');
    expect(statValue('Qua vòng CV')).toBe('4');
    expect(statValue('Chờ duyệt + Loại')).toBe('1 + 1');
    expect(screen.getByRole('tab', { name: /CV Screening/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('filters, labels the filtered scope, paginates, and clears filters', async () => {
    await openScreening();
    expect(listHeading()).toHaveTextContent('Hồ sơ · đang hiển thị 1–5 / 6');

    fireEvent.click(screen.getByRole('button', { name: 'Trang sau →' }));
    await waitFor(() => expect(listHeading()).toHaveTextContent('6–6 / 6'));
    expect(screen.getByText('Trang 2 / 2')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Vị trí'), { target: { value: 'pos-content' } });
    await waitFor(() => expect(listHeading()).toHaveTextContent('1–3 / 3'));
    expect(screen.getByText('Theo bộ lọc: 3 hồ sơ · 3 ứng viên riêng biệt.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Tìm tên hoặc mã hồ sơ'), { target: { value: 'không có ai' } });
    expect(await screen.findByText('Không có hồ sơ phù hợp bộ lọc')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }));
    await waitFor(() => expect(listHeading()).toHaveTextContent('1–5 / 6'));
  });

  it('opens details beside the list with SOP, CV link, and the private note; closing keeps filters', async () => {
    await openScreening();
    fireEvent.change(screen.getByLabelText('Sắp xếp'), { target: { value: 'oldest' } });
    fireEvent.click(await screen.findByRole('button', { name: 'Review CF-026 · Nguyễn Minh Anh' }));

    const detail = (await screen.findByRole('heading', { level: 2, name: 'CF-026 · Nguyễn Minh Anh' })).closest('article');
    expect(within(detail).getByText('Bài trình bày nguyện vọng · bản đầy đủ')).toBeInTheDocument();
    expect(within(detail).getByRole('link', { name: 'Mở CV mẫu hư cấu (PDF)' })).toHaveAttribute(
      'href',
      '/demo/fictional-sample-cv.pdf',
    );
    expect(within(detail).getByLabelText('Ghi chú nội bộ · chỉ Ban tuyển dụng nhìn thấy')).toHaveValue(
      'Có kinh nghiệm nghiên cứu người dùng; cần hỏi thêm cách ưu tiên phản hồi khi các nhóm người dùng có nhu cầu khác nhau.',
    );
    expect(within(detail).getByText(/hồ sơ CF-027 được duyệt độc lập/)).toBeInTheDocument();
    expect(within(detail).getByRole('button', { name: 'Shortlist Candidate' })).toBeDisabled();

    fireEvent.click(within(detail).getByRole('button', { name: '× Đóng chi tiết' }));
    expect(screen.queryByRole('heading', { name: 'CF-026 · Nguyễn Minh Anh' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Sắp xếp')).toHaveValue('oldest');
  });

  it('shortlists only the selected application and updates the statistics (BR-07)', async () => {
    await openScreening();
    fireEvent.change(screen.getByLabelText('Trạng thái'), { target: { value: 'pendingReview' } });
    fireEvent.click(await screen.findByRole('button', { name: 'Review CF-028 · Trần Bảo Ngọc' }));
    const detail = (await screen.findByRole('heading', { level: 2, name: 'CF-028 · Trần Bảo Ngọc' })).closest('article');

    fireEvent.click(within(detail).getByRole('button', { name: 'Shortlist Candidate' }));

    expect(await screen.findByText('CF-028 đã qua vòng CV')).toBeInTheDocument();
    await waitFor(() => expect(statValue('Chờ duyệt + Loại')).toBe('0 + 1'));
    expect(statValue('Qua vòng CV')).toBe('5');
    expect(statValue('Ứng viên riêng biệt')).toBe('5');
  });

  it('asks for confirmation before rejecting', async () => {
    await openScreening();
    fireEvent.change(screen.getByLabelText('Trạng thái'), { target: { value: 'pendingReview' } });
    fireEvent.click(await screen.findByRole('button', { name: 'Review CF-028 · Trần Bảo Ngọc' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Loại hồ sơ' }));

    const dialog = await screen.findByRole('dialog', { name: 'Loại hồ sơ CF-028?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Loại hồ sơ' }));

    expect(await screen.findByText('CF-028 đã bị loại ở vòng CV')).toBeInTheDocument();
  });

  it('exports CSV for the current filter', async () => {
    const createObjectURL = vi.fn(() => 'blob:demo');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL }));
    await openScreening();
    fireEvent.change(screen.getByLabelText('Trạng thái'), { target: { value: 'shortlisted' } });
    await waitFor(() => expect(listHeading()).toHaveTextContent('1–4 / 4'));

    fireEvent.click(screen.getByRole('button', { name: 'Xuất CSV' }));

    expect(await screen.findByText('Đã xuất 4 hồ sơ theo bộ lọc hiện tại (mô phỏng)')).toBeInTheDocument();
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it('makes screening decisions read-only after schedule confirmation (BR-14)', async () => {
    await openScreening('confirmed');
    fireEvent.change(screen.getByLabelText('Sắp xếp'), { target: { value: 'oldest' } });
    fireEvent.click(await screen.findByRole('button', { name: 'Review CF-026 · Nguyễn Minh Anh' }));

    expect(await screen.findByText(/quyết định vòng CV đã khóa \(BR-14\)/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Loại hồ sơ' })).toBeDisabled();
  });

  it('shows an empty state when there are no applications yet', async () => {
    renderApp(PATH, { accountId: EXECUTIVE, scenarioId: 'before-open' });

    expect(await screen.findByText('Chưa có hồ sơ nào')).toBeInTheDocument();
  });

  it('shows an error with retry when the network fails', async () => {
    const { setSimulation } = await import('../../mocks/store.js');
    setSimulation('error');
    renderApp(PATH, { accountId: EXECUTIVE });

    expect(await screen.findByText('Không tải được dữ liệu')).toBeInTheDocument();
    setSimulation('normal');
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Tìm và lọc hồ sơ' })).toBeInTheDocument();
  });
});
