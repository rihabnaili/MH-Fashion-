// Seeds visible, priced TEST products from the photos in ./product so the storefront has content.
//
//   node scripts/seed-test-products.mjs          # create test products (skips ones that exist)
//   node scripts/seed-test-products.mjs --clean  # delete every product this script created
//
// Reads MONGODB_URI from .env.local. Every product it creates is tagged with `seedTag: "test"`
// so it can be removed cleanly without touching real products.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { MongoClient, ObjectId } from 'mongodb';
import sharp from 'sharp';

const ROOT = process.cwd();
const SEED_TAG = 'test';

const IMAGE_VARIANTS = {
  blur: { width: 40, quality: 34 },
  thumb: { width: 320, quality: 64, square: true },
  gallery: { width: 720, quality: 66 },
  detail: { width: 960, quality: 70 },
};

const TYPES = {
  pontalons: {
    category: 'shortsPantalons',
    fr: 'Pantalon',
    ar: 'بنطلون',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: {
      fr: 'Pantalon homme confortable, coupe moderne, idéal pour tous les jours.',
      ar: 'بنطلون رجالي مريح بقصة عصرية، مثالي للاستعمال اليومي.',
    },
  },
  pulls: {
    category: 'tShirtsPolos',
    fr: 'Pull',
    ar: 'بلوزة',
    sizes: ['M', 'L', 'XL'],
    description: {
      fr: 'Pull homme doux et chaud, parfait pour la mi-saison.',
      ar: 'بلوزة رجالية ناعمة ودافئة، مثالية لفصل الخريف.',
    },
  },
  sets: {
    category: 'ensembles',
    fr: 'Ensemble',
    ar: 'طقم',
    sizes: ['S', 'M', 'L', 'XL'],
    description: {
      fr: 'Ensemble homme assorti haut et bas, tissu de qualité.',
      ar: 'طقم رجالي متناسق علوي وسفلي، قماش عالي الجودة.',
    },
  },
};

// Deterministic "random" prices so re-runs produce the same catalogue.
const PRICES = {
  pontalons: [45, 49, 55, 59, 65, 52, 48, 62],
  pulls: [55, 59],
  sets: [89, 99, 109, 119],
};

