import { MetadataRoute } from 'next';

import { buildProductUrl, PRODUCT_CATEGORIES, SITE_URL } from '@/lib/productRoutes';
import { getAllStorefrontProducts } from '@/lib/storefrontProducts';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tous-nos-produits`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = PRODUCT_CATEGORIES.map((category) => ({
    url: `${SITE_URL}/${category.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  try {
    const products = await getAllStorefrontProducts();
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: buildProductUrl(product),
      lastModified: product.updatedAt || product.createdAt || now,
      changeFrequency: 'weekly',
      priority: 0.75,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [...staticRoutes, ...categoryRoutes];
  }
}
