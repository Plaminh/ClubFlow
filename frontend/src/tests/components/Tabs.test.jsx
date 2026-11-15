import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import Tabs from '../../components/molecules/Tabs/index.js';

const TABS = [
  { id: 'screening', label: 'CV Screening', marker: 'A' },
  { id: 'results', label: 'Final Results', marker: 'B' },
];

function Harness() {
  const [value, setValue] = useState('screening');
  return <Tabs idPrefix="t" label="Các phần" tabs={TABS} value={value} onChange={setValue} />;
}

describe('Tabs', () => {
  it('exposes a labelled tablist with one selected, focusable tab', () => {
    render(<Harness />);

    expect(screen.getByRole('tablist', { name: 'Các phần' })).toBeInTheDocument();
    const [first, second] = screen.getAllByRole('tab');
    expect(first).toHaveAttribute('aria-selected', 'true');
    expect(first).toHaveAttribute('tabindex', '0');
    expect(second).toHaveAttribute('tabindex', '-1');
    expect(first).toHaveAttribute('aria-controls', 't-panel-screening');
  });

  it('moves selection and focus with arrow keys, wrapping around, and Home/End', () => {
    render(<Harness />);
    const first = screen.getByRole('tab', { name: /CV Screening/ });
    const second = screen.getByRole('tab', { name: /Final Results/ });

    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(second).toHaveAttribute('aria-selected', 'true');
    expect(second).toHaveFocus();

    fireEvent.keyDown(second, { key: 'ArrowRight' });
    expect(first).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(first, { key: 'End' });
    expect(second).toHaveFocus();
    fireEvent.keyDown(second, { key: 'Home' });
    expect(first).toHaveFocus();
  });
});
