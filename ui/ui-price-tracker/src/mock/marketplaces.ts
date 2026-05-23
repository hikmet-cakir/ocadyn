import type { Marketplace } from '@/types/product.types';

export interface MarketplaceMeta {
  id: Marketplace;
  slug: string;
  color: string;
}

export const marketplaceMeta: MarketplaceMeta[] = [
  { id: 'Amazon', slug: 'amazon', color: '#FF9900' },
  { id: 'Trendyol', slug: 'trendyol', color: '#F27A1A' },
  { id: 'Hepsiburada', slug: 'hepsiburada', color: '#FF6000' },
  { id: 'N11', slug: 'n11', color: '#7B2D8E' },
  { id: 'Walmart', slug: 'walmart', color: '#0071CE' },
  { id: 'Alibaba', slug: 'alibaba', color: '#FF6A00' },
  { id: 'Sahibinden', slug: 'sahibinden', color: '#FFE800' },
];
