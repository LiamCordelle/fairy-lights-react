import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import { calculateMinutesUntil } from './timerUtils';


describe('calculateMinutesUntil', () => {
  it('rounds a future time up to the next whole minute', () => {
    const now = dayjs('2026-07-22T10:00:30');
    const selected = dayjs('2026-07-22T10:05:00');

    expect(calculateMinutesUntil(selected, now)).toBe(5);
  });

  it('treats a time in an earlier minute as tomorrow', () => {
    const now = dayjs('2026-07-22T23:30:00');
    const selected = dayjs('2026-07-22T07:15:00');

    expect(calculateMinutesUntil(selected, now)).toBe(465);
  });

  it('allows the current minute as an immediate timer', () => {
    const now = dayjs('2026-07-22T10:00:30');
    const selected = dayjs('2026-07-22T10:00:00');

    expect(calculateMinutesUntil(selected, now)).toBe(0);
  });

  it('rejects a missing time', () => {
    expect(() => calculateMinutesUntil(null)).toThrow('Choose a valid timer time.');
  });
});
