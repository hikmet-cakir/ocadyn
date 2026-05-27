import { useState } from 'react';
import { Bell, Mail, MessageSquare, Phone, TrendingDown, X } from 'lucide-react';
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
  formKey?: string;
}

const channelConfig = [
  { key: 'email' as const, icon: Mail, labelKey: 'dashboard.product.channels.email', supported: true, required: false },
  { key: 'sms' as const, icon: MessageSquare, labelKey: 'dashboard.product.channels.sms', supported: false, required: false },
  { key: 'phone' as const, icon: Phone, labelKey: 'dashboard.product.channels.phone', supported: false, required: false },
  { key: 'push' as const, icon: Bell, labelKey: 'dashboard.product.channels.push', supported: true, required: true },
];

export function ProductNotificationForm({
  settings,
  onChange,
  onSave,
}: ProductNotificationFormProps) {
  const { t } = useTranslation();
  const [unsupportedOpen, setUnsupportedOpen] = useState(false);
  const [pushRequiredError, setPushRequiredError] = useState('');

  function handleInstantAlertsToggle(enabled: boolean) {
    onChange({
      ...settings,
      instantAlertsEnabled: enabled,
      triggers: enabled
        ? settings.triggers
        : {
            percentDrop: null,
            percentRise: null,
            fixedDrop: null,
            fixedRise: null,
          },
    });
  }

  function handleChannelClick(key: keyof NotificationSettings['channels'], supported: boolean) {
    if (!supported) {
      setUnsupportedOpen(true);
      return;
    }
    updateChannels(key, !settings.channels[key]);
  }

  function updateChannels(key: keyof NotificationSettings['channels'], value: boolean) {
    if (key === 'push' && !value) {
      setPushRequiredError(t('dashboard.product.channels.pushRequired'));
      return;
    }
    setPushRequiredError('');
    onChange({
      ...settings,
      channels: { ...settings.channels, [key]: value },
    });
  }

  function handleSaveClick() {
    if (!settings.channels.push) {
      setPushRequiredError(t('dashboard.product.channels.pushRequired'));
      return;
    }
    setPushRequiredError('');
    onSave();
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('dashboard.product.alertSettings')}</CardTitle>
          <CardDescription>{t('dashboard.product.alertSettingsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-3 block">{t('dashboard.product.notifyVia')}</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {channelConfig.map(({ key, icon: Icon, labelKey, supported, required }) => {
              const active = supported && settings.channels[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChannelClick(key, supported)}
                  className={cn(
                    'relative flex flex-col items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : supported
                        ? 'border-border bg-background text-muted-foreground hover:border-primary/50'
                        : 'cursor-not-allowed border-border/70 bg-muted/40 text-muted-foreground/80 hover:border-border',
                    required && !active && pushRequiredError ? 'border-destructive/60' : null,
                  )}
                >
                  <Icon className="size-5" />
                  {t(labelKey)}
                  {required ? (
                    <span className="text-[10px] font-normal text-muted-foreground">
                      {t('dashboard.product.channels.required')}
                    </span>
                  ) : null}
                  {!supported ? (
                      <span className="absolute -top-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {t('dashboard.product.channels.soon')}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {pushRequiredError ? (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {pushRequiredError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>{t('dashboard.product.frequency')}</Label>
            <p className="text-xs text-muted-foreground">{t('dashboard.product.frequencyHint')}</p>
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

          <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <TrendingDown className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <Label htmlFor="instant-price-alerts" className="text-base font-semibold leading-tight">
                {t('dashboard.product.priceChangeAlerts')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.product.priceChangeAlertsHint')}
              </p>
            </div>
            <button
              id="instant-price-alerts"
              type="button"
              role="switch"
              aria-checked={settings.instantAlertsEnabled}
              onClick={() => handleInstantAlertsToggle(!settings.instantAlertsEnabled)}
              className={cn(
                'relative mt-0.5 inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                settings.instantAlertsEnabled ? 'bg-primary' : 'bg-muted',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none block size-6 rounded-full bg-background shadow-md transition-transform',
                  settings.instantAlertsEnabled ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>

          {settings.instantAlertsEnabled ? (
            <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">{t('dashboard.product.triggersHint')}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="percentDrop">{t('dashboard.product.percentDrop')}</Label>
                  <Input
                    id="percentDrop"
                    type="number"
                    min={0}
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
                    value={settings.triggers.fixedRise ?? ''}
                    onChange={(e) => updateTrigger('fixedRise', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <Button type="button" onClick={handleSaveClick} className="w-full sm:w-auto">
            {t('dashboard.product.saveAlerts')}
          </Button>
        </CardContent>
      </Card>

      {unsupportedOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unsupported-channel-title"
          onClick={() => setUnsupportedOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setUnsupportedOpen(false)}
              aria-label={t('common.close')}
            >
              <X className="size-4" />
            </button>
            <h3 id="unsupported-channel-title" className="pr-8 text-lg font-semibold">
              {t('dashboard.product.channels.unsupportedTitle')}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('dashboard.product.channels.unsupportedMessage')}
            </p>
            <Button type="button" className="mt-5 w-full" onClick={() => setUnsupportedOpen(false)}>
              {t('common.ok')}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
