import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ScheduleTable from '../../components/organisms/ScheduleTable/index.js';

const row = {
  applicationId: 'A01',
  applicantName: 'Nguyen Minh Anh',
  positionName: 'Content',
  availabilityText: '09:00-10:00, 10:00-11:00',
  start: '2026-12-02T09:00:00+07:00',
  end: '2026-12-02T09:30:00+07:00',
  interviewerName: 'Gia Huy',
  roomName: 'A-201',
  status: 'proposed',
  reasons: [],
};

describe('ScheduleTable', () => {
  it('shows the applicant availability the API sends for each row', () => {
    render(<ScheduleTable rows={[row]} readOnly caption="Draft" onEdit={() => {}} />);
    expect(screen.getByText('09:00-10:00, 10:00-11:00')).toBeInTheDocument();
  });
});
