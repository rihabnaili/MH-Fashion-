import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import sharp from 'sharp';
import { PRODUCT_IMAGE_VARIANTS, ProductImageVariant } from '@/lib/productImageUrls';
import { readStoredProductImageVariant } from '@/lib/productImageStorage';

export const runtime = 'nodejs';

// GET image from MongoDB as base64
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string; imageIndex: string } }
) {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.productId)) {
      return NextResponse.json(
        { success: false, message: 'Product or image not found' },
        { status: 404 }
      );
    }

    const imageIndex = Number(params.imageIndex);
    if (!Number.isInteger(imageIndex) || imageIndex < 0) {
      return NextResponse.json(
        { success: false, message: 'Image index out of range' },
        { status: 404 }
      );
    }

    const requestedVariant = request.nextUrl.searchParams.get('v');
    const variant: ProductImageVariant =
      requestedVariant && requestedVariant in PRODUCT_IMAGE_VARIANTS
        ? (requestedVariant as ProductImageVariant)
        : 'thumb';
    const productObjectId = new mongoose.Types.ObjectId(params.productId);

    const storedVariant = await readStoredProductImageVariant(
      productObjectId,
      imageIndex,
      variant
    );

    if (storedVariant) {
      return new NextResponse(storedVariant.data, {
        status: 200,
        headers: {
          'Content-Type': storedVariant.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Fetch only the requested image element (avoid loading the full base64 array).
    const [result] = await Product.aggregate([
      { $match: { _id: productObjectId } },
      { $project: { image: { $arrayElemAt: ['$images', imageIndex] } } }
    ]);

    const base64Image = result?.image as string | undefined;
    
    if (!base64Image) {
      return NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      );
    }
    
    // Extract mime type and base64 data
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      return NextResponse.json(
        { success: false, message: 'Invalid image format' },
        { status: 400 }
      );
    }
    
    const base64Data = matches[2];
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const legacyVariant = PRODUCT_IMAGE_VARIANTS[variant as ProductImageVariant];
    const resizeConfig =
      variant === 'thumb'
        ? {
            width: legacyVariant.width,
            height: legacyVariant.width,
            fit: 'inside' as const,
            withoutEnlargement: true,
          }
        : {
            width: legacyVariant.width,
            fit: 'inside' as const,
            withoutEnlargement: true,
          };
    const outputBuffer = await sharp(imageBuffer)
      .rotate()
      .resize(resizeConfig)
      .webp({ quality: legacyVariant.quality })
      .toBuffer();
    const contentType = 'image/webp';
    
    // Return image with proper content type
    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch image',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

