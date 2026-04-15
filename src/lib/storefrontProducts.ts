import mongoose from 'mongoose';

import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { normalizeProductImages } from '@/lib/productImageUrls';

export interface StorefrontProduct {
  _id: string;
  name: {
    fr: string;
    ar: string;
  };
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

  return normalizeProductImages(product) as StorefrontProduct;
}

export { storefrontProductProjection };
