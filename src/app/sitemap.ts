import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://mhfashion.tn',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // You can add more pages manually here later if needed
  ]
}