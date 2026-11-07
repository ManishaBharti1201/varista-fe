const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const toDateOnlyString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const todayDateOnly = (): string => toDateOnlyString(new Date());

export const parseDateOnly = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const isoMatch = value.match(DATE_ONLY_PATTERN);
  let year: number;
  let month: number;
  let day: number;

  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else {
    const displayMatch = value.match(/^(\d{1,2})[ /-]([A-Za-z]{3}|\d{1,2})[ /-](\d{4})$/);
    if (!displayMatch) return null;

    year = Number(displayMatch[3]);
    day = Number(displayMatch[1]);
    if (/^\d+$/.test(displayMatch[2])) {
      month = Number(displayMatch[2]);
    } else {
      month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        .indexOf(displayMatch[2].toLowerCase()) + 1;
    }
  }

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
};

export const formatDateOnly = (
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const date = parseDateOnly(value);
  if (!date) return value || 'N/A';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options
  }).format(date);
};

const parseTimestamp = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  if (DATE_ONLY_PATTERN.test(value)) return null;
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
  const isoValue = value.includes('T') ? value : value.replace(' ', 'T');
  const timestamp = new Date(hasTimezone ? isoValue : `${isoValue}Z`);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp;
};

export const formatTimestamp = (value: string | null | undefined): string => {
  if (value && DATE_ONLY_PATTERN.test(value)) return formatDateOnly(value);
  const timestamp = parseTimestamp(value);
  if (!timestamp) return value || 'N/A';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).format(timestamp);
};

export const formatTimestampDate = (value: string | null | undefined): string => {
  if (value && DATE_ONLY_PATTERN.test(value)) return formatDateOnly(value);
  const timestamp = parseTimestamp(value);
  if (!timestamp) return value || 'N/A';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(timestamp);
};

export const formatClockTime = (value: string | null | undefined): string => {
  if (!value) return '--:--';
  const isoMatch = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (isoMatch) {
    const hour = Number(isoMatch[1]);
    const minute = Number(isoMatch[2]);
    if (hour < 24 && minute < 60) {
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }
  }

  const twelveHourMatch = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    const inputHour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2]);
    if (inputHour >= 1 && inputHour <= 12 && minute < 60) {
      const hour = (inputHour % 12) + (twelveHourMatch[3].toUpperCase() === 'PM' ? 12 : 0);
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }
  }

  return value || '--:--';
};
