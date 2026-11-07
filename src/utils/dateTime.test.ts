import {
  formatClockTime,
  formatDateOnly,
  formatTimestamp,
  parseDateOnly,
  toDateOnlyString
} from './dateTime';

describe('date-only helpers', () => {
  it('round-trips an ISO calendar date without timezone conversion', () => {
    const date = parseDateOnly('2025-12-15');

    if (!date) throw new Error('Expected a valid parsed date');
    expect(toDateOnlyString(date)).toBe('2025-12-15');
    expect(formatDateOnly('2025-12-15')).toBe('15 Dec 2025');
  });

  it('accepts legacy display dates but rejects invalid calendar dates', () => {
    const date = parseDateOnly('15 Dec 2025');
    if (!date) throw new Error('Expected a valid parsed display date');
    expect(toDateOnlyString(date)).toBe('2025-12-15');
    expect(parseDateOnly('2025-02-30')).toBeNull();
  });
});

describe('attendance time formatting', () => {
  it('normalizes 12-hour and 24-hour times to HH:mm', () => {
    expect(formatClockTime('9:05 AM')).toBe('09:05');
    expect(formatClockTime('9:05 PM')).toBe('21:05');
    expect(formatClockTime('09:05:00')).toBe('09:05');
  });
});

describe('timestamp formatting', () => {
  it('formats date-only legacy values without converting them to another day', () => {
    expect(formatTimestamp('2025-12-15')).toBe('15 Dec 2025');
  });

  it('renders UTC timestamps in the runtime device timezone', () => {
    const instant = '2025-12-15T12:05:00Z';
    const expected = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).format(new Date(instant));

    expect(formatTimestamp(instant)).toBe(expected);
  });
});
