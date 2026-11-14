import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ClubFlowOverview from '../../components/organisms/ClubFlowOverview/index.js';

describe('ClubFlowOverview', () => {
  it('shows the ClubFlow development preview branding and the API status', () => {
    render(<ClubFlowOverview apiStatus="online" errorMessage="" />);

    expect(screen.getByText('ClubFlow · Development Preview')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /ClubFlow/ })).toBeInTheDocument();
    expect(screen.getByText('API connected')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the error message when the API is unavailable', () => {
    render(<ClubFlowOverview apiStatus="offline" errorMessage="Network error" />);

    expect(screen.getByText('API unavailable')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Network error');
  });
});
