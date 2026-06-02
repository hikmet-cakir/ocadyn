import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

export function useGuestRedirect(redirectTo = '/dashboard') {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      window.location.replace(redirectTo);
    }
  }, [isHydrated, isAuthenticated, redirectTo]);

  return {
    isHydrated,
    isAuthenticated,
    shouldRender: isHydrated && !isAuthenticated,
  };
}
