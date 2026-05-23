import { Bell, Mail, MessageSquare, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import type { NotificationSettings } from '@/types/product.types';
import { NOTIFICATION_FREQUENCIES } from '@/utils/constants';
import { cn } from '@/utils/cn';

interface ProductNotificationFormProps {
  settings: NotificationSettings;
  onChange: (settings: NotificationSettings) => void;
  onSave: () => void;
}

const channelConfig = [
  { key: 'email' as const, icon: Mail, labelKey: 'dashboard.product.channels.email' },
  { key: 'sms' as const, icon: MessageSquare, labelKey: 'dashboard.product.channels.sms' },
  { key: 'phone' as const, icon: Phone, labelKey: 'dashboard.product.channels.phone' },
  { key: 'push' as const, icon: Bell, labelKey: 'dashboard.product.channels.push' },
];

export function ProductNotificationForm({
  settings,
  onChange,
  onSave,
}: ProductNotificationFormProps) {
  const { t } = useTranslation();

  function updateChannels(key: keyof NotificationSettings['channels'], value: boolean) {
    onChange({
      ...settings,
      channels: { ...settings.channels, [key]: value },
    });
  }

  function updateTrigger(
    key: keyof NotificationSettings['triggers'],
    value: string,
  ) {
    const num = value === '' ? null : Number(value);
    onChange({
      ...settings,
      triggers: { ...settings.triggers, [key]: num },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('dashboard.product.alertSettings')}</CardTitle>
        <CardDescription>{t('dashboard.product.alertSettingsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-3 block">{t('dashboard.product.notifyVia')}</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {channelConfig.map(({ key, icon: Icon, labelKey }) => {
              const active = settings.channels[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateChannels(key, !active)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/50',
                  )}
                >
                  <Icon className="size-5" />
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="percentDrop">{t('dashboard.product.percentDrop')}</Label>
            <Input
              id="percentDrop"
              type="number"
              min={0}
              placeholder="5"
              value={settings.triggers.percentDrop ?? ''}
              onChange={(e) => updateTrigger('percentDrop', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="percentRise">{t('dashboard.product.percentRise')}</Label>
            <Input
              id="percentRise"
              type="number"
              min={0}
              placeholder="5"
              value={settings.triggers.percentRise ?? ''}
              onChange={(e) => updateTrigger('percentRise', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fixedDrop">{t('dashboard.product.fixedDrop')}</Label>
            <Input
              id="fixedDrop"
              type="number"
              min={0}
              placeholder="10"
              value={settings.triggers.fixedDrop ?? ''}
              onChange={(e) => updateTrigger('fixedDrop', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fixedRise">{t('dashboard.product.fixedRise')}</Label>
            <Input
              id="fixedRise"
              type="number"
              min={0}
              placeholder="10"
              value={settings.triggers.fixedRise ?? ''}
              onChange={(e) => updateTrigger('fixedRise', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('dashboard.product.frequency')}</Label>
          <div className="flex flex-wrap gap-2">
            {NOTIFICATION_FREQUENCIES.map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => onChange({ ...settings, frequency: freq })}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  settings.frequency === freq
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                {t(`dashboard.product.frequencyOptions.${freq}`)}
              </button>
            ))}
          </div>
        </div>

        <Button type="button" onClick={onSave} className="w-full sm:w-auto">
          {t('dashboard.product.saveAlerts')}
        </Button>
      </CardContent>
    </Card>
  );
}
