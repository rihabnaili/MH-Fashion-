import 'server-only';

import mongoose from 'mongoose';
import sharp from 'sharp';

import ProductImage from '@/models/ProductImage';
import { PRODUCT_IMAGE_VARIANTS, ProductImageVariant } from '@/lib/productImageUrls';

type StoredVariantPayload = {
  data: Buffer;
  contentType: string;
};

export type StoredImageVariants = Record<ProductImageVariant, StoredVariantPayload>;

export type ProductImageSource =
  | {
      type: 'stored';
      variants: StoredImageVariants;
    }
  | {
      type: 'buffer';
      buffer: Buffer;
    }
  | {
      type: 'dataUri';
      dataUri: string;
    };

export function decodeLegacyImageDataUri(dataUri: string) {
  const matches = dataUri.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

  if (!matches || matches.length !== 3) {
    return null;
  }

  return {
    mimeType: matches[1],
    buffer: Buffer.from(matches[2], 'base64'),
  };
}

export async function createStoredImageVariants(buffer: Buffer): Promise<StoredImageVariants> {
  const detail = await sharp(buffer)
    .rotate()
    .resize({
      width: PRODUCT_IMAGE_VARIANTS.detail.width,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: PRODUCT_IMAGE_VARIANTS.detail.quality })
    .toBuffer();

  const thumb = await sharp(buffer)
    .rotate()
    .resize({
      width: PRODUCT_IMAGE_VARIANTS.thumb.width,
      height: PRODUCT_IMAGE_VARIANTS.thumb.width,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: PRODUCT_IMAGE_VARIANTS.thumb.quality })
    .toBuffer();

  return {
    thumb: {
      data: thumb,
      contentType: 'image/webp',
    },
    detail: {
      data: detail,
      contentType: 'image/webp',
    },
  };
}

function coerceStoredBinaryToBuffer(value: unknown) {
  if (!value) {
    return null;
  }

  if (Buffer.isBuffer(value)) {
    return Buffer.from(value);
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }

  if (typeof value === 'object') {
    const candidate = value as {
      buffer?: unknown;
      data?: unknown;
    };

    if (Buffer.isBuffer(candidate.buffer)) {
      return Buffer.from(candidate.buffer);
    }

    if (candidate.buffer instanceof Uint8Array) {
      return Buffer.from(candidate.buffer);
    }

    if (Buffer.isBuffer(candidate.data)) {
      return Buffer.from(candidate.data);
    }

    if (candidate.data instanceof Uint8Array) {
      return Buffer.from(candidate.data);
    }

    if (Array.isArray(candidate.data)) {
      return Buffer.from(candidate.data);
    }
  }

  return null;
}

export async function fileToProductImageSource(file: File): Promise<ProductImageSource> {
  const bytes = await file.arrayBuffer();
  return {
    type: 'buffer',
    buffer: Buffer.from(bytes),
  };
}

async function variantsForSource(source: ProductImageSource): Promise<StoredImageVariants> {
  if (source.type === 'stored') {
    return source.variants;
  }

  if (source.type === 'buffer') {
    return createStoredImageVariants(source.buffer);
  }

  const decoded = decodeLegacyImageDataUri(source.dataUri);
  if (!decoded) {
    throw new Error('Invalid legacy image format');
  }

  return createStoredImageVariants(decoded.buffer);
}

export async function replaceStoredProductImages(
  productId: mongoose.Types.ObjectId,
  sources: ProductImageSource[]
) {
  await ProductImage.deleteMany({ productId });

  if (!sources.length) {
    return;
  }

  const docs = await Promise.all(
    sources.map(async (source, position) => ({
      productId,
      position,
      variants: await variantsForSource(source),
    }))
  );

  await ProductImage.insertMany(docs);
}

export async function readStoredProductImageVariant(
  productId: mongoose.Types.ObjectId,
  position: number,
  variant: ProductImageVariant
) {
  const doc = (await ProductImage.findOne(
    { productId, position },
    {
      [`variants.${variant}.data`]: 1,
      [`variants.${variant}.contentType`]: 1,
    }
  ).lean()) as { variants?: Partial<StoredImageVariants> } | null;

  const variantData = doc?.variants?.[variant];
  const buffer = coerceStoredBinaryToBuffer(variantData?.data);

  if (!buffer || !variantData?.contentType) {
    return null;
  }

  return {
    data: buffer,
    contentType: variantData.contentType,
  };
}

export async function loadStoredProductImages(productId: mongoose.Types.ObjectId) {
  const docs = (await ProductImage.find({ productId })
    .sort({ position: 1 })
    .lean()) as unknown as Array<{
    position: number;
    variants: StoredImageVariants;
  }>;

  return docs.map((doc) => ({
    position: doc.position,
    variants: {
      thumb: {
        data: coerceStoredBinaryToBuffer(doc.variants.thumb.data) ?? Buffer.alloc(0),
        contentType: doc.variants.thumb.contentType,
      },
      detail: {
        data: coerceStoredBinaryToBuffer(doc.variants.detail.data) ?? Buffer.alloc(0),
        contentType: doc.variants.detail.contentType,
      },
    },
  }));
}

export async function deleteStoredProductImages(productId: mongoose.Types.ObjectId | string) {
  const normalizedId =
    typeof productId === 'string' ? new mongoose.Types.ObjectId(productId) : productId;
  await ProductImage.deleteMany({ productId: normalizedId });
}
