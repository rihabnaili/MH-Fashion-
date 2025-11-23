import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { unlink } from 'fs/promises';
import { join } from 'path';

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch product',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const productData = formData.get('productData');
    const images = formData.getAll('images');
    
    if (!productData) {
      return NextResponse.json(
        { success: false, message: 'Product data is required' },
        { status: 400 }
      );
    }
    
    // Parse product data
    const updateData = JSON.parse(productData as string);
    
    // Filter out empty strings from arrays
    if (updateData.color && Array.isArray(updateData.color)) {
      updateData.color = updateData.color.filter((c: string) => c && c.trim() !== '');
    }
    if (updateData.size && Array.isArray(updateData.size)) {
      updateData.size = updateData.size.filter((s: string) => s && s.trim() !== '');
    }
    
    // Validate arrays are not empty
    if (!Array.isArray(updateData.color) || updateData.color.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'At least one color is required' 
        },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(updateData.size) || updateData.size.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'At least one size is required' 
        },
        { status: 400 }
      );
    }
    
    // Find existing product
    const existingProduct = await Product.findById(params.id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Handle image updates
    let imagePaths = existingProduct.images;
    
    if (images && images.length > 0) {
      // Delete old images from filesystem
      for (const oldImagePath of existingProduct.images) {
        try {
          const fullPath = join(process.cwd(), 'public', oldImagePath);
          await unlink(fullPath);
        } catch (error) {
          console.log('Could not delete old image:', oldImagePath);
        }
      }
      
      // Save new images
      const productsDir = join(process.cwd(), 'public', 'products');
      imagePaths = [];
      
      for (const image of images) {
        if (image instanceof File) {
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
          const { writeFile } = await import('fs/promises');
          await writeFile(filePath, new Uint8Array(buffer));
          
          // Add to image paths
          imagePaths.push(`/products/${filename}`);
        }
      }
    }
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      { ...updateData, images: imagePaths },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update product',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Find product to get image paths
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Delete images from filesystem
    for (const imagePath of product.images) {
      try {
        const fullPath = join(process.cwd(), 'public', imagePath);
        await unlink(fullPath);
      } catch (error) {
        console.log('Could not delete image:', imagePath);
      }
    }
    
    // Delete product from database
    await Product.findByIdAndDelete(params.id);
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete product',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
