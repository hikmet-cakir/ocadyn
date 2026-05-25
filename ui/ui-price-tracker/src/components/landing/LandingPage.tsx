import { useState } from 'react';
import {
  BarChart3,
  Bell,
  ChevronDown,
  Hexagon,
  Link2,
  Shield,
  Sparkles,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/auth.store';
import { APP_NAME, MARKETPLACES } from '@/utils/constants';
import { cn } from '@/utils/cn';

const featureIcons = [Link2, Bell, TrendingDown, BarChart3] as const;
const featureKeys = ['url', 'alerts', 'tracking', 'reports'] as const;
const pricingKeys = ['free', 'pro', 'enterprise'] as const;
const testimonialKeys = ['a', 'b', 'c'] as const;
const faqKeys = ['account', 'track', 'alerts', 'pricing'] as const;

export function LandingPage() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [openFaq, setOpenFaq] = useState<string | null>('account');

  const dashboardHref = isHydrated && isAuthenticated ? '/dashboard' : '/login';

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 sm:py-28">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_50%)] opacity-[0.08]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="mr-1 size-3" />
              {t('landing.heroBadge')}
            </Badge>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
              {t('landing.heroTitle')}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              {t('landing.heroSubtitle')}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{t('landing.membersRequired')}</p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <a href="/register">{t('common.getStarted')}</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={dashboardHref}>{t('common.viewDashboard')}</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Marketplaces */}
        <section className="border-y border-border bg-muted/30 px-4 py-12">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {t('landing.marketplaces.title')}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {MARKETPLACES.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                {t('landing.features.title')}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                {t('landing.features.subtitle')}
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featureKeys.map((key, i) => {
                const Icon = featureIcons[i];
                return (
                  <Card
                    key={key}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardHeader>
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <CardTitle className="text-lg">
                        {t(`landing.features.items.${key}.title`)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        {t(`landing.features.items.${key}.description`)}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Dashboard preview */}
        <section className="bg-muted/30 px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl font-bold">{t('landing.preview.title')}</h2>
                <p className="mt-4 text-muted-foreground">{t('landing.preview.subtitle')}</p>
                <ul className="mt-6 space-y-3">
                  {(['stats', 'alerts', 'history'] as const).map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Zap className="size-4 text-primary" />
                      {t(`landing.preview.points.${item}`)}
                    </li>
                  ))}
                </ul>
              </div>
              <Card className="overflow-hidden shadow-xl">
                <div className="flex items-center gap-2 border-b border-border bg-sidebar px-4 py-3">
                  <Hexagon className="size-5 text-sidebar-foreground" />
                  <span className="text-sm font-semibold text-sidebar-foreground">
                    {APP_NAME} Dashboard
                  </span>
                </div>
                <CardContent className="grid grid-cols-2 gap-3 p-4">
                  {[
                    { label: t('dashboard.stats.total'), value: '12', color: 'bg-primary/10 text-primary' },
                    { label: t('dashboard.stats.dropped'), value: '5', color: 'bg-success/15 text-success' },
                    { label: t('dashboard.stats.increased'), value: '2', color: 'bg-destructive/15 text-destructive' },
                    { label: t('dashboard.stats.unchanged'), value: '5', color: 'bg-muted text-muted-foreground' },
                  ].map((stat) => (
                    <div key={stat.label} className={cn('rounded-lg p-3', stat.color)}>
                      <p className="text-xs opacity-80">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold">{t('landing.pricing.title')}</h2>
              <p className="mt-4 text-muted-foreground">{t('landing.pricing.subtitle')}</p>
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {pricingKeys.map((plan) => (
                <Card
                  key={plan}
                  className={cn(
                    'relative',
                    plan === 'pro' && 'border-primary shadow-lg ring-1 ring-primary',
                  )}
                >
                  {plan === 'pro' ? (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      {t('landing.pricing.popular')}
                    </Badge>
                  ) : null}
                  <CardHeader>
                    <CardTitle>{t(`landing.pricing.plans.${plan}.name`)}</CardTitle>
                    <CardDescription>
                      {t(`landing.pricing.plans.${plan}.description`)}
                    </CardDescription>
                    <p className="pt-2 font-display text-3xl font-bold">
                      {t(`landing.pricing.plans.${plan}.price`)}
                      <span className="text-sm font-normal text-muted-foreground">
                        {t('landing.pricing.perMonth')}
                      </span>
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {([1, 2, 3] as const).map((n) => (
                        <li key={n} className="flex items-center gap-2">
                          <Shield className="size-3.5 shrink-0 text-primary" />
                          {t(`landing.pricing.plans.${plan}.feature${n}`)}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-6 w-full"
                      variant={plan === 'pro' ? 'default' : 'outline'}
                      asChild
                    >
                      <a href="/register">{t(`landing.pricing.plans.${plan}.cta`)}</a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-muted/30 px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center font-display text-3xl font-bold">
              {t('landing.testimonials.title')}
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonialKeys.map((key) => (
                <Card key={key}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      &ldquo;{t(`landing.testimonials.items.${key}.quote`)}&rdquo;
                    </p>
                    <p className="mt-4 text-sm font-semibold">
                      {t(`landing.testimonials.items.${key}.name`)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(`landing.testimonials.items.${key}.role`)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-display text-3xl font-bold">{t('landing.faq.title')}</h2>
            <div className="mt-10 space-y-2">
              {faqKeys.map((id) => {
                const isOpen = openFaq === id;
                return (
                  <Card key={id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between p-4 text-left font-medium"
                      onClick={() => setOpenFaq(isOpen ? null : id)}
                    >
                      {t(`landing.faq.items.${id}.q`)}
                      <ChevronDown
                        className={cn('size-5 shrink-0 transition-transform', isOpen && 'rotate-180')}
                      />
                    </button>
                    {isOpen ? (
                      <CardContent className="pt-0 text-sm text-muted-foreground">
                        {t(`landing.faq.items.${id}.a`)}
                      </CardContent>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-4xl rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground">
            <h2 className="font-display text-3xl font-bold">{t('landing.cta.title')}</h2>
            <p className="mx-auto mt-4 max-w-xl opacity-90">{t('landing.cta.subtitle')}</p>
            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <a href="/register">{t('landing.cta.button')}</a>
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
