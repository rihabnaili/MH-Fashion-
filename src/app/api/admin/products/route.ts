import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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
    
    // Create products directory if it doesn't exist
    const productsDir = join(process.cwd(), 'public', 'products');
    try {
      await mkdir(productsDir, { recursive: true });
    } catch (error) {
      console.log('Products directory already exists');
    }
    
    // Save images and get their paths
    const imagePaths: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i] as File;
      
      if (!image) continue;
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = image.name.split('.').pop();
      const filename = `product_${timestamp}_${randomString}.${extension}`;
      
      // Convert File to Buffer
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Save file
      const filePath = join(productsDir, filename);
      await writeFile(filePath, new Uint8Array(buffer));
      
      // Add to image paths
      imagePaths.push(`/products/${filename}`);
    }
    
    // Create product with image paths
    const newProduct = new Product({
      ...product,
      images: imagePaths
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
    
    return NextResponse.json({
      success: true,
      data: products,
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
