import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { FavoritesPage } from '@/components/dashboard/FavoritesPage';
import { HelpPage } from '@/components/dashboard/HelpPage';
import { NotificationsPage } from '@/components/dashboard/NotificationsPage';
import { ProductsPage } from '@/components/dashboard/ProductsPage';
import { ReportsPage } from '@/components/dashboard/ReportsPage';
import { SettingsPage } from '@/components/dashboard/SettingsPage';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useTranslation } from '@/hooks/useTranslation';

export type DashboardPageId =
  | 'home'
  | 'products'
  | 'favorites'
  | 'notifications'
  | 'reports'
  | 'settings'
  | 'help';

interface DashboardPageProps {
  page: DashboardPageId;
}

const titleKeys: Record<DashboardPageId, string> = {
  home: 'nav.home',
  products: 'nav.watchlist',
  favorites: 'nav.favorites',
  notifications: 'nav.notifications',
  reports: 'nav.reports',
  settings: 'nav.settings',
  help: 'nav.help',
};

function DashboardContent({ page }: { page: DashboardPageId }) {
  switch (page) {
    case 'home':
      return <DashboardHome />;
    case 'products':
      return <ProductsPage />;
    case 'favorites':
      return <FavoritesPage />;
    case 'notifications':
      return <NotificationsPage />;
    case 'reports':
      return <ReportsPage />;
    case 'settings':
      return <SettingsPage />;
    case 'help':
      return <HelpPage />;
    default:
      return <DashboardHome />;
  }
}

export function DashboardPage({ page }: DashboardPageProps) {
  const { t } = useTranslation();

  return (
    <AuthGuard>
      <DashboardShell title={t(titleKeys[page])}>
        <DashboardContent page={page} />
      </DashboardShell>
    </AuthGuard>
  );
}
