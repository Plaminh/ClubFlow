import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ScheduleRowDialog from '../../components/organisms/ScheduleRowDialog/index.js';
import { createUiError } from '../../services/uiError.js';

const row = {
  applicationId: 'CF-026',
  applicantName: 'Nguyễn Minh Anh',
  positionName: 'User Experience Design',
  availabilityText: '09:00–10:00',
  status: 'conflict',
  reasons: [],
  start: '2026-11-05T09:00:00+07:00',
  interviewerId: 'iv-hamy',
  roomId: 'room-a201',
};

function dialog(error) {
  return (
    <ScheduleRowDialog
      row={row}
      sessionStarts={[row.start]}
      slotMinutes={15}
      interviewers={[{ id: 'iv-hamy', name: 'Hà My' }]}
      rooms={[{ id: 'room-a201', name: 'A-201' }]}
      busy={false}
      error={error}
      onSubmit={vi.fn()}
      onClose={vi.fn()}
    />
  );
}

describe('ScheduleRowDialog', () => {
  it('moves focus to the first field the service rejected', () => {
    const { rerender } = render(dialog(null));
    const error = createUiError('validation', 'Chưa thể cập nhật ca phỏng vấn.', {
      fieldErrors: { roomId: 'Chọn phòng có sẵn.' },
    });
    rerender(dialog(error));

    expect(screen.getByLabelText('Phòng')).toHaveFocus();
    expect(screen.getByText('Chọn phòng có sẵn.')).toBeInTheDocument();
  });
});
