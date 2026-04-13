import { notFound } from 'next/navigation';

import ProductDetailClient from '@/app/produit/[id]/ProductDetailClient';
import { getStorefrontProductById } from '@/lib/storefrontProducts';

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getStorefrontProductById(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
