import mongoose from 'mongoose';

import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { normalizeProductImages } from '@/lib/productImageUrls';
import { getCategoryBySlug, getProductSlug } from '@/lib/productRoutes';

export interface StorefrontProduct {
  _id: string;
  name: {
    fr: string;
    ar: string;
  };
  slug: string;
  price: number;
  originalPrice?: number;
  size: string[];
  color: string[];
  disabledColors?: string[];
  discount: number;
  category: string;
  availability: boolean;
  description?: {
    fr: string;
    ar: string;
  };
  images: string[];
  imageCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const storefrontProductProjection = {
  name: 1,
  slug: 1,
  price: 1,
  originalPrice: 1,
  size: 1,
  color: 1,
  disabledColors: 1,
  discount: 1,
  category: 1,
  availability: 1,
  description: 1,
  createdAt: 1,
  updatedAt: 1,
  imageCount: {
    $ifNull: ['$imageCount', { $size: { $ifNull: ['$images', []] } }],
  },
};

export function normalizeStorefrontProduct(product: any) {
  const normalizedProduct = normalizeProductImages(product);

  return {
    ...normalizedProduct,
    slug: getProductSlug(normalizedProduct),
  } as StorefrontProduct;
}

export async function getStorefrontProductById(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectDB();

  const [product] = await Product.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    { $project: storefrontProductProjection },
  ]);

  if (!product) {
    return null;
  }

  return normalizeStorefrontProduct(product);
}

export async function getStorefrontProductBySlug(categorySlug: string, productSlug: string) {
  const category = getCategoryBySlug(categorySlug);
  if (!category) {
    return null;
  }

  await connectDB();

  const [storedSlugProduct] = await Product.aggregate([
    {
      $match: {
        category: category.value,
        availability: true,
        slug: productSlug,
      },
    },
    { $project: storefrontProductProjection },
    { $limit: 1 },
  ]);

  if (storedSlugProduct) {
    return normalizeStorefrontProduct(storedSlugProduct);
  }

  const products = await Product.aggregate([
    {
      $match: {
        category: category.value,
        availability: true,
      },
    },
    { $project: storefrontProductProjection },
    { $sort: { createdAt: -1 } },
  ]);

  const product = products.find((candidate: any) => getProductSlug(candidate) === productSlug);
  return product ? normalizeStorefrontProduct(product) : null;
}

export async function getAllStorefrontProducts() {
  await connectDB();

  const products = await Product.aggregate([
    { $match: { availability: true } },
    { $project: storefrontProductProjection },
    { $sort: { category: 1, createdAt: -1 } },
  ]);

  return products.map(normalizeStorefrontProduct);
}

export { storefrontProductProjection };
