import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ScheduleSettingsCard from '../../components/organisms/ScheduleSettingsCard/index.js';

const settings = { interviewDate: '2026-12-02', interviewWindow: { start: '09:00', end: '12:00' }, slotMinutes: 30, roomIds: ['room-a201'] };
const rooms = [{ id: 'room-a201', name: 'A-201' }];

function renderCard(props = {}) {
  const onGenerate = vi.fn();
  const view = render(
    <ScheduleSettingsCard settings={settings} rooms={rooms} closesOn="2026-11-30" hasDraft={false} roomsReadOnly onGenerate={onGenerate} {...props} />,
  );
  return { onGenerate, ...view };
}

describe('ScheduleSettingsCard (C8 draft settings)', () => {
  it('sends the contract body built from the chosen values', () => {
    const { onGenerate } = renderCard();
    fireEvent.change(screen.getByLabelText('Giờ kết thúc'), { target: { value: '11:00' } });
    fireEvent.change(screen.getByLabelText('Thời lượng mỗi ca'), { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo lịch nháp' }));
    expect(onGenerate).toHaveBeenCalledWith({ interviewDate: '2026-12-02', interviewWindow: { start: '09:00', end: '11:00' }, slotMinutes: 20 });
  });

  it('refuses a window too short for one interview without sending', () => {
    const { onGenerate } = renderCard();
    fireEvent.change(screen.getByLabelText('Giờ kết thúc'), { target: { value: '09:15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo lịch nháp' }));
    expect(screen.getByLabelText('Giờ kết thúc')).toHaveAccessibleDescription('Khoảng giờ phải đủ cho ít nhất một ca 30 phút.');
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it('shows a 400 from the API on the matching field until that field changes', () => {
    const { rerender, onGenerate } = renderCard();
    const apiError = { message: 'Schedule settings are invalid.', fieldErrors: { interviewWindow: 'The window must fit at least one interview.', slotMinutes: 'Must be 15, 20, or 30.' } };
    rerender(<ScheduleSettingsCard settings={settings} rooms={rooms} closesOn="2026-11-30" hasDraft roomsReadOnly apiError={apiError} onGenerate={onGenerate} />);

    expect(screen.getByLabelText('Giờ kết thúc')).toHaveAccessibleDescription('The window must fit at least one interview.');
    expect(screen.getByLabelText('Thời lượng mỗi ca')).toHaveAccessibleDescription(/Must be 15, 20, or 30\./);

    fireEvent.change(screen.getByLabelText('Thời lượng mỗi ca'), { target: { value: '15' } });
    expect(screen.getByLabelText('Thời lượng mỗi ca')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText('Giờ kết thúc')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText('Giờ bắt đầu')).toHaveValue('09:00');
  });
});
