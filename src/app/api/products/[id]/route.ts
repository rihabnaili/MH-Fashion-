import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Attempting to connect to MongoDB...');
    await connectDB();
    console.log('MongoDB connected successfully');

    console.log('Fetching product with ID:', params.id);
    const product = await Product.findById(params.id);
    console.log('Product found:', product ? 'Yes' : 'No');
    
    if (!product) {
      console.log('Product not found for ID:', params.id);
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('Successfully retrieved product');
    return NextResponse.json(
      { success: true, data: product },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error details:', error);
    let errorMessage = 'Failed to fetch product';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Stack trace:', error.stack);
    }
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}