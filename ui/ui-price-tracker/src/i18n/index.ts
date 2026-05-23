import en from '@/i18n/en.json';
import tr from '@/i18n/tr.json';
import type { SupportedLocale } from '@/utils/constants';

const dictionaries = { en, tr } as const;

export type TranslationKey = string;

function resolvePath(obj: Record<string, unknown>, path: string): string | undefined {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj) as string | undefined;
}

export function translate(
  locale: SupportedLocale,
  key: TranslationKey,
  params?: Record<string, string>,
): string {
  const dictionary = dictionaries[locale];
  let text = resolvePath(dictionary as Record<string, unknown>, key) ?? key;
  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replaceAll(`{{${paramKey}}}`, value);
    }
  }
  return text;
}

export function getDictionary(locale: SupportedLocale) {
  return dictionaries[locale];
}
