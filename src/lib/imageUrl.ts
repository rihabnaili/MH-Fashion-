import {
  PRODUCT_IMAGE_FALLBACK,
  ProductImageVariant,
  resolveRequestedProductImageVariant,
} from '@/lib/productImageUrls';

interface ProductImageOptions {
  width?: number;
  quality?: number;
  variant?: ProductImageVariant;
}

export function buildProductImageUrl(
  src?: string,
  { width, variant }: ProductImageOptions = {}
) {
  const safeSrc = src || PRODUCT_IMAGE_FALLBACK;

  if (!safeSrc.startsWith('/api/images/')) {
    return safeSrc;
  }

  const resolvedVariant = resolveRequestedProductImageVariant(width, variant);
  return `${safeSrc}${safeSrc.includes('?') ? '&' : '?'}v=${resolvedVariant}`;
}
