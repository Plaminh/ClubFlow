import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Button from '../../components/atoms/Button/index.js';
import Badge from '../../components/atoms/Badge/index.js';

describe('Button', () => {
  it('renders its label as a button that does not submit forms by default', () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button');
  });

  it('applies the reference variants', () => {
    render(
      <>
        <Button variant="secondary">Lưu bản nháp</Button>
        <Button variant="danger">Loại hồ sơ</Button>
      </>,
    );

    expect(screen.getByRole('button', { name: 'Lưu bản nháp' })).toHaveClass('button', 'button--secondary');
    expect(screen.getByRole('button', { name: 'Loại hồ sơ' })).toHaveClass('button--danger');
  });

  it('renders a router link when given `to`', () => {
    render(
      <MemoryRouter>
        <Button to="/executive/review">Mở Application Review →</Button>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Mở Application Review →' })).toHaveAttribute('href', '/executive/review');
  });
});

describe('Badge', () => {
  it('shows its text so status never depends on color alone', () => {
    render(<Badge tone="success">Qua vòng CV</Badge>);

    expect(screen.getByText('Qua vòng CV')).toHaveClass('badge', 'badge--success');
  });
});
