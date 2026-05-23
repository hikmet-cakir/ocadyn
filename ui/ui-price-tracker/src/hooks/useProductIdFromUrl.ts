import { useEffect, useState } from 'react';

export function useProductIdFromUrl(): string {
  const [productId, setProductId] = useState('');

  useEffect(() => {
    function resolve() {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get('id');
      if (fromQuery) {
        setProductId(fromQuery);
        return;
      }
      const match = window.location.pathname.match(/\/dashboard\/product\/([^/]+)\/?$/);
      setProductId(match?.[1] ?? '');
    }
    resolve();
    window.addEventListener('popstate', resolve);
    return () => window.removeEventListener('popstate', resolve);
  }, []);

  return productId;
}

export function productDetailHref(id: string): string {
  return `/dashboard/product?id=${encodeURIComponent(id)}`;
}
