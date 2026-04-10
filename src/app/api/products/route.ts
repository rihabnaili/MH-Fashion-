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
      Product.aggregate([
        { $match: query },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            name: 1,
            price: 1,
            originalPrice: 1,
            discount: 1,
            category: 1,
            availability: 1,
            size: 1,
            color: 1,
            description: 1,
            createdAt: 1,
            imageCount: { $size: { $ifNull: ['$images', []] } }
          }
        }
      ]),
      Product.countDocuments(query)
    ]);

    const productsWithImageUrls = products.map((product: any) => {
      const imageCount = typeof product.imageCount === 'number' ? product.imageCount : 0;

      return {
        ...product,
        images: imageCount > 0
          ? Array.from({ length: imageCount }, (_, index) => `/api/images/${product._id}/${index}`)
          : ['/home-media/set.jpg']
      };
    });
    
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
