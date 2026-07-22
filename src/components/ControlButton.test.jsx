import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ControlButton from './ControlButton';


describe('ControlButton', () => {
  it('uses button semantics and exposes pressed state', () => {
    const onClick = vi.fn();
    render(
      <ControlButton
        active
        disabled={false}
        displayName="Lights On"
        mode="ON"
        onClick={onClick}
      />,
    );

    const button = screen.getByRole('button', { name: 'Lights On' });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not trigger while disabled', () => {
    const onClick = vi.fn();
    render(
      <ControlButton
        active={false}
        disabled
        displayName="Lights Off"
        mode="OFF"
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Lights Off' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
