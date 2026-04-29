import { notFound, permanentRedirect } from 'next/navigation';

import { buildProductPath } from '@/lib/productRoutes';
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

  permanentRedirect(buildProductPath(product));
}
