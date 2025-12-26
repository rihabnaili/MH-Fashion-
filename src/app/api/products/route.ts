import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET products for frontend display
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '12');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
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
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('name price originalPrice discount images category availability size color description createdAt')
        .lean(),
      Product.countDocuments(query)
    ]);
    
    // Convert base64 images to API URLs for frontend
    const productsWithImageUrls = products.map((product: any) => ({
      ...product,
      images: product.images?.map((_: string, index: number) => 
        `/api/images/${product._id}/${index}`
      ) || []
    }));
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
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

// POST new product
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'price', 'size', 'color', 'category'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }
    
    // Validate name structure
    if (!body.name.fr || !body.name.ar) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Name must have both French (fr) and Arabic (ar) versions' 
        },
        { status: 400 }
      );
    }
    
    const product = new Product(body);
    await product.save();
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: product
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create product',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
