import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';

import ProductDetailClient from '@/app/produit/[id]/ProductDetailClient';
import { buildProductImageUrl } from '@/lib/imageUrl';
import { buildProductPath, buildProductUrl } from '@/lib/productRoutes';
import { getStorefrontProductBySlug } from '@/lib/storefrontProducts';

interface ProductSlugPageProps {
  params: {
    category: string;
    slug: string;
  };
}

async function getProduct(params: ProductSlugPageProps['params']) {
  return getStorefrontProductBySlug(params.category, params.slug);
}

export async function generateMetadata({ params }: ProductSlugPageProps): Promise<Metadata> {
  const product = await getProduct(params);

  if (!product) {
    return {
      title: 'Produit introuvable - MH Fashion',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const productName = product.name.fr || product.name.ar || 'Produit MH Fashion';
  const description =
    product.description?.fr ||
    `${productName} chez MH Fashion. Vetements homme tendance en Tunisie avec livraison rapide.`;
  const canonicalPath = buildProductPath(product);
  const imageUrl = buildProductImageUrl(product.images?.[0], { variant: 'detail' });

  return {
    title: `${productName} - MH Fashion`,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${productName} - MH Fashion`,
      description,
      url: buildProductUrl(product),
      siteName: 'MH Fashion',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: productName,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${productName} - MH Fashion`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductSlugPage({ params }: ProductSlugPageProps) {
  const product = await getProduct(params);

  if (!product) {
    notFound();
  }

  const canonicalPath = buildProductPath(product);
  if (canonicalPath !== `/${params.category}/${params.slug}`) {
    permanentRedirect(canonicalPath);
  }

  return <ProductDetailClient product={product} />;
}
