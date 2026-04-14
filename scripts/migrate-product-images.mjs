import fs from 'fs';
import path from 'path';

import { MongoClient } from 'mongodb';
import sharp from 'sharp';

const PRODUCT_IMAGE_VARIANTS = {
  blur: {
    width: 40,
    quality: 34,
  },
  thumb: {
    width: 320,
    quality: 64,
  },
  gallery: {
    width: 720,
    quality: 66,
  },
  detail: {
    width: 960,
    quality: 70,
  },
};

function loadMongoUri() {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const envPath = path.join(process.cwd(), '.env.local');
  const envFile = fs.readFileSync(envPath, 'utf8');
  const match = envFile.match(/^MONGODB_URI=(.*)$/m);

  if (!match) {
    throw new Error('Missing MONGODB_URI in process env or .env.local');
  }

  return match[1].trim();
}

function decodeDataUri(dataUri) {
  const matches = dataUri.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid legacy image format');
  }

  return Buffer.from(matches[2], 'base64');
}

async function buildVariants(buffer) {
  const blur = await sharp(buffer)
    .rotate()
    .resize({
      width: PRODUCT_IMAGE_VARIANTS.blur.width,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: PRODUCT_IMAGE_VARIANTS.blur.quality })
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

  const gallery = await sharp(buffer)
    .rotate()
    .resize({
      width: PRODUCT_IMAGE_VARIANTS.gallery.width,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: PRODUCT_IMAGE_VARIANTS.gallery.quality })
    .toBuffer();

  const detail = await sharp(buffer)
    .rotate()
    .resize({
      width: PRODUCT_IMAGE_VARIANTS.detail.width,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: PRODUCT_IMAGE_VARIANTS.detail.quality })
    .toBuffer();

  return {
    blur: {
      data: blur,
      contentType: 'image/webp',
    },
    thumb: {
      data: thumb,
      contentType: 'image/webp',
    },
    gallery: {
      data: gallery,
      contentType: 'image/webp',
    },
    detail: {
      data: detail,
      contentType: 'image/webp',
    },
  };
}

function coerceStoredBinaryToBuffer(value) {
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
    if (Buffer.isBuffer(value.buffer)) {
      return Buffer.from(value.buffer);
    }

    if (value.buffer instanceof Uint8Array) {
      return Buffer.from(value.buffer);
    }

    if (Buffer.isBuffer(value.data)) {
      return Buffer.from(value.data);
    }

    if (value.data instanceof Uint8Array) {
      return Buffer.from(value.data);
    }
  }

  return null;
}

function resolveStoredSourceBuffer(existingImageDoc) {
  if (!existingImageDoc?.variants) {
    return null;
  }

  return (
    coerceStoredBinaryToBuffer(existingImageDoc.variants.detail?.data) ??
    coerceStoredBinaryToBuffer(existingImageDoc.variants.gallery?.data) ??
    coerceStoredBinaryToBuffer(existingImageDoc.variants.thumb?.data) ??
    coerceStoredBinaryToBuffer(existingImageDoc.variants.blur?.data)
  );
}

const shouldDropLegacyImages = process.argv.includes('--drop-legacy');

async function main() {
  const mongoUri = loadMongoUri();
  const client = new MongoClient(mongoUri);

  await client.connect();

  try {
    const db = client.db();
    const productsCollection = db.collection('products');
    const productImagesCollection = db.collection('productimages');

    await productImagesCollection.createIndex(
      { productId: 1, position: 1 },
      { unique: true }
    );

    const products = await productsCollection
      .find(
        {
          $or: [
            { 'images.0': { $exists: true } },
            { imageCount: { $gt: 0 } },
          ],
        },
        {
          projection: {
            _id: 1,
            images: 1,
            imageCount: 1,
            name: 1,
          },
        }
      )
      .toArray();

    console.log(`Found ${products.length} products with images to rebuild.`);

    for (const product of products) {
      const legacyImages = Array.isArray(product.images)
        ? product.images.filter((image) => typeof image === 'string' && image.length > 0)
        : [];
      const existingImageDocs = await productImagesCollection
        .find({ productId: product._id })
        .sort({ position: 1 })
        .toArray();

      const targetImageCount = Math.max(
        legacyImages.length,
        existingImageDocs.length,
        Number.isFinite(product.imageCount) ? product.imageCount : 0
      );

      if (!targetImageCount) {
        continue;
      }

      const imageDocs = [];
      for (let position = 0; position < targetImageCount; position += 1) {
        const legacyImage = legacyImages[position];
        const existingImageDoc = existingImageDocs[position];
        const buffer = legacyImage
          ? decodeDataUri(legacyImage)
          : resolveStoredSourceBuffer(existingImageDoc);

        if (!buffer) {
          continue;
        }

        imageDocs.push({
          productId: product._id,
          position,
          variants: await buildVariants(buffer),
        });
      }

      await productImagesCollection.deleteMany({ productId: product._id });
      await productImagesCollection.insertMany(imageDocs);

      const update = {
        $set: {
          imageCount: imageDocs.length,
        },
      };

      if (shouldDropLegacyImages) {
        update.$set.images = [];
      }

      await productsCollection.updateOne({ _id: product._id }, update);

      console.log(
        `Migrated ${imageDocs.length} images for ${product.name?.fr || product._id.toString()}`
      );
    }

    console.log('Product image migration completed successfully.');
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error('Product image migration failed:', error);
  process.exit(1);
});
