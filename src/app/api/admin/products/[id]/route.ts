import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// GET single product
export async function GET(
  _request: NextRequest,
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product id' },
        { status: 400 }
      );
    }
    const productObjectId = new mongoose.Types.ObjectId(params.id);
    
    const formData = await request.formData();
    const productData = formData.get('productData');
    const images = formData.getAll('images');
    
    if (!productData) {
      return NextResponse.json(
        { success: false, message: 'Product data is required' },
        { status: 400 }
      );
    }

    let productDataString: string;
    if (typeof productData === 'string') {
      productDataString = productData;
    } else if (productData instanceof File) {
      productDataString = await productData.text();
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid product data' },
        { status: 400 }
      );
    }
    
    // Parse product data
    let updateData: any;
    try {
      updateData = JSON.parse(productDataString);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid product data JSON' },
        { status: 400 }
      );
    }
    
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
    
    const [meta] = await Product.aggregate([
      { $match: { _id: productObjectId } },
      {
        $project: {
          imageCount: { $size: { $ifNull: ['$images', []] } }
        }
      }
    ]);
    if (!meta) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    const existingImageCount = typeof meta.imageCount === 'number' ? meta.imageCount : 0;
    
    // Handle image updates
    const newFiles: File[] = [];
    const existingImageIndices: number[] = [];

    for (const image of images) {
      if (image instanceof File) {
        newFiles.push(image);
        continue;
      }

      if (typeof image !== 'string') continue;

      // Supports both relative and absolute URLs.
      const match = image.match(/\/api\/images\/[a-fA-F0-9]{24}\/(\d+)(?:\?.*)?$/);
      if (!match) continue;

      const index = parseInt(match[1], 10);
      if (!Number.isFinite(index)) continue;
      if (index < 0 || index >= existingImageCount) continue;
      existingImageIndices.push(index);
    }

    const hasAnyImageField = images.length > 0;
    const keepingAllExistingInOrder =
      existingImageIndices.length === existingImageCount &&
      existingImageIndices.every((idx, i) => idx === i);

    const shouldKeepImagesUnchanged =
      newFiles.length === 0 && (!hasAnyImageField || keepingAllExistingInOrder);

    let imageBase64Strings: string[] | undefined;
    if (!shouldKeepImagesUnchanged) {
      imageBase64Strings = [];

      if (existingImageIndices.length > 0) {
        const [kept] = await Product.aggregate([
          { $match: { _id: productObjectId } },
          {
            $project: {
              images: {
                $map: {
                  input: existingImageIndices,
                  as: 'idx',
                  in: { $arrayElemAt: ['$images', '$$idx'] }
                }
              }
            }
          }
        ]);

        if (kept && Array.isArray(kept.images)) {
          imageBase64Strings.push(
            ...kept.images.filter((img: unknown) => typeof img === 'string' && img.length > 0)
          );
        }
      }

      for (const image of newFiles) {
        const mimeType = image.type || 'image/jpeg';
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = buffer.toString('base64');
        imageBase64Strings.push(`data:${mimeType};base64,${base64String}`);
      }
    }
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      { ...updateData, ...(shouldKeepImagesUnchanged ? {} : { images: imageBase64Strings }) },
      { new: true, runValidators: true }
    ).select('-images');

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const finalImageCount = shouldKeepImagesUnchanged
      ? existingImageCount
      : (imageBase64Strings?.length ?? 0);

    const productWithImageUrls = {
      ...updatedProduct.toObject(),
      imageCount: finalImageCount,
      images: Array.from(
        { length: finalImageCount },
        (_, index) => `/api/images/${updatedProduct._id}/${index}`
      )
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
  _request: NextRequest,
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

    const deleteResult = await Product.deleteOne({ _id: params.id });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

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
