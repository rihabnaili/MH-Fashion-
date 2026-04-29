import React from 'react';
import { getCategoryBySlug, SITE_URL } from '@/lib/productRoutes';

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

// Generate metadata for category pages
export async function generateMetadata({ params }: { params: { category: string } }) {
  const category = getCategoryBySlug(params.category);
  const categoryName = category?.label || 'Categorie';
  const description =
    category?.description || `Decouvrez notre collection ${categoryName.toLowerCase()} chez MH Fashion.`;
  const canonicalPath = category ? `/${category.slug}` : `/${params.category}`;

  return {
    title: `${categoryName} - MH Fashion`,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${categoryName} - MH Fashion`,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      siteName: 'MH Fashion',
      images: [
        {
          url: '/logo2.png',
          width: 1200,
          height: 630,
          alt: 'MH Fashion',
        },
      ],
      type: 'website',
    },
  };
}
