import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import type { ThemeMode } from '@/store/app.store';
import { cn } from '@/utils/cn';

const modes: { value: ThemeMode; icon: typeof Sun; labelKey: string }[] = [
  { value: 'light', icon: Sun, labelKey: 'common.light' },
  { value: 'dark', icon: Moon, labelKey: 'common.dark' },
  { value: 'system', icon: Monitor, labelKey: 'common.system' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div
      className="inline-flex rounded-lg border border-border bg-card p-1 shadow-sm"
      role="group"
      aria-label={t('common.theme')}
    >
      {modes.map(({ value, icon: Icon, labelKey }) => (
        <Button
          key={value}
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 px-2.5',
            theme === value && 'bg-primary text-primary-foreground hover:bg-primary/90',
          )}
          onClick={() => setTheme(value)}
          aria-pressed={theme === value}
          aria-label={t(labelKey)}
        >
          <Icon className="size-4" />
          <span className="sr-only">{t(labelKey)}</span>
        </Button>
      ))}
    </div>
  );
}
