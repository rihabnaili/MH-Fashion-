import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product id' },
        { status: 400 }
      );
    }

    // Avoid pulling large base64 images array; compute count only.
    const [product] = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(params.id) } },
      {
        $project: {
          name: 1,
          price: 1,
          originalPrice: 1,
          size: 1,
          color: 1,
          discount: 1,
          category: 1,
          availability: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          imageCount: { $size: { $ifNull: ['$images', []] } }
        }
      }
    ]);
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    const imageCount = typeof product.imageCount === 'number' ? product.imageCount : 0;
    const productWithImageUrls = {
      ...product,
      images: Array.from({ length: imageCount }, (_, index) => `/api/images/${product._id}/${index}`)
    };
    
    return NextResponse.json({
      success: true,
      data: productWithImageUrls
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
    const existingProduct = await Product.findById(params.id).select('images');
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Handle image updates
    let imageBase64Strings: string[] = [];
    
    if (images && images.length > 0) {
      // Separate new files from existing image URLs
      const newFiles: File[] = [];
      const existingImageIndices: number[] = [];
      
      for (const image of images) {
        if (image instanceof File) {
          newFiles.push(image);
        } else if (typeof image === 'string' && image.startsWith('/api/images/')) {
          // Extract image index from URL: /api/images/{productId}/{index}
          const urlParts = image.split('/');
          const index = parseInt(urlParts[urlParts.length - 1]);
          if (!isNaN(index) && index >= 0 && index < existingProduct.images.length) {
            existingImageIndices.push(index);
          }
        }
      }
      
      // First, add existing images that should be kept (in order)
      for (const index of existingImageIndices) {
        if (existingProduct.images[index]) {
          imageBase64Strings.push(existingProduct.images[index]);
        }
      }
      
      // Then, add new images converted to base64
      for (const image of newFiles) {
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
    } else {
      // No images provided, keep existing ones
      imageBase64Strings = existingProduct.images;
    }
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      { ...updateData, images: imageBase64Strings },
      { new: true, runValidators: true }
    );
    
    // Convert base64 images to API URLs for response
    const productWithImageUrls = {
      ...updatedProduct.toObject(),
      images: updatedProduct.images?.map((_: string, index: number) => 
        `/api/images/${updatedProduct._id}/${index}`
      ) || []
    };
    
    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: productWithImageUrls
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
    
    // Find product
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Delete product from database (images are stored in DB, so they'll be deleted automatically)
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
