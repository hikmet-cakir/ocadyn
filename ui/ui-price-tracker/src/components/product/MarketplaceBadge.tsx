import { Badge } from '@/components/ui/badge';
import type { Marketplace } from '@/types/product.types';
import { marketplaceMeta } from '@/mock/marketplaces';

interface MarketplaceBadgeProps {
  marketplace: Marketplace;
}

export function MarketplaceBadge({ marketplace }: MarketplaceBadgeProps) {
  const meta = marketplaceMeta.find((m) => m.id === marketplace);

  return (
    <Badge variant="outline" className="gap-1.5 font-medium">
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: meta?.color ?? '#5B4DFF' }}
        aria-hidden
      />
      {marketplace}
    </Badge>
  );
}
