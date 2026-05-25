import type { ApiMarketplace } from '@/types/api.types';
import type { Marketplace } from '@/types/product.types';

const SUPPORTED_HOST_PATTERNS = ['amazon', 'trendyol', 'n11', 'walmart'] as const;

export function detectMarketplaceFromUrl(url: string): ApiMarketplace {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    if (host.includes('amazon')) return 'AMAZON';
    if (host.includes('trendyol')) return 'TRENDYOL';
    if (host.includes('n11')) return 'N11';
    if (host.includes('walmart')) return 'WALMART';
    return 'OTHER';
  } catch {
    return 'OTHER';
  }
}

export function isSupportedProductUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return SUPPORTED_HOST_PATTERNS.some((pattern) => host.includes(pattern));
  } catch {
    return false;
  }
}

export function supportedMarketplaceLabels(): Marketplace[] {
  return ['Amazon', 'Trendyol', 'N11', 'Walmart'];
}
