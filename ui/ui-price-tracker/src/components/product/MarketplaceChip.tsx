import { MarketplaceIcon } from '@/components/product/MarketplaceIcon';
import type { Marketplace } from '@/types/product.types';
import { MARKETPLACES } from '@/utils/constants';
import { cn } from '@/utils/cn';

type SupportedMarketplace = (typeof MARKETPLACES)[number];

interface MarketplaceChipProps {
  marketplace: SupportedMarketplace;
  className?: string;
  showLabel?: boolean;
}

export function MarketplaceChip({
  marketplace,
  className,
  showLabel = true,
}: MarketplaceChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-primary-border/60 hover:bg-primary-soft/40 hover:shadow-md',
        className,
      )}
    >
      <MarketplaceIcon marketplace={marketplace as Marketplace} size={18} />
      {showLabel ? marketplace : null}
    </span>
  );
}

export function MarketplaceChipRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {MARKETPLACES.map((name) => (
        <MarketplaceChip key={name} marketplace={name} />
      ))}
    </div>
  );
}
