import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import {
  deleteStoredProductImages,
  fileToProductImageSource,
  replaceStoredProductImages,
} from '@/lib/productImageStorage';
import { normalizeProductImages } from '@/lib/productImageUrls';

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
    
    const uploadedFiles = images.filter((image): image is File => image instanceof File);
    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'At least one image file is required',
        },
        { status: 400 }
      );
    }

    const productId = new mongoose.Types.ObjectId();
    const imageSources = await Promise.all(uploadedFiles.map((image) => fileToProductImageSource(image)));

    await replaceStoredProductImages(productId, imageSources);

    let newProduct;
    try {
      newProduct = new Product({
        _id: productId,
        ...product,
        images: [],
        imageCount: imageSources.length,
      });

      await newProduct.save();
    } catch (error) {
      await deleteStoredProductImages(productId);
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: normalizeProductImages(newProduct.toObject())
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
    
    const products = await Product.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          name: 1,
          price: 1,
          category: 1,
          availability: 1,
          createdAt: 1,
          imageCount: {
            $ifNull: ['$imageCount', { $size: { $ifNull: ['$images', []] } }],
          },
        },
      },
    ]);
    
    const total = await Product.countDocuments(query);
    
    const productsWithImageUrls = products.map((product: any) => {
      const normalizedProduct = normalizeProductImages(product);

      return {
        ...normalizedProduct,
        images: normalizedProduct.images.slice(0, 1),
      };
    });
    
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
