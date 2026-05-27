import type { ComponentType } from 'react';
import type { Marketplace } from '@/types/product.types';
import { cn } from '@/utils/cn';

interface MarketplaceIconProps {
  marketplace: Marketplace | (typeof import('@/utils/constants').MARKETPLACES)[number] | string;
  size?: number;
  className?: string;
}

function AmazonIcon() {
  return (
    <>
      <rect width="32" height="32" rx="8" fill="#232F3E" />
      <text
        x="16"
        y="14"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="6.5"
        fontWeight="700"
        fontFamily="Arial,Helvetica,sans-serif"
      >
        amazon
      </text>
      <path
        d="M7 22C12 25.5 20 25.5 25 22"
        fill="none"
        stroke="#FF9900"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path fill="#FF9900" d="M25 22l4-1.2-2.5 3.5z" />
    </>
  );
}

function TrendyolIcon() {
  return (
    <>
      <rect width="32" height="32" rx="8" fill="#F27A1A" />
      <text
        x="16"
        y="20"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="7"
        fontWeight="800"
        fontFamily="Arial,Helvetica,sans-serif"
      >
        trendyol
      </text>
    </>
  );
}

function N11Icon() {
  return (
    <>
      <rect width="32" height="32" rx="8" fill="#7B2D8E" />
      <text
        x="16"
        y="20.5"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="10"
        fontWeight="800"
        fontFamily="Arial,Helvetica,sans-serif"
      >
        n11
      </text>
    </>
  );
}

function WalmartIcon() {
  return (
    <>
      <rect width="32" height="32" rx="8" fill="#0071CE" />
      <g fill="#FFC220" transform="translate(16 16)">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <rect
            key={deg}
            x="-1.2"
            y="-10"
            width="2.4"
            height="7"
            rx="1"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>
    </>
  );
}

function OtherIcon() {
  return (
    <>
      <rect width="32" height="32" rx="8" fill="#64748B" />
      <circle cx="16" cy="16" r="5" fill="#FFFFFF" opacity="0.9" />
    </>
  );
}

const ICONS: Record<string, ComponentType> = {
  Amazon: AmazonIcon,
  Trendyol: TrendyolIcon,
  N11: N11Icon,
  Walmart: WalmartIcon,
  Other: OtherIcon,
};

function normalizeMarketplace(marketplace: string): keyof typeof ICONS {
  const key = marketplace.trim();
  if (key in ICONS) return key as keyof typeof ICONS;
  const upper = key.toUpperCase();
  const fromApi: Record<string, keyof typeof ICONS> = {
    AMAZON: 'Amazon',
    TRENDYOL: 'Trendyol',
    N11: 'N11',
    WALMART: 'Walmart',
    OTHER: 'Other',
  };
  return fromApi[upper] ?? 'Other';
}

export function MarketplaceIcon({ marketplace, size = 20, className }: MarketplaceIconProps) {
  const key = normalizeMarketplace(String(marketplace));
  const Icon = ICONS[key] ?? OtherIcon;

  return (
    <span
      className={cn('inline-flex shrink-0 overflow-hidden rounded-md', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <Icon />
      </svg>
    </span>
  );
}
