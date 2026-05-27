import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import type { ThemeMode } from '@/store/app.store';

const cycle: ThemeMode[] = ['light', 'dark', 'system'];

const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const Icon = icons[theme];

  function handleCycle() {
    const index = cycle.indexOf(theme);
    const next = cycle[(index + 1) % cycle.length];
    setTheme(next);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="topbar-icon-btn size-10 rounded-xl shadow-sm"
      onClick={handleCycle}
      aria-label={t('common.theme')}
    >
      <Icon className="size-[18px]" />
    </Button>
  );
}
