import { useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/store/auth.store';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.replace(`/login?redirect=${redirect}`);
      return;
    }

    setChecked(true);
  }, [isHydrated, isAuthenticated]);

  if (!isHydrated || !checked) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
