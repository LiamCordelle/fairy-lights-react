import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, requestJson, setMode, setTimer } from './api';


afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('API client', () => {
  it('uses POST for mode changes', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'OK' }),
    });

    await setMode('FADE_FAST');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/activeMode/FADE_FAST'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sends timer values as JSON', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'OK', timer: {} }),
    });

    await setTimer('on', 15, 3);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/timer/on'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ minutes: 15, fadePeriod: 3 }),
      }),
    );
  });

  it('surfaces a JSON API error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ status: 'FAIL', error: 'controller is busy' }),
    });

    await expect(requestJson('/activeMode')).rejects.toMatchObject({
      message: 'controller is busy',
      status: 409,
    });
  });

  it('turns a stalled request into a timeout error', async () => {
    vi.useFakeTimers();
    vi.spyOn(global, 'fetch').mockImplementation((_url, options) =>
      new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => {
          const error = new Error('aborted');
          error.name = 'AbortError';
          reject(error);
        });
      }));

    const request = requestJson('/slow', {}, 100);
    const assertion = expect(request).rejects.toEqual(
      new ApiError('The controller did not respond in time.'),
    );
    await vi.advanceTimersByTimeAsync(100);

    await assertion;
  });
});
