import fs from 'fs';
import path from 'path';

import { MongoClient } from 'mongodb';
import sharp from 'sharp';

const PRODUCT_IMAGE_VARIANTS = {
  thumb: {
    width: 320,
    quality: 64,
  },
  detail: {
    width: 1100,
    quality: 74,
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
          'images.0': { $exists: true },
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

    console.log(`Found ${products.length} products with legacy images.`);

    for (const product of products) {
      const legacyImages = Array.isArray(product.images)
        ? product.images.filter((image) => typeof image === 'string' && image.length > 0)
        : [];

      if (!legacyImages.length) {
        continue;
      }

      const imageDocs = [];
      for (let position = 0; position < legacyImages.length; position += 1) {
        const buffer = decodeDataUri(legacyImages[position]);
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
