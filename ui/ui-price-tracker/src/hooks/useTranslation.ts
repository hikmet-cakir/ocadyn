import { translate } from '@/i18n';
import { useAppStore } from '@/store/app.store';

export function useTranslation() {
  const locale = useAppStore((s) => s.locale);

  function t(key: string, params?: Record<string, string>): string {
    return translate(locale, key, params);
  }

  return { t, locale };
}
