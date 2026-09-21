import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { MongoClient, ObjectId } from 'mongodb';
import sharp from 'sharp';

const ROOT = process.cwd();

const PRODUCT_FOLDERS = [
  { dir: 'product/pontalons', category: 'shortsPantalons' },
  { dir: 'product/pulls', category: 'tShirtsPolos' },
  { dir: 'product/sets', category: 'ensembles' },
];

const IMAGE_VARIANTS = {
  blur: { width: 40, quality: 34 },
  thumb: { width: 320, quality: 64, square: true },
  gallery: { width: 720, quality: 66 },
  detail: { width: 960, quality: 70 },
};

function readMongoUri() {
  const envPath = path.join(ROOT, '.env.local');
  const env = fs.readFileSync(envPath, 'utf8');
  const match = env.match(/^MONGODB_URI=(.*)$/m);

  if (!match?.[1]) {
    throw new Error('MONGODB_URI was not found in .env.local');
  }

  return match[1].trim().replace(/^["']|["']$/g, '');
}

function titleFromFilename(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugify(value) {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'produit';
}

function colorsFromFilename(filename) {
  const colors = [];

  if (/noir/i.test(filename)) colors.push('Noir');
  if (/blanc/i.test(filename)) colors.push('Blanc');

  return colors.length ? colors : ['Standard'];
}

async function createImageVariants(filePath) {
  const source = fs.readFileSync(filePath);
  const entries = await Promise.all(
    Object.entries(IMAGE_VARIANTS).map(async ([variant, options]) => {
      let pipeline = sharp(source).rotate().resize({
        width: options.width,
        height: options.square ? options.width : undefined,
        fit: 'inside',
        withoutEnlargement: true,
      });

      const data = await pipeline.webp({ quality: options.quality }).toBuffer();
      return [variant, { data, contentType: 'image/webp' }];
    })
  );

  return Object.fromEntries(entries);
}

async function main() {
  const uri = readMongoUri();
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

  await client.connect();
  const db = client.db();
  const products = db.collection('products');
  const productImages = db.collection('productimages');

  let inserted = 0;
  let skipped = 0;

  for (const folder of PRODUCT_FOLDERS) {
    const folderPath = path.join(ROOT, folder.dir);
    const files = fs
      .readdirSync(folderPath)
      .filter((filename) => /\.(jpe?g|png|webp)$/i.test(filename))
      .sort((a, b) => a.localeCompare(b));

    for (const filename of files) {
      const name = titleFromFilename(filename);
      const slug = slugify(name);
      const existing = await products.findOne({ slug, category: folder.category });

      if (existing) {
        skipped += 1;
        console.log(`Skipped existing draft: ${name}`);
        continue;
      }

      const now = new Date();
      const productId = new ObjectId();
      const filePath = path.join(folderPath, filename);

      await products.insertOne({
        _id: productId,
        name: { fr: name, ar: name },
        slug,
        price: 0,
        originalPrice: 0,
        size: ['S', 'M', 'L', 'XL'],
        color: colorsFromFilename(filename),
        disabledColors: [],
        discount: 0,
        category: folder.category,
        availability: false,
        images: [],
        imageCount: 1,
        description: {
          fr: 'Produit importe depuis les fichiers locaux. A verifier avant publication.',
          ar: 'Produit importe depuis les fichiers locaux. A verifier avant publication.',
        },
        createdAt: now,
        updatedAt: now,
      });

      await productImages.insertOne({
        productId,
        position: 0,
        variants: await createImageVariants(filePath),
        createdAt: now,
        updatedAt: now,
      });

      inserted += 1;
      console.log(`Imported hidden draft: ${name}`);
    }
  }

  console.log(
    JSON.stringify({
      database: db.databaseName,
      inserted,
      skipped,
      products: await products.countDocuments(),
      productImages: await productImages.countDocuments(),
    })
  );

  await client.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
