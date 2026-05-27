import { useState } from 'react';
import { Bell, Mail, MessageSquare, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import type { NotificationSettings } from '@/types/product.types';
import { NOTIFICATION_FREQUENCIES } from '@/utils/constants';
import { Switch } from '@/components/ui/switch';
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
      <Card className="overflow-hidden rounded-[20px]">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary-soft/30 to-transparent pb-5">
          <CardTitle className="text-xl">{t('dashboard.product.alertTitle')}</CardTitle>
          <CardDescription>{t('dashboard.product.alertSettingsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-7 pt-6">
          <div>
            <Label className="mb-3 block text-sm font-medium">{t('dashboard.product.notifyVia')}</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {channelConfig.map(({ key, icon: Icon, labelKey, supported, required }) => {
              const active = supported && settings.channels[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChannelClick(key, supported)}
                  className={cn(
                    'relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-medium transition-all duration-200',
                    active
                      ? 'border-primary bg-primary-soft text-primary shadow-sm'
                      : supported
                        ? 'border-border/80 bg-card text-muted-foreground hover:border-primary-border hover:bg-primary-soft/50'
                        : 'cursor-not-allowed border-border/60 bg-muted/30 text-muted-foreground/70',
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

          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('dashboard.product.frequency')}</Label>
            <p className="text-xs leading-relaxed text-muted-foreground">{t('dashboard.product.frequencyHint')}</p>
            <div className="inline-flex flex-wrap gap-1 rounded-full border border-border/80 bg-secondary p-1">
              {NOTIFICATION_FREQUENCIES.map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => onChange({ ...settings, frequency: freq })}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                    settings.frequency === freq
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t(`dashboard.product.frequencyOptions.${freq}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-primary-border/60 bg-primary-soft/50 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Bell className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <Label htmlFor="instant-price-alerts" className="text-base font-semibold leading-tight text-foreground">
                {t('dashboard.product.priceChangeAlerts')}
              </Label>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('dashboard.product.priceChangeAlertsHint')}
              </p>
            </div>
            <Switch
              id="instant-price-alerts"
              checked={settings.instantAlertsEnabled}
              onCheckedChange={handleInstantAlertsToggle}
              className="mt-0.5"
            />
          </div>

          {settings.instantAlertsEnabled ? (
            <div className="space-y-4 rounded-2xl border border-border/80 bg-primary-soft/20 p-5">
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
            {t('dashboard.product.saveAlert')}
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

