import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// POST new product with image uploads
export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database connection failed',
          error: dbError instanceof Error ? dbError.message : 'Unknown error'
        },
        { status: 503 }
      );
    }
    
    const formData = await request.formData();
    const productData = formData.get('productData');
    const images = formData.getAll('images');
    
    if (!productData || !images || images.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Product data and images are required' 
        },
        { status: 400 }
      );
    }
    
    // Parse product data
    const product = JSON.parse(productData as string);
    
    // Filter out empty strings from arrays
    if (product.color && Array.isArray(product.color)) {
      product.color = product.color.filter((c: string) => c && c.trim() !== '');
    }
    if (product.size && Array.isArray(product.size)) {
      product.size = product.size.filter((s: string) => s && s.trim() !== '');
    }
    
    // Validate required fields
    const requiredFields = ['name', 'price', 'size', 'color', 'category'];
    for (const field of requiredFields) {
      if (!product[field]) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }
    
    // Validate arrays are not empty
    if (!Array.isArray(product.color) || product.color.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'At least one color is required' 
        },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(product.size) || product.size.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'At least one size is required' 
        },
        { status: 400 }
      );
    }
    
    // Validate name structure
    if (!product.name.fr || !product.name.ar) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Name must have both French (fr) and Arabic (ar) versions' 
        },
        { status: 400 }
      );
    }
    
    // Convert images to base64 and store in MongoDB
    const imageBase64Strings: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i] as File;
      
      if (!image) continue;
      
      // Get mime type
      const mimeType = image.type || 'image/jpeg';
      
      // Convert File to Buffer
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Convert to base64
      const base64String = buffer.toString('base64');
      const base64DataUri = `data:${mimeType};base64,${base64String}`;
      
      // Add to base64 images array
      imageBase64Strings.push(base64DataUri);
    }
    
    // Create product with base64 images
    const newProduct = new Product({
      ...product,
      images: imageBase64Strings
    });
    
    await newProduct.save();
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
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

// GET all products (admin view)
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database connection failed',
          error: dbError instanceof Error ? dbError.message : 'Unknown error'
        },
        { status: 503 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Maximum 100 items per page
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1); // Minimum page 1
    
    let query: any = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Search by name
    if (search) {
      query.$or = [
        { 'name.fr': { $regex: search, $options: 'i' } },
        { 'name.ar': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Product.countDocuments(query);
    
    // Convert base64 images to API URLs for frontend
    const productsWithImageUrls = products.map((product: any) => ({
      ...product,
      images: product.images?.map((_: string, index: number) => 
        `/api/images/${product._id}/${index}`
      ) || []
    }));
    
    return NextResponse.json({
      success: true,
      data: productsWithImageUrls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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
