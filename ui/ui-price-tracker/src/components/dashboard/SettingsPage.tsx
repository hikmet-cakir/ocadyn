import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/utils/cn';

const tabs = ['profile', 'notifications', 'security', 'appearance'] as const;
type SettingsTab = (typeof tabs)[number];

export function SettingsPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<SettingsTab>('profile');
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">{t('nav.settings')}</h2>
        <p className="text-muted-foreground">{t('dashboard.settings.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex flex-row flex-wrap gap-2 lg:w-48 lg:flex-col">
          {tabs.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors',
                tab === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {t(`dashboard.settings.tabs.${id}`)}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {tab === 'profile' ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.settings.tabs.profile')}</CardTitle>
                <CardDescription>{t('dashboard.settings.profileDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-name">{t('auth.fields.name')}</Label>
                  <Input
                    id="settings-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-email">{t('auth.fields.email')}</Label>
                  <Input
                    id="settings-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="button">{t('dashboard.settings.save')}</Button>
              </CardContent>
            </Card>
          ) : null}

          {tab === 'notifications' ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.settings.tabs.notifications')}</CardTitle>
                <CardDescription>{t('dashboard.settings.notificationsDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t('dashboard.comingSoon')}</p>
              </CardContent>
            </Card>
          ) : null}

          {tab === 'security' ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.settings.tabs.security')}</CardTitle>
                <CardDescription>{t('dashboard.settings.securityDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t('auth.fields.password')}</Label>
                  <Input id="new-password" type="password" />
                </div>
                <Button type="button" variant="outline">
                  {t('dashboard.settings.changePassword')}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {tab === 'appearance' ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.settings.tabs.appearance')}</CardTitle>
                <CardDescription>{t('dashboard.settings.appearanceDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-4">
                <ThemeToggle />
                <LanguageSwitcher />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
