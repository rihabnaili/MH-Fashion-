export type ProductImageVariant = 'thumb' | 'detail';

export const PRODUCT_IMAGE_FALLBACK = '/home-media/set.jpg';

export const PRODUCT_IMAGE_VARIANTS: Record<
  ProductImageVariant,
  { width: number; quality: number }
> = {
  thumb: {
    width: 320,
    quality: 64,
  },
  detail: {
    width: 1100,
    quality: 74,
  },
};

export function buildProductImagePath(
  productId: string,
  index: number,
  variant?: ProductImageVariant
) {
  if (!variant) {
    return `/api/images/${productId}/${index}`;
  }

  return `/api/images/${productId}/${index}?v=${variant}`;
}

export function buildProductImagePaths(productId: string, count: number) {
  if (count <= 0) {
    return [PRODUCT_IMAGE_FALLBACK];
  }

  return Array.from({ length: count }, (_, index) =>
    buildProductImagePath(productId, index)
  );
}

export function resolveRequestedProductImageVariant(
  width?: number,
  preferredVariant?: ProductImageVariant
) {
  if (preferredVariant) {
    return preferredVariant;
  }

  return width && width > 480 ? 'detail' : 'thumb';
}

export function resolveProductImageCount(product: {
  imageCount?: number | null;
  images?: unknown;
}) {
  if (typeof product.imageCount === 'number' && Number.isFinite(product.imageCount)) {
    return product.imageCount;
  }

  if (Array.isArray(product.images)) {
    return product.images.length;
  }

  return 0;
}

export function normalizeProductImages<T extends { _id: unknown; imageCount?: number | null; images?: unknown }>(
  product: T
) {
  const imageCount = resolveProductImageCount(product);

  return {
    ...product,
    imageCount,
    images: buildProductImagePaths(String(product._id), imageCount),
  };
}

export function parseProductImageIndexFromUrl(
  imagePath: string,
  productId?: string
) {
  const escapedProductId = productId
    ? productId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    : '[a-fA-F0-9]{24}';
  const match = imagePath.match(
    new RegExp(`/api/images/${escapedProductId}/(\\d+)(?:\\?.*)?$`)
  );

  if (!match) {
    return null;
  }

  const index = parseInt(match[1], 10);
  return Number.isFinite(index) ? index : null;
}
