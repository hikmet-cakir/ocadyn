import { useEffect } from 'react';
import { useAppStore, type ThemeMode } from '@/store/app.store';

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return mode;
}

export function useTheme() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  useEffect(() => {
    const root = document.documentElement;
    const resolved = resolveTheme(theme);

    root.classList.remove('light', 'dark');
    root.classList.add(resolved);

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
        root.classList.remove('light', 'dark');
        root.classList.add(resolveTheme('system'));
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  return { theme, setTheme };
}
