export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.mhfashion.tn';

export const PRODUCT_CATEGORIES = [
  {
    value: 'ensembles',
    slug: 'ensembles',
    label: 'Ensembles',
    description: 'Decouvrez notre collection d ensembles homme chez MH Fashion.',
  },
  {
    value: 'tShirtsPolos',
    slug: 't-shirts-polos',
    label: 'T-shirts & Polos',
    description: 'T-shirts et polos homme tendance chez MH Fashion.',
  },
  {
    value: 'shortsPantalons',
    slug: 'shorts-pantalons',
    label: 'Shorts & Pantalons',
    description: 'Shorts et pantalons homme pour tous les jours chez MH Fashion.',
  },
  {
    value: 'chemises',
    slug: 'chemises',
    label: 'Chemises',
    description: 'Chemises homme elegantes et modernes chez MH Fashion.',
  },
  {
    value: 'packsOffresSpeciales',
    slug: 'packs-offres-speciales',
    label: 'Packs & Offres Speciales',
    description: 'Packs et offres speciales MH Fashion pour homme.',
  },
  {
    value: 'promos',
    slug: 'promos',
    label: 'Promotions',
    description: 'Promotions MH Fashion sur les vetements homme.',
  },
  {
    value: 'nouveautes',
    slug: 'nouveautes',
    label: 'Nouveautes',
    description: 'Les nouveautes MH Fashion pour homme en Tunisie.',
  },
] as const;

export type ProductCategoryValue = (typeof PRODUCT_CATEGORIES)[number]['value'];

type ProductRouteLike = {
  _id?: unknown;
  slug?: string;
  category?: string;
  name?: {
    fr?: string;
    ar?: string;
  };
};

export const categorySlugMap = PRODUCT_CATEGORIES.reduce<Record<string, string>>(
  (acc, category) => {
    acc[category.slug] = category.value;
    return acc;
  },
  {}
);

export const categoryValueToSlugMap = PRODUCT_CATEGORIES.reduce<Record<string, string>>(
  (acc, category) => {
    acc[category.value] = category.slug;
    return acc;
  },
  {}
);

export function getCategoryBySlug(slug: string) {
  return PRODUCT_CATEGORIES.find((category) => category.slug === slug);
}

export function getCategoryByValue(value?: string) {
  return PRODUCT_CATEGORIES.find((category) => category.value === value);
}

export function getCategorySlug(value?: string) {
  return (value && categoryValueToSlugMap[value]) || value || 'produits';
}

export function slugifyProductName(value: unknown) {
  const slug =
    typeof value === 'string'
      ? value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/['’]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      : '';

  return slug || 'produit';
}

export function getProductSlug(product: ProductRouteLike) {
  if (product.slug) {
    return slugifyProductName(product.slug);
  }

  return slugifyProductName(product.name?.fr || product.name?.ar || product._id);
}

export function buildProductPath(product: ProductRouteLike) {
  return `/${getCategorySlug(product.category)}/${getProductSlug(product)}`;
}

export function buildProductUrl(product: ProductRouteLike) {
  return `${SITE_URL}${buildProductPath(product)}`;
}

export function isObjectIdLike(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}
