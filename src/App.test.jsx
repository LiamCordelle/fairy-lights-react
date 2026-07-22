import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import {
  cancelTimer,
  getActiveStatus,
  getModes,
  getTemperature,
  setMode,
  setTimer,
} from './api';


vi.mock('./api', () => ({
  ApiError: class ApiError extends Error {
    constructor(message, status = null) {
      super(message);
      this.status = status;
    }
  },
  cancelTimer: vi.fn(),
  getActiveStatus: vi.fn(),
  getModes: vi.fn(),
  getTemperature: vi.fn(),
  setMode: vi.fn(),
  setTimer: vi.fn(),
}));

const offStatus = {
  mode: 'OFF',
  onTimer: false,
  offTimer: false,
  transitioning: false,
  timer: null,
  error: null,
};

const onStatus = { ...offStatus, mode: 'ON' };

beforeEach(() => {
  vi.clearAllMocks();
  getModes.mockResolvedValue({ OFF: 'Lights Off', ON: 'Lights On' });
  getActiveStatus.mockResolvedValue(offStatus);
  getTemperature.mockResolvedValue({ available: true, temperature: '21.00' });
  setMode.mockResolvedValue({ status: 'OK' });
  setTimer.mockResolvedValue({ status: 'OK', timer: null });
  cancelTimer.mockResolvedValue({ status: 'OK' });
});

describe('App', () => {
  it('confirms a mode change with server status before marking it active', async () => {
    getActiveStatus.mockResolvedValueOnce(offStatus).mockResolvedValue(onStatus);
    render(<App />);
    await screen.findByText('Controller connected');

    fireEvent.click(screen.getByRole('button', { name: 'Lights On' }));

    await waitFor(() => expect(setMode).toHaveBeenCalledWith('ON'));
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Lights On' }).getAttribute('aria-pressed'),
      ).toBe('true');
    });
  });

  it('shows and cancels the pending timer', async () => {
    const timerStatus = {
      ...offStatus,
      onTimer: true,
      timer: {
        target: 'ON',
        dueAt: '2026-07-22T18:30:00Z',
        fadeSeconds: 0,
      },
    };
    getActiveStatus.mockResolvedValueOnce(timerStatus).mockResolvedValue(offStatus);
    render(<App />);

    const cancelButton = await screen.findByRole('button', { name: 'Cancel timer' });
    fireEvent.click(cancelButton);

    await waitFor(() => expect(cancelTimer).toHaveBeenCalledOnce());
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Cancel timer' })).toBeNull();
    });
  });
});