function readMongoUri() {
  const env = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8');
  const match = env.match(/^MONGODB_URI=(.*)$/m);
  if (!match?.[1] || match[1].includes('<')) {
    throw new Error('Set a real MONGODB_URI in .env.local first');
  }
  return match[1].trim().replace(/^["']|["']$/g, '');
}

function titleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugify(value) {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'produit'
  );
}

function colorsFromFilename(filename) {
  const colors = [];
  if (/noir/i.test(filename)) colors.push('Noir');
  if (/blanc/i.test(filename)) colors.push('Blanc');
  return colors.length ? colors : ['Standard'];
}

function arabicColors(colors) {
  const map = { Noir: 'أسود', Blanc: 'أبيض' };
  return colors.map((color) => map[color]).filter(Boolean).join(' و ');
}

function productNames(type, filename) {
  // "pontalon noir nike.jpeg" -> "Pantalon Noir Nike"
  const base = filename
    .replace(/\.[^.]+$/, '')
    .replace(/^(pontalons?|pulls?|sets?)\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  const fr = titleCase(`${TYPES[type].fr} ${base}`.trim()).replace(/ Et /g, ' et ');
  const arColors = arabicColors(colorsFromFilename(filename));
  const ar = `${TYPES[type].ar}${arColors ? ` ${arColors}` : ''}${/nike/i.test(base) ? ' نايك' : ''}${
    /fila/i.test(base) ? ' فيلا' : ''
  }${/sport/i.test(base) ? ' رياضي' : ''}`;
  return { fr, ar };
}

async function createImageVariants(buffer) {
  const entries = await Promise.all(
    Object.entries(IMAGE_VARIANTS).map(async ([variant, options]) => {
      const data = await sharp(buffer)
        .rotate()
        .resize({
          width: options.width,
          height: options.square ? options.width : undefined,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: options.quality })
        .toBuffer();
      return [variant, { data, contentType: 'image/webp' }];
    })
  );
  return Object.fromEntries(entries);
}

function buildCatalogue() {
  const catalogue = [];

  for (const type of Object.keys(TYPES)) {
    const dir = path.join(ROOT, 'product', type);
    const files = fs
      .readdirSync(dir)
      .filter((filename) => /\.(jpe?g|png|webp)$/i.test(filename))
      .sort((a, b) => a.localeCompare(b));

    files.forEach((filename, index) => {
      const price = PRICES[type][index % PRICES[type].length];
      const discounted = index % 3 === 0;
      catalogue.push({
        type,
        filePath: path.join(dir, filename),
        name: productNames(type, filename),
        category: TYPES[type].category,
        price,
        originalPrice: discounted ? price + 20 : undefined,
        colors: colorsFromFilename(filename),
      });
    });
  }

  // Reuse a few photos so the promo / new-arrival / pack categories are not empty.
  const extras = [
    { pick: 0, category: 'nouveautes', prefix: 'Nouveauté' },
    { pick: 9, category: 'nouveautes', prefix: 'Nouveauté' },
    { pick: 11, category: 'nouveautes', prefix: 'Nouveauté' },
    { pick: 2, category: 'promos', prefix: 'Promo', discount: 30 },
    { pick: 8, category: 'promos', prefix: 'Promo', discount: 25 },
    { pick: 12, category: 'promos', prefix: 'Promo', discount: 20 },
    { pick: 10, category: 'packsOffresSpeciales', prefix: 'Pack 2x', pack: true },
    { pick: 13, category: 'packsOffresSpeciales', prefix: 'Pack 2x', pack: true },
  ];

  for (const extra of extras) {
    const source = catalogue[extra.pick];
    if (!source) continue;

    const originalPrice = extra.pack ? source.price * 2 : source.price;
    const price = extra.pack
      ? Math.round(source.price * 2 * 0.85)
      : extra.discount
        ? Math.round(source.price * (1 - extra.discount / 100))
        : source.price;

    catalogue.push({
      ...source,
      name: {
        fr: `${extra.prefix} ${source.name.fr}`,
        ar: `${extra.pack ? 'باك 2x' : extra.category === 'promos' ? 'تخفيض' : 'جديد'} ${source.name.ar}`,
      },
      category: extra.category,
      price,
      originalPrice: price < originalPrice ? originalPrice : undefined,
    });
  }

  return catalogue;
}

async function clean(db) {
  const seeded = await db
    .collection('products')
    .find({ seedTag: SEED_TAG }, { projection: { _id: 1 } })
    .toArray();
  const ids = seeded.map((product) => product._id);
  const images = await db.collection('productimages').deleteMany({ productId: { $in: ids } });
  const products = await db.collection('products').deleteMany({ _id: { $in: ids } });
  console.log(`Removed ${products.deletedCount} test products and ${images.deletedCount} images.`);
}

async function seed(db) {
  const products = db.collection('products');
  const productImages = db.collection('productimages');
  const variantCache = new Map();
  let inserted = 0;
  let skipped = 0;

  for (const item of buildCatalogue()) {
    const slug = slugify(item.name.fr);

    if (await products.findOne({ slug, category: item.category })) {
      skipped += 1;
      continue;
    }

    if (!variantCache.has(item.filePath)) {
      variantCache.set(item.filePath, await createImageVariants(fs.readFileSync(item.filePath)));
    }

    const now = new Date();
    const productId = new ObjectId();
    const discount =
      item.originalPrice && item.originalPrice > item.price
        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
        : 0;

    await productImages.insertOne({
      productId,
      position: 0,
      variants: variantCache.get(item.filePath),
      createdAt: now,
      updatedAt: now,
    });

    await products.insertOne({
      _id: productId,
      name: item.name,
      slug,
      price: item.price,
      ...(item.originalPrice ? { originalPrice: item.originalPrice } : {}),
      size: TYPES[item.type].sizes,
      color: item.colors,
      disabledColors: [],
      discount,
      category: item.category,
      availability: true,
      images: [],
      imageCount: 1,
      description: TYPES[item.type].description,
      seedTag: SEED_TAG,
      createdAt: now,
      updatedAt: now,
    });

    inserted += 1;
    console.log(`+ [${item.category}] ${item.name.fr} — ${item.price} DT`);
  }

  console.log(
    `Done: ${inserted} inserted, ${skipped} already existed. ` +
      `Total products: ${await products.countDocuments()} ` +
      `(${await products.countDocuments({ availability: true })} visible).`
  );
}

async function main() {
  const client = new MongoClient(process.env.SEED_MONGODB_URI || readMongoUri(), {
    serverSelectionTimeoutMS: 10000,
  });
  await client.connect();

  try {
    const db = client.db();
    console.log(`Database: ${db.databaseName}`);
    if (process.argv.includes('--clean')) {
      await clean(db);
    } else {
      await seed(db);
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
