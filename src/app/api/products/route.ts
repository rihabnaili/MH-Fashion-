import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { normalizeStorefrontProduct, storefrontProductProjection } from '@/lib/storefrontProducts';
import { escapeRegex, parsePagination } from '@/lib/queryUtils';

export const dynamic = 'force-dynamic';

const ALLOWED_SORT_FIELDS = new Set(['createdAt', 'price', 'name.fr', 'name.ar', 'discount']);

// GET products for frontend display
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const { limit, page, skip } = parsePagination(searchParams, 12, 60);
    const search = escapeRegex((searchParams.get('search') || '').trim().slice(0, 100));
    const requestedSortBy = searchParams.get('sortBy') || 'createdAt';
    const sortBy = ALLOWED_SORT_FIELDS.has(requestedSortBy) ? requestedSortBy : 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build query
    const query: any = { availability: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { 'name.fr': { $regex: search, $options: 'i' } },
        { 'name.ar': { $regex: search, $options: 'i' } },
        { 'description.fr': { $regex: search, $options: 'i' } },
        { 'description.ar': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    sort._id = 1; // stable ordering across pages
    
    const [products, total] = await Promise.all([
      Product.aggregate([
        { $match: query },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
          $project: storefrontProductProjection
        }
      ]),
      Product.countDocuments(query)
    ]);
    
    const productsWithImageUrls = products.map((product: any) => {
      const normalizedProduct = normalizeStorefrontProduct(product);

      return {
        ...normalizedProduct,
        images: normalizedProduct.images.slice(0, 1),
      };
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    const response = NextResponse.json({
      success: true,
      data: {
        products: productsWithImageUrls,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts: total,
          hasNextPage,
          hasPrevPage,
          limit
        }
      }
    });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
    
  } catch (error) {
    console.error('Error fetching products:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch products',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
