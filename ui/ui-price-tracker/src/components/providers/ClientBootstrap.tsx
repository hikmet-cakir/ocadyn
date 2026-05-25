import { useEffect } from 'react';
import { setAuthToken } from '@/lib/api-client';
import { useAppStore } from '@/store/app.store';
import { useAuthStore } from '@/store/auth.store';
import { useTheme } from '@/hooks/useTheme';

export function ClientBootstrap() {
  useTheme();

  useEffect(() => {
    async function bootstrap() {
      await useAppStore.persist.rehydrate();
      await useAuthStore.persist.rehydrate();

      const { token, restoreSession } = useAuthStore.getState();
      if (token) {
        setAuthToken(token);
        await restoreSession();
      }

      useAuthStore.getState().setHydrated();
    }

    void bootstrap();
  }, []);

  return null;
}
