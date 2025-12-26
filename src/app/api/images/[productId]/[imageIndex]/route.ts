import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET image from MongoDB as base64
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string; imageIndex: string } }
) {
  try {
    await connectDB();
    
    const product = await Product.findById(params.productId);
    
    if (!product || !product.images) {
      return NextResponse.json(
        { success: false, message: 'Product or image not found' },
        { status: 404 }
      );
    }
    
    const imageIndex = parseInt(params.imageIndex);
    if (imageIndex < 0 || imageIndex >= product.images.length) {
      return NextResponse.json(
        { success: false, message: 'Image index out of range' },
        { status: 404 }
      );
    }
    
    const base64Image = product.images[imageIndex];
    
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
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Return image with proper content type
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
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

