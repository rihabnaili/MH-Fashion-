import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product id' },
        { status: 400 }
      );
    }

    const [product] = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(params.id) } },
      {
        $project: {
          name: 1,
          price: 1,
          originalPrice: 1,
          size: 1,
          color: 1,
          discount: 1,
          category: 1,
          availability: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          imageCount: { $size: { $ifNull: ['$images', []] } }
        }
      }
    ]);
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const imageCount = typeof product.imageCount === 'number' ? product.imageCount : 0;
    const productWithImageUrls = {
      ...product,
      images: imageCount > 0
        ? Array.from({ length: imageCount }, (_, index) => `/api/images/${product._id}/${index}`)
        : ['/home-media/set.jpg']
    };

    const response = NextResponse.json(
      { success: true, data: productWithImageUrls },
      { status: 200 }
    );
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
