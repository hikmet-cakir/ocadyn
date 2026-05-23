import { useEffect, type ReactNode } from 'react';
import { useAppStore } from '@/store/app.store';
import { useTheme } from '@/hooks/useTheme';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  useTheme();

  useEffect(() => {
    void useAppStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
