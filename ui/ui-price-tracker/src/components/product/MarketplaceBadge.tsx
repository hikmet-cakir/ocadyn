import { Badge } from '@/components/ui/badge';
import { MarketplaceIcon } from '@/components/product/MarketplaceIcon';
import type { Marketplace } from '@/types/product.types';
import { cn } from '@/utils/cn';

interface MarketplaceBadgeProps {
  marketplace: Marketplace;
  className?: string;
  size?: 'sm' | 'md';
}

export function MarketplaceBadge({ marketplace, className, size = 'md' }: MarketplaceBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-2 border-border/80 bg-card font-medium text-foreground shadow-sm transition-all duration-200',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
    >
      <MarketplaceIcon marketplace={marketplace} size={size === 'sm' ? 16 : 18} />
      {marketplace}
    </Badge>
  );
}
