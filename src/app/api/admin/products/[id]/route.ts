import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import {
  deleteStoredProductImages,
  fileToProductImageSource,
  loadStoredProductImages,
  ProductImageSource,
  replaceStoredProductImages,
} from '@/lib/productImageStorage';
import {
  normalizeProductImages,
  parseProductImageIndexFromUrl,
  resolveProductImageCount,
} from '@/lib/productImageUrls';

type ProductImageMeta = {
  _id: unknown;
  imageCount?: number | null;
  images?: string[];
  [key: string]: unknown;
};

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

    const [product] = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(params.id) } },
      {
        $project: {
          name: 1,
          price: 1,
          originalPrice: 1,
          size: 1,
          color: 1,
          disabledColors: 1,
          discount: 1,
          category: 1,
          availability: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          imageCount: {
            $ifNull: ['$imageCount', { $size: { $ifNull: ['$images', []] } }],
          },
        },
      },
    ]);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: normalizeProductImages(product),
    });
  } catch (error) {
    console.error('Error fetching product:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch product',
        error: error instanceof Error ? error.message : 'Unknown error',
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

    const productDataString =
      typeof productData === 'string'
        ? productData
        : productData instanceof File
          ? await productData.text()
          : null;

    if (!productDataString) {
      return NextResponse.json(
        { success: false, message: 'Invalid product data' },
        { status: 400 }
      );
    }

    let updateData: any;
    try {
      updateData = JSON.parse(productDataString);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid product data JSON' },
        { status: 400 }
      );
    }

    if (Array.isArray(updateData.color)) {
      updateData.color = updateData.color.filter((color: string) => color && color.trim() !== '');
    }

    if (Array.isArray(updateData.disabledColors)) {
      updateData.disabledColors = updateData.disabledColors.filter(
        (color: string) =>
          color &&
          color.trim() !== '' &&
          Array.isArray(updateData.color) &&
          updateData.color.includes(color)
      );
    } else {
      updateData.disabledColors = [];
    }

    if (Array.isArray(updateData.size)) {
      updateData.size = updateData.size.filter((size: string) => size && size.trim() !== '');
    }

    if (!Array.isArray(updateData.color) || updateData.color.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'At least one color is required',
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(updateData.size) || updateData.size.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'At least one size is required',
        },
        { status: 400 }
      );
    }

    const productMeta = (await Product.findById(productObjectId)
      .select('images imageCount')
      .lean()) as ProductImageMeta | null;

    if (!productMeta) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const existingImageCount = resolveProductImageCount(productMeta);
    const newFiles = images.filter((image): image is File => image instanceof File);
    const existingImagePaths = images.filter(
      (image): image is string => typeof image === 'string'
    );

    const keepingAllExistingInOrder =
      existingImagePaths.length === existingImageCount &&
      existingImagePaths.every((imagePath, index) => {
        const parsedIndex = parseProductImageIndexFromUrl(imagePath, params.id);
        return parsedIndex === index;
      });

    const shouldKeepImagesUnchanged =
      newFiles.length === 0 && (!images.length || keepingAllExistingInOrder);

    let finalImageCount = existingImageCount;
    const nextProductData: Record<string, unknown> = { ...updateData };

    if (!shouldKeepImagesUnchanged) {
      const requestedExistingIndices = existingImagePaths
        .map((imagePath) => parseProductImageIndexFromUrl(imagePath, params.id))
        .filter((index): index is number => index !== null);

      const storedImages = await loadStoredProductImages(productObjectId);
      const storedByPosition = new Map(
        storedImages.map((image) => [image.position, image.variants])
      );

      const needsLegacyImages = requestedExistingIndices.some(
        (index) => !storedByPosition.has(index)
      );

      let legacyImages: string[] = [];
      if (needsLegacyImages) {
        const productWithLegacyImages = (await Product.findById(productObjectId)
          .select('images')
          .lean()) as ProductImageMeta | null;

        legacyImages = Array.isArray(productWithLegacyImages?.images)
          ? productWithLegacyImages.images.filter(
              (image): image is string => typeof image === 'string' && image.length > 0
            )
          : [];
      }

      const finalSources: ProductImageSource[] = [];

      for (const index of requestedExistingIndices) {
        const storedVariants = storedByPosition.get(index);
        if (storedVariants) {
          finalSources.push({
            type: 'stored',
            variants: storedVariants,
          });
          continue;
        }

        const legacyImage = legacyImages[index];
        if (legacyImage) {
          finalSources.push({
            type: 'dataUri',
            dataUri: legacyImage,
          });
        }
      }

      const uploadedImageSources = await Promise.all(
        newFiles.map((file) => fileToProductImageSource(file))
      );
      finalSources.push(...uploadedImageSources);

      if (!finalSources.length) {
        return NextResponse.json(
          {
            success: false,
            message: 'At least one image is required',
          },
          { status: 400 }
        );
      }

      await replaceStoredProductImages(productObjectId, finalSources);
      finalImageCount = finalSources.length;
      nextProductData.imageCount = finalImageCount;
      nextProductData.images = [];
    } else {
      nextProductData.imageCount = existingImageCount;
    }

    const updatedProduct = (await Product.findByIdAndUpdate(
      params.id,
      nextProductData,
      { new: true, runValidators: true }
    )
      .select('-images')
      .lean()) as ProductImageMeta | null;

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: normalizeProductImages({
        ...updatedProduct,
        imageCount: finalImageCount,
      }),
    });
  } catch (error) {
    console.error('Error updating product:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update product',
        error: error instanceof Error ? error.message : 'Unknown error',
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

    const product = await Product.findById(params.id).select('_id');
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    await deleteStoredProductImages(product._id);
    await Product.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete product',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
