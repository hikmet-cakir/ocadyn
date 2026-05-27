import { useEffect, useState, type ReactNode } from 'react';
import { MobileNav } from '@/components/layout/MobileNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar, type BreadcrumbItem } from '@/components/layout/Topbar';

interface DashboardShellProps {
  children: ReactNode;
  title: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function DashboardShell({ children, title, breadcrumbs }: DashboardShellProps) {
  const [pathname, setPathname] = useState('/dashboard');

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  return (
    <div className="flex min-h-screen items-stretch dashboard-page-bg">
      <Sidebar pathname={pathname} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} breadcrumbs={breadcrumbs} />
        <main className="flex-1 pb-20 md:pb-0">
          <PageContainer>{children}</PageContainer>
        </main>
      </div>
      <MobileNav pathname={pathname} />
    </div>
  );
}
