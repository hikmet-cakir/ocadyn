import { useTranslation } from '@/hooks/useTranslation';
import { APP_NAME } from '@/utils/constants';
import { cn } from '@/utils/cn';

type AppLogoVariant = 'mark' | 'wordmark' | 'full';
type AppLogoTone = 'default' | 'on-dark';

interface AppLogoProps {
  variant?: AppLogoVariant;
  tone?: AppLogoTone;
  className?: string;
  showTagline?: boolean;
}

interface LogoMarkProps {
  className?: string;
}

/** Uses currentColor — parent sets text-primary or text-white */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M5 9h3l1.8 9.2a1.4 1.4 0 001.37 1.13H22.1a1.4 1.4 0 001.36-1.03L26 12H10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11 14.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 17.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 20.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.5 14.5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16.5 14.5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19.5 14.5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12.5" cy="25.5" r="2.25" fill="currentColor" />
      <circle cx="21.5" cy="25.5" r="2.25" fill="currentColor" />
    </svg>
  );
}

const toneColorClass: Record<AppLogoTone, string> = {
  default: 'text-primary',
  'on-dark': 'text-white',
};

function WordmarkText({
  tone,
  className,
}: {
  tone: AppLogoTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'font-display font-extrabold tracking-[0.06em]',
        toneColorClass[tone],
        className,
      )}
    >
      {APP_NAME}
    </span>
  );
}

export function AppLogo({
  variant = 'wordmark',
  tone = 'default',
  className,
  showTagline = true,
}: AppLogoProps) {
  const { t } = useTranslation();
  const colorClass = toneColorClass[tone];

  if (variant === 'mark') {
    return <LogoMark className={cn('size-full', colorClass, className)} />;
  }

  if (variant === 'wordmark') {
    return (
      <div className={cn('flex items-center gap-2.5', className)}>
        <LogoMark className={cn('size-9 shrink-0', colorClass)} />
        <WordmarkText tone={tone} className="text-xl leading-none" />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center text-center', className)}>
      <LogoMark className={cn('size-14', colorClass)} />
      <WordmarkText tone={tone} className="mt-3 text-3xl leading-none" />
      {showTagline ? (
        <p
          className={cn(
            'mt-3 max-w-xs text-[0.65rem] font-medium uppercase tracking-[0.22em]',
            tone === 'on-dark' ? 'text-white/75' : 'text-muted-foreground',
          )}
        >
          {t('app.tagline')}
        </p>
      ) : null}
    </div>
  );
}

export function AppLogoMark({
  className,
  tone = 'default',
}: {
  className?: string;
  tone?: AppLogoTone;
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl p-1.5',
        tone === 'on-dark'
          ? 'bg-white/15 text-white shadow-[0_4px_12px_rgba(0,0,0,0.12)]'
          : 'bg-primary/10 text-primary ring-1 ring-primary/15',
        className,
      )}
    >
      <AppLogo variant="mark" tone={tone} className="size-full" />
    </div>
  );
}
