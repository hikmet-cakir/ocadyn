import { useEffect, useState, type ReactNode } from 'react';
import { MobileNav } from '@/components/layout/MobileNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

interface DashboardShellProps {
  children: ReactNode;
  title: string;
}

export function DashboardShell({ children, title }: DashboardShellProps) {
  const [pathname, setPathname] = useState('/dashboard');

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar pathname={pathname} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} />
        <main className="flex-1 pb-20 md:pb-0">
          <PageContainer>{children}</PageContainer>
        </main>
      </div>
      <MobileNav pathname={pathname} />
    </div>
  );
}
