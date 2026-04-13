import { NextRequest, NextResponse } from 'next/server';

import { getStorefrontProductById } from '@/lib/storefrontProducts';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getStorefrontProductById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found or invalid product id' },
        { status: 404 }
      );
    }

    const response = NextResponse.json(
      { success: true, data: product },
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
