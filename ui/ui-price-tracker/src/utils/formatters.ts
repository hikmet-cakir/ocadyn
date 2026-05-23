export function formatPrice(
  value: number,
  currency = 'USD',
  locale = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, locale = 'en-US'): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value / 100)}`;
}

export function formatRelativeTime(date: string | Date, locale = 'en-US'): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  const now = Date.now();
  const diffMs = target.getTime() - now;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const units: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
    { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: 'day', ms: 1000 * 60 * 60 * 24 },
    { unit: 'hour', ms: 1000 * 60 * 60 },
    { unit: 'minute', ms: 1000 * 60 },
  ];

  for (const { unit, ms } of units) {
    if (Math.abs(diffMs) >= ms || unit === 'minute') {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }

  return rtf.format(0, 'minute');
}
