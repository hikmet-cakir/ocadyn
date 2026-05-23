import {
  BarChart3,
  Bell,
  Heart,
  HelpCircle,
  Home,
  Package,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

export const dashboardNavItems: NavItem[] = [
  { href: '/dashboard', labelKey: 'nav.home', icon: Home },
  { href: '/dashboard/products', labelKey: 'nav.watchlist', icon: Package },
  { href: '/dashboard/favorites', labelKey: 'nav.favorites', icon: Heart },
  { href: '/dashboard/notifications', labelKey: 'nav.notifications', icon: Bell },
  { href: '/dashboard/reports', labelKey: 'nav.reports', icon: BarChart3 },
  { href: '/dashboard/settings', labelKey: 'nav.settings', icon: Settings },
  { href: '/dashboard/help', labelKey: 'nav.help', icon: HelpCircle },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/dashboard/';
  }
  return pathname.startsWith(href);
}
