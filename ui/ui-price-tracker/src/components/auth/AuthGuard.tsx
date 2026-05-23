import { useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/store/auth.store';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const finish = () => setReady(true);
    if (useAuthStore.persist.hasHydrated()) {
      finish();
      return;
    }
    return useAuthStore.persist.onFinishHydration(finish);
  }, []);

  useEffect(() => {
    if (ready && !isAuthenticated) {
      window.location.replace('/login?redirect=/dashboard');
    }
  }, [ready, isAuthenticated]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
