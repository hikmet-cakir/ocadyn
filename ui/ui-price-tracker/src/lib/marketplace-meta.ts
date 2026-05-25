import type { Marketplace } from '@/types/product.types';

export interface MarketplaceMeta {
  id: Marketplace;
  slug: string;
  color: string;
}

export const marketplaceMeta: MarketplaceMeta[] = [
  { id: 'Amazon', slug: 'amazon', color: '#FF9900' },
  { id: 'Trendyol', slug: 'trendyol', color: '#F27A1A' },
  { id: 'N11', slug: 'n11', color: '#7B2D8E' },
  { id: 'Walmart', slug: 'walmart', color: '#0071CE' },
  { id: 'Other', slug: 'other', color: '#64748B' },
];
