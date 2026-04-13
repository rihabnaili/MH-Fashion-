interface ProductImageOptions {
  width?: number;
  quality?: number;
}

export function buildProductImageUrl(
  src?: string,
  { width, quality }: ProductImageOptions = {}
) {
  const fallback = '/home-media/set.jpg';
  const safeSrc = src || fallback;

  const params = new URLSearchParams();
  if (width) params.set('w', String(width));
  if (quality) params.set('q', String(quality));

  const query = params.toString();
  if (!query) return safeSrc;

  return `${safeSrc}${safeSrc.includes('?') ? '&' : '?'}${query}`;
}
