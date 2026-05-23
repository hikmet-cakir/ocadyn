export const APP_NAME = 'OCADYN';

export const BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
} as const;

export const MARKETPLACES = [
  'Amazon',
  'Trendyol',
  'Hepsiburada',
  'N11',
  'Walmart',
  'Alibaba',
  'Sahibinden',
] as const;

export const NOTIFICATION_FREQUENCIES = [
  'hourly',
  '6h',
  '12h',
  'daily',
  'weekly',
] as const;

export const SUPPORTED_LOCALES = ['en', 'tr'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const STORAGE_KEYS = {
  theme: 'ocadyn-theme',
  locale: 'ocadyn-locale',
} as const;
