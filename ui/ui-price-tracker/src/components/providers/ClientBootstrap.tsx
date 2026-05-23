import { useEffect } from 'react';
import { useAppStore } from '@/store/app.store';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { useProductsStore } from '@/store/products.store';
import { useTheme } from '@/hooks/useTheme';

export function ClientBootstrap() {
  useTheme();

  useEffect(() => {
    void useAppStore.persist.rehydrate();
    void useAuthStore.persist.rehydrate();
    void useProductsStore.persist.rehydrate();
    void useNotificationsStore.persist.rehydrate();
  }, []);

  return null;
}
