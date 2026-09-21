# MH Fashion Website Documentation

This document describes the current MH Fashion codebase as implemented in this repository. It covers the public storefront, admin interface, backend API routes, database models, image pipeline, integrations, configuration, and known operational/security gaps.

## 1. Project Overview

MH Fashion is a bilingual French/Arabic e-commerce website for men's fashion. It is built as a single Next.js 14 application:

- Frontend: Next.js App Router, React 18, Tailwind CSS.
- Backend: Next.js API routes under `src/app/api`.
- Database: MongoDB through Mongoose.
- Images: product images stored in MongoDB as optimized WebP variants.
- Languages: French (`fr`) and Arabic (`ar`), with RTL support for Arabic.
- Admin: client-side password gate plus admin pages for products, orders, statistics, and sponsors.

The backend is not a separate server. It runs inside the same Next.js application through API route handlers.

## 2. Main Technology Stack

Core runtime:

- `next@14.1.0`
- `react@18.2.0`
- `typescript`
- `tailwindcss`
- `mongoose`
- `mongodb`
- `sharp`
- `lucide-react`

Package manager:

- Declared package manager: `pnpm@9.12.3`
- Required Node version: `20.x`

Available scripts:

```bash
corepack pnpm dev
corepack pnpm build
corepack pnpm start
corepack pnpm lint
corepack pnpm migrate:product-images
```

There are currently no `test`, `test:unit`, or `test:integration` scripts.

## 3. Application Structure

Important folders:

- `src/app`: Next.js App Router pages, layouts, API routes, contexts, hooks, and components.
- `src/app/api`: backend API routes.
- `src/app/admin`: admin UI pages.
- `src/app/components`: reusable UI, layout, section, and admin components.
- `src/app/context`: React context providers for language, cart, and admin auth.
- `src/app/i18n`: frontend and backend translation JSON files.
- `src/lib`: database helpers, product routes, product image helpers, storefront query helpers, Mofavo integration.
- `src/models`: Mongoose models.
- `public`: public static assets.
- `product`: local product image source folder, not used directly by the runtime storefront.
- `scripts`: migration scripts.

## 4. Public Storefront

### 4.1 Global Layout

All public pages are wrapped by:

- `src/app/layout.tsx`
- `src/app/components/layouts/MainLayout.js`

`RootLayout` configures:

- Global metadata and SEO defaults.
- Google fonts through `next/font/google`: Montserrat, Cinzel, Noto Sans Arabic.
- Meta Pixel script with ID `4424903821170372`.
- Language provider.
- Cart provider.
- Main public layout.

`MainLayout` checks the current path. If the path starts with `/admin`, it returns the admin page without public header/footer. Otherwise it renders:

- fixed header
- page content
- footer

### 4.2 Header

File: `src/app/components/layouts/Header.js`

Features:

- Fixed top navigation.
- Logo linking to `/`.
- Desktop search input.
- Mobile menu drawer.
- Cart button with live item count.
- Language toggle.
- Links to:
  - `/tous-nos-produits`
  - `/contact`

Search behavior:

- The user types a query.
- Submit redirects to `/tous-nos-produits?search=<query>`.
- If query is empty, submit redirects to `/tous-nos-produits`.
- On the all-products page, the header reads the current search parameter and fills the search input.

Mobile menu behavior:

- Opens a drawer from left or right depending on RTL.
- Locks body scroll while open.
- Closes on outside click.
- Includes search, navigation links, and language toggle.

### 4.3 Footer

File: `src/app/components/layouts/Footer.js`

Footer includes:

- Logo.
- Store description.
- Useful links:
  - `/tous-nos-produits`
  - `/nouveautes`
  - `/promos`
- Category links:
  - `/ensembles`
  - `/t-shirts-polos`
  - `/shorts-pantalons`
  - `/chemises`
- Contact information:
  - `mhclothes11@gmail.com`
  - `+216 54 407 135`
  - customer service 7/7

### 4.4 Homepage

Route:

- `/`

Files:

- `src/app/(public)/page.tsx`
- `src/app/components/pages/index.js`
- homepage sections under `src/app/components/sections`

Homepage sections:

1. Hero section
   - File: `HeroSection.js`
   - Shows `/home-media/main_page.png` full-width over a black background.

2. Featured/category product sections
   - File: `FeaturedProducts.js`
   - Fetches latest products using `useProducts({ limit: 24, sortBy: "createdAt", sortOrder: "desc" })`.
   - Groups products into category sections:
     - `ensembles`
     - `tShirtsPolos`
     - `shortsPantalons`
     - `chemises`
   - Shows up to 4 products per category section.
   - Shows a final catalog preview with up to 8 latest products.
   - Displays loading skeletons, empty state, or error state.

3. Services section
   - File: `ServicesSection.js`
   - Shows trust/service cards:
     - free delivery from 100 DT
     - payment on delivery
     - check before payment
     - customer support 7/7

4. Sponsors section
   - File: `SponsorsSection.tsx`
   - Calls `/api/sponsors`.
   - Shows only active sponsors.
   - If a sponsor has a website URL, the logo links externally.
   - If there are no active sponsors, the section is hidden.

There are also older/unused-looking section components:

- `CategoriesSection.js`
- `ProductTabs.js`

These exist in the codebase but are not necessarily rendered by the current homepage unless imported by `components/pages/index.js`.

## 5. Product Catalog

### 5.1 All Products Page

Route:

- `/tous-nos-produits`

File:

- `src/app/tous-nos-produits/page.tsx`

Features:

- Lists available products.
- Reads `search` from URL query string.
- Filters by category.
- Sorts by:
  - newest: `createdAt-desc`
  - oldest: `createdAt-asc`
  - price ascending: `price-asc`
  - price descending: `price-desc`
  - promotions: `discount-desc`
- Uses page-based pagination with 12 products per page.
- Shows loading skeleton, error state, empty state, and product grid.

Data flow:

1. UI state stores selected category, search query, sort field, and sort order.
2. `useProducts` calls `/api/products`.
3. API returns products and pagination metadata.
4. Page renders `ProductCard` for each product.

### 5.2 Category Pages

Routes:

- `/ensembles`
- `/t-shirts-polos`
- `/shorts-pantalons`
- `/chemises`
- `/packs-offres-speciales`
- `/promos`
- `/nouveautes`

File:

- `src/app/[category]/page.tsx`

Category mapping is defined in `src/lib/productRoutes.ts`.

Behavior:

- Reads category slug from URL.
- Converts slug to database category value.
- Fetches products with `/api/products?category=<value>`.
- Shows sort control.
- Shows product grid.
- Uses "load more" if more pages exist.
- If category slug is unknown, shows "Categorie non trouvee".

### 5.3 Product Cards

File:

- `src/app/components/ui/ProductCard.js`

Behavior:

- Displays product image, name, price, original price if discounted, and action label.
- Uses current language to choose product name.
- Builds image URL with `buildProductImageUrl`.
- Links to canonical product URL using product category and slug.

### 5.4 Product Detail Routes

Canonical product route:

- `/<category-slug>/<product-slug>`

File:

- `src/app/[category]/[slug]/page.tsx`

Legacy product route:

- `/produit/[id]`

File:

- `src/app/produit/[id]/page.tsx`

Behavior:

- Product detail by ID redirects permanently to the canonical SEO route.
- Canonical route loads product by category slug and product slug.
- If the stored canonical path does not match the requested URL, it redirects to the canonical path.
- If the product does not exist or is unavailable, returns `notFound()`.

Metadata:

- Product pages generate dynamic metadata.
- Title: `<product name> - MH Fashion`.
- Description comes from French description or fallback.
- OpenGraph/Twitter images use the product detail image variant.

### 5.5 Product Detail UI

File:

- `src/app/produit/[id]/ProductDetailClient.tsx`

Features:

- Product image gallery.
- Product name in selected language.
- Price and original price.
- Delivery fee display: 8 DT.
- Size selector using fixed sizes:
  - XS, S, M, L, XL, XXL, XXXL
- Color selector.
- Disabled colors shown as unavailable.
- Quantity selector with minimum of 1.
- Checkout form on the same page.
- Description section if description exists.

Important behavior:

- The checkout form is only shown when required size/color selections are valid.
- Disabled colors cannot be selected.

### 5.6 Product Image Gallery

File:

- `src/app/components/ui/ProductImageGallery.tsx`

Features:

- Main product image.
- Thumbnail list.
- Previous/next navigation.
- Prefetches nearby images.
- Uses product image variants:
  - thumb
  - gallery
  - detail
  - blur

## 6. Checkout and Orders

### 6.1 Checkout Form

File:

- `src/app/produit/[id]/CheckoutForm.tsx`

The checkout is embedded on the product detail page, not a separate checkout route.

Fields:

- name
- phone
- delivery address

Validation:

- Phone is required.
- Phone must match a simple pattern: optional `+`, digits, and spaces.
- Product options must be valid before form is shown.

Pricing:

- Subtotal = product price * quantity.
- Delivery fee = 8 DT.
- Total = subtotal + delivery fee.

Order payload sent to `/api/orders`:

- customer name, phone, address
- item product ID
- localized product name
- price and original price
- selected size
- selected color
- quantity
- images
- total amount
- total discount

After success:

- Shows confirmation message.
- Displays order number.
- Allows "Commander un autre produit", which reloads the page.

### 6.2 Cart System

Files:

- `src/app/context/CartContext.tsx`
- `src/app/components/ui/CartSidebar.tsx`
- `src/app/panier/page.tsx`

Cart behavior:

- Cart is stored in browser `localStorage` under key `cart`.
- Header displays total item count.
- Cart sidebar can open from header.
- Items are merged if product ID, size, and color match.
- Quantities can be updated.
- Items can be removed.
- Size/color can be updated in cart.
- Cart totals:
  - total items
  - total price
  - total discount

Hydration behavior:

1. On browser mount, cart loads from `localStorage`.
2. Cart items are normalized for backwards compatibility.
3. For each unique product ID, it calls `/api/products/[id]` to refresh price, name, images, size, color, and availability data.
4. Updated cart is saved back to `localStorage`.

`/panier` currently redirects to `/tous-nos-produits`; the cart experience is the sidebar.

## 7. Language and Translations

Files:

- `src/app/context/LanguageContext.tsx`
- `src/app/hooks/useTranslations.ts`
- `src/app/i18n/frontend/fr.json`
- `src/app/i18n/frontend/ar.json`
- `src/app/i18n/backend/fr.json`
- `src/app/i18n/backend/ar.json`
- `src/app/components/multiLanguage/LanguageToggle.tsx`

Supported languages:

- French: `fr`
- Arabic: `ar`

Behavior:

- Default language is French.
- Selected language is saved to `localStorage` under key `lang`.
- HTML `lang` attribute is updated.
- HTML `dir` is set to `rtl` for Arabic and `ltr` for French.
- Frontend and backend translation JSON files are dynamically imported and merged.
- `useTranslations()` reads a key from the merged messages object.

## 8. Admin Interface

### 8.1 Admin Layout and Auth Gate

Routes:

- `/admin`
- `/admin/products`
- `/admin/product/addNew/form`
- `/admin/product/edit/[id]`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/statistics`
- `/admin/sponsors`

Files:

- `src/app/admin/layout.tsx`
- `src/app/admin/AdminShell.tsx`
- `src/app/components/admin/ProtectedRoute.tsx`
- `src/app/components/admin/PasswordProtection.tsx`
- `src/app/context/AdminAuthContext.tsx`

Current behavior:

- Admin UI is protected by a client-side password form.
- Password is hardcoded in the frontend code: `MHADMIN@123`.
- Successful login stores `adminAuthenticated=true` in `localStorage`.
- Logout removes this localStorage value.

Important security note:

- This protects only the admin UI in the browser.
- The backend admin API routes do not currently enforce server-side authentication.
- Anyone who can reach the API endpoints can call admin routes directly if they know the URLs.
- This should be fixed before production use.

### 8.2 Admin Dashboard

Route:

- `/admin`

File:

- `src/app/admin/page.tsx`

Features:

- Entry point for admin operations.
- Cards linking to:
  - product management
  - add product
  - statistics
  - sponsors
- Logout button.

### 8.3 Product Management

Route:

- `/admin/products`

File:

- `src/app/admin/products/page.tsx`

Features:

- Fetches `/api/admin/products`.
- Displays products in mobile card view and desktop table view.
- Shows first image, name, price, category, availability, and creation date.
- Edit action links to `/admin/product/edit/[id]`.
- Delete action calls `DELETE /api/admin/products/[id]`.

### 8.4 Add Product

Route:

- `/admin/product/addNew/form`

File:

- `src/app/admin/product/addNew/form/page.tsx`

Fields:

- French name
- Arabic name
- price
- original price
- sizes
- colors
- disabled colors
- discount
- category
- availability
- French description
- Arabic description
- images

Categories:

- `ensembles`
- `tShirtsPolos`
- `shortsPantalons`
- `chemises`
- `packsOffresSpeciales`
- `promos`
- `nouveautes`

Submission:

- Builds `FormData`.
- Adds JSON string as `productData`.
- Adds uploaded images as `images`.
- Sends `POST /api/admin/products`.

### 8.5 Edit Product

Route:

- `/admin/product/edit/[id]`

File:

- `src/app/admin/product/edit/[id]/page.tsx`

Features:

- Loads product using `GET /api/admin/products/[id]`.
- Allows editing product fields.
- Allows preserving, removing, reordering, and adding images.
- Sends `PUT /api/admin/products/[id]` as `FormData`.
- Existing image URLs are sent back when retained.
- New files are sent as file entries.

### 8.6 Order Management

Routes:

- `/admin/orders`
- `/admin/orders/[id]`

Files:

- `src/app/admin/orders/page.tsx`
- `src/app/admin/orders/[id]/page.tsx`

Order list features:

- Fetches `/api/orders`.
- Supports filtering/searching by API query parameters.
- Displays customer, phone, status, amount, date, and actions.
- Allows delete.

Order detail features:

- Fetches `/api/orders/[id]`.
- Displays order details.
- Allows status and notes edits.
- Sends `PUT /api/orders/[id]`.

Order statuses:

- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

### 8.7 Statistics

Route:

- `/admin/statistics`

File:

- `src/app/admin/statistics/page.tsx`

API:

- `GET /api/admin/statistics?period=all|today|week|month`

Displayed metrics:

- total orders
- total revenue
- total discount
- completed revenue
- average order value
- total items sold
- orders by status
- orders by date
- revenue by date
- total products
- available products
- out of stock products
- products by category
- top selling products

Backend calculation:

- Period filter is based on `createdAt`.
- Completed revenue includes statuses:
  - `delivered`
  - `shipped`
  - `processing`
- Top products are calculated by unwinding order items and grouping by product ID.

### 8.8 Sponsors Management

Route:

- `/admin/sponsors`

File:

- `src/app/admin/sponsors/page.tsx`

Features:

- Fetches all sponsors with `/api/admin/sponsors`.
- Adds a sponsor with:
  - name
  - logo
  - website URL
  - display order
  - active flag
- Toggles active/hidden state.
- Updates display order on blur.
- Deletes sponsor.

Logo restrictions:

- Allowed MIME types:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/svg+xml`
- Maximum size: 1 MB.

Sponsor display:

- Public homepage calls `/api/sponsors`.
- Only active sponsors are returned.
- Sponsors are sorted by display order, then newest.

## 9. Backend API Documentation

All API routes are implemented under `src/app/api`.

### 9.1 Database Test

`GET /api/test-db`

Purpose:

- Tests MongoDB connection.

Success:

```json
{
  "success": true,
  "message": "Database connected successfully!"
}
```

Failure:

- Returns `500` with error message.

### 9.2 Public Products

`GET /api/products`

Query parameters:

- `category`: optional category value.
- `limit`: default `12`.
- `page`: default `1`.
- `search`: optional search query.
- `sortBy`: default `createdAt`.
- `sortOrder`: default `desc`.

Behavior:

- Only returns products with `availability: true`.
- Searches:
  - `name.fr`
  - `name.ar`
  - `description.fr`
  - `description.ar`
- Sorts by requested field.
- Uses Mongo aggregation.
- Returns only the first image URL for list views.
- Adds cache header: `public, s-maxage=60, stale-while-revalidate=300`.

`POST /api/products`

Purpose:

- Creates a product from JSON.

Important note:

- This route is public in the current code and does not require authentication.
- The admin product creation route is more complete because it handles uploaded images.

### 9.3 Public Product by ID

`GET /api/products/[id]`

Behavior:

- Validates Mongo ObjectId.
- Fetches storefront product.
- Returns full normalized product data.
- Adds cache header.

### 9.4 Product Images

`GET /api/images/[productId]/[imageIndex]`

Query parameters:

- `v=blur`
- `v=thumb`
- `v=gallery`
- `v=detail`

Default variant:

- `thumb`

Behavior:

1. Validates product ID.
2. Validates image index.
3. Tries to read optimized image variant from `ProductImage` collection.
4. If no stored variant exists, falls back to legacy base64 image in `Product.images`.
5. Uses Sharp to resize/convert legacy image to WebP.
6. Returns image bytes with immutable long cache header.

Variant sizes:

- `blur`: width 40, quality 34
- `thumb`: width 320, quality 64
- `gallery`: width 720, quality 66
- `detail`: width 960, quality 70

### 9.5 Orders

`POST /api/orders`

Purpose:

- Creates a new customer order.

Required fields:

- `customer`
- `items`
- `totalAmount`

Customer requirements:

- `customer.name`
- `customer.phone`

Items:

- Must be a non-empty array.

Behavior:

1. Connects to MongoDB.
2. Validates required fields.
3. Generates order number: `MH-` + last 6 digits of current timestamp.
4. Saves order with status `pending`.
5. Attempts to create order in Mofavo.
6. Saves Mofavo sync result on order.
7. Returns order number, order ID, and Mofavo sync status.

`GET /api/orders`

Purpose:

- Fetches orders for admin.

Query parameters:

- `status`
- `limit`: default `20`
- `page`: default `1`
- `search`

Search checks:

- order number
- customer name
- customer phone

Important note:

- This route currently has no server-side admin authentication.

`GET /api/orders/[id]`

- Fetches single order by ID.

`PUT /api/orders/[id]`

- Updates order.
- Validates status if provided.
- Accepts any other body fields and spreads them into the update.

`DELETE /api/orders/[id]`

- Deletes order.

Important note:

- These order admin routes currently have no server-side admin authentication.

### 9.6 Admin Products

`GET /api/admin/products`

Query parameters:

- `category`
- `search`
- `limit`: default `50`, max `100`
- `page`: default `1`

Behavior:

- Returns products for admin, including unavailable products.
- Projects name, price, category, availability, createdAt, and imageCount.
- Normalizes image URLs.
- Returns pagination metadata.

`POST /api/admin/products`

Payload:

- `multipart/form-data`
- `productData`: JSON string
- `images`: one or more file uploads

Validation:

- product data and images required
- required fields:
  - name
  - price
  - size
  - color
  - category
- at least one color
- at least one size
- both `name.fr` and `name.ar`
- at least one image file

Behavior:

1. Creates a new Mongo ObjectId for product.
2. Converts uploaded files to buffers.
3. Generates optimized image variants.
4. Stores variants in `ProductImage`.
5. Creates Product document with `images: []` and `imageCount`.
6. If product save fails, deletes stored images.

`GET /api/admin/products/[id]`

- Returns full editable product data.

`PUT /api/admin/products/[id]`

Payload:

- `multipart/form-data`
- `productData`: JSON string
- `images`: existing image URLs and/or new file uploads

Behavior:

- Validates ID.
- Validates required image/product data.
- Keeps images unchanged if no image changes are submitted.
- Preserves existing stored variants when existing image URLs are retained.
- Converts legacy base64 images if needed.
- Generates variants for new files.
- Replaces stored product images when image list changes.
- Updates Product document.

`DELETE /api/admin/products/[id]`

- Deletes product images from `ProductImage`.
- Deletes Product document.

Important note:

- Admin product API routes currently have no server-side authentication.

### 9.7 Statistics

`GET /api/admin/statistics`

Query parameters:

- `period=all`
- `period=today`
- `period=week`
- `period=month`

Returns:

- overview metrics
- order metrics
- revenue metrics
- product metrics
- top products

Important note:

- This route currently has no server-side admin authentication.

### 9.8 Sponsors

Public route:

`GET /api/sponsors`

Behavior:

- Returns only active sponsors.
- Sorts by `displayOrder`, then `createdAt`.
- Selects:
  - name
  - logoDataUri
  - websiteUrl
  - displayOrder
- Adds cache header.

Admin routes:

`GET /api/admin/sponsors`

- Returns all sponsors.

`POST /api/admin/sponsors`

- Creates sponsor from multipart form data.
- Validates name and logo.
- Converts logo to data URI.
- Normalizes website URL by adding `https://` if missing.

`PATCH /api/admin/sponsors/[id]`

- Updates name, website URL, active flag, and display order.

`DELETE /api/admin/sponsors/[id]`

- Deletes sponsor.

Important note:

- Admin sponsor routes currently have no server-side authentication.

## 10. Database Models

### 10.1 Product

File:

- `src/models/Product.ts`

Fields:

- `name.fr`: required string
- `name.ar`: required string
- `slug`: lowercase string
- `price`: required number, min 0
- `originalPrice`: optional number, min 0
- `size`: string array, enum from `PRODUCT_SIZES`
- `color`: string array
- `disabledColors`: string array
- `discount`: number, default 0, min 0, max 100
- `category`: required enum
- `availability`: boolean, default true
- `images`: legacy string array
- `imageCount`: number, default 0
- `description.fr`: optional string
- `description.ar`: optional string
- timestamps

Indexes:

- text-ish/search index over names plus category, availability, price
- category + slug index

Hooks:

- Before validation, slug is generated from French name, Arabic name, or ID if missing or French name changed.

Virtuals:

- `discountPercentage`

### 10.2 ProductImage

File:

- `src/models/ProductImage.ts`

Purpose:

- Stores optimized product image binary variants outside the Product document.

Fields:

- `productId`: ObjectId reference to Product
- `position`: image order index
- `variants.blur.data`
- `variants.blur.contentType`
- `variants.thumb.data`
- `variants.thumb.contentType`
- `variants.gallery.data`
- `variants.gallery.contentType`
- `variants.detail.data`
- `variants.detail.contentType`
- timestamps

Index:

- unique `{ productId: 1, position: 1 }`

### 10.3 Order

File:

- `src/models/Order.ts`

Fields:

- `orderNumber`: unique required string
- `customer.name`
- `customer.phone`
- `customer.address`
- `items[]`
  - productId
  - localized productName
  - price
  - originalPrice
  - size
  - color
  - quantity
  - images
- `totalAmount`
- `totalDiscount`
- `status`
- `mofavo.syncStatus`
- `mofavo.externalOrderId`
- `mofavo.error`
- `mofavo.syncedAt`
- `notes`
- timestamps

Statuses:

- pending
- confirmed
- processing
- shipped
- delivered
- cancelled

Index:

- order number
- customer phone
- status
- createdAt desc

Virtual:

- `totalItems`

### 10.4 Sponsor

File:

- `src/models/Sponsor.ts`

Fields:

- `name`
- `logoDataUri`
- `websiteUrl`
- `active`
- `displayOrder`
- timestamps

Index:

- active + displayOrder + createdAt desc

## 11. Product Routing and SEO

File:

- `src/lib/productRoutes.ts`

Site URL:

- `NEXT_PUBLIC_SITE_URL` with trailing slash removed.
- Fallback: `https://www.mhfashion.tn`

Category route mapping:

- `ensembles` -> `/ensembles`
- `tShirtsPolos` -> `/t-shirts-polos`
- `shortsPantalons` -> `/shorts-pantalons`
- `chemises` -> `/chemises`
- `packsOffresSpeciales` -> `/packs-offres-speciales`
- `promos` -> `/promos`
- `nouveautes` -> `/nouveautes`

Product slug generation:

- Normalizes text.
- Removes accents.
- Lowercases.
- Removes apostrophes.
- Replaces non-alphanumeric sequences with `-`.
- Trims leading/trailing dashes.
- Falls back to `produit`.

Canonical product path:

```text
/<category-slug>/<product-slug>
```

Sitemap:

- File: `src/app/sitemap.ts`
- Includes homepage, contact, all-products, category pages, and available product pages.
- If product fetching fails, returns static and category routes only.

Robots:

- File: `src/app/robots.ts`
- Allows `/`.
- Disallows `/admin` and `/api`.
- Points to sitemap.

## 12. Image Storage and Delivery

Current product image architecture:

- Product documents store `imageCount`.
- Actual optimized image bytes are stored in `ProductImage`.
- Public product data exposes image URLs like:

```text
/api/images/<productId>/<index>
```

Client-side image URL builder adds a variant:

```text
/api/images/<productId>/<index>?v=thumb
```

Variant selection:

- If preferred variant is passed, use it.
- If width > 980, use `detail`.
- If width > 520, use `gallery`.
- Otherwise use `thumb`.

Fallback image:

- `/home-media/set.jpg`

Legacy support:

- If no `ProductImage` document exists, API can still read base64 data URI images from `Product.images`.
- It converts them to WebP on request.

Migration:

- Script: `scripts/migrate-product-images.mjs`
- Package script: `corepack pnpm migrate:product-images`

## 13. Mofavo External Order Integration

File:

- `src/lib/mofavo.ts`

Purpose:

- After a local order is created, the app can sync it to Mofavo.

Environment variables:

- `MOFAVO_API_URL`
- `MOFAVO_API_KEY`
- `MOFAVO_API_SECRET`
- `MOFAVO_AUTH_TOKEN`
- `MOFAVO_ORDER_STATUS`
- `MOFAVO_DEFAULT_CITY`
- `MOFAVO_DEFAULT_STATE`

If credentials are missing:

- Integration is disabled.
- Order is still created locally.
- Order gets `mofavo.syncStatus = "notConfigured"`.

If credentials exist:

- Builds Mofavo request body.
- Signs raw JSON body with HMAC SHA-256 using API secret.
- Sends request with:
  - `x-mofavo-api-key`
  - `x-mofavo-signature`
  - bearer token
- If successful, stores external order ID and sync timestamp.
- If failed, stores sync error.

## 14. Environment Variables

Documented in `.env.example`:

```env
MONGODB_URI=your_mongodb_uri_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
MOFAVO_API_URL=https://api.mofavo.com/external
MOFAVO_API_KEY=your_mofavo_api_key_here
MOFAVO_API_SECRET=your_mofavo_api_secret_here
MOFAVO_AUTH_TOKEN=your_mofavo_bearer_token_here
MOFAVO_ORDER_STATUS=draft
MOFAVO_DEFAULT_CITY=Tunis
MOFAVO_DEFAULT_STATE=Tunis
```

Additional variable used by code:

```env
NEXT_PUBLIC_SITE_URL=https://www.mhfashion.tn
```

Required:

- `MONGODB_URI`

Optional:

- Mofavo variables.
- `NEXT_PUBLIC_SITE_URL`.

Note:

- `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are listed but NextAuth is not currently wired into the admin auth flow.

## 15. Caching

Routes with cache headers:

- `GET /api/products`
- `GET /api/products/[id]`
- `GET /api/sponsors`

Product image route:

- `Cache-Control: public, max-age=31536000, immutable`

Dynamic routes:

- product ID route is dynamic.
- statistics route is dynamic.
- sitemap is dynamic.

## 16. Styling and Design System

Tailwind config:

- File: `tailwind.config.ts`

Custom colors:

- black
- white
- gold: `rgb(177, 134, 65)`
- red 500
- gray scale
- offwhite scale

Fonts:

- Cinzel
- Montserrat
- Noto Sans Arabic

Responsive breakpoints:

- xs through 4xl.

Plugins:

- `@tailwindcss/forms`
- `@tailwindcss/container-queries`
- `tailwindcss-rtl`
- custom `not-read-only` variant

## 17. Operational Commands

Install dependencies:

```bash
corepack pnpm install
```

Start dev server:

```bash
corepack pnpm dev
```

Lint:

```bash
corepack pnpm lint
```

Type check:

```bash
corepack pnpm exec tsc --noEmit
```

Build:

```bash
corepack pnpm build
```

Start production build:

```bash
corepack pnpm start
```

Migrate legacy product images:

```bash
corepack pnpm migrate:product-images
```

## 18. Current Test Status

There is no automated test framework configured.

Missing package scripts:

- `test`
- `test:unit`
- `test:integration`

Current available validation:

- ESLint: `corepack pnpm lint`
- TypeScript: `corepack pnpm exec tsc --noEmit`
- Production build: `corepack pnpm build`
- Manual API/browser smoke testing

Recommended future setup:

- Unit tests for utilities:
  - product slug generation
  - image URL generation
  - cart normalization
  - Mofavo body/signature behavior
- Integration tests for API routes:
  - products
  - orders
  - admin products
  - sponsors
- E2E tests for:
  - product browsing
  - checkout order creation
  - admin product creation
  - admin order status update

## 19. Known Issues and Gaps

### 19.1 Admin Security Gap

Admin auth is currently client-side only.

Risk:

- The password is visible in frontend code.
- LocalStorage can be modified manually.
- Admin API routes do not check server-side auth.
- Product/order/sponsor/statistics endpoints can be called directly.

Recommended fix:

- Add real server-side authentication.
- Protect API routes with session/cookie/JWT checks.
- Move admin secret out of client code.
- Add CSRF protection if cookie sessions are used.

### 19.2 Public Product POST Route

`POST /api/products` creates products from JSON and is public.

Risk:

- Anyone can create products if the route is reachable.

Recommended fix:

- Remove this route if unused.
- Or protect it with the same admin API auth.

### 19.3 Order Update Route Accepts Arbitrary Body Fields

`PUT /api/orders/[id]` validates status only if present, then spreads the full body into the update.

Risk:

- A caller can update unexpected fields.

Recommended fix:

- Whitelist allowed update fields, for example `status` and `notes`.

### 19.4 No Automated Tests

There are no unit or integration tests.

Risk:

- Refactors can break product routing, checkout, image handling, or admin APIs without detection.

Recommended fix:

- Add a test framework and package scripts.

### 19.5 Build/Network Sensitivity

The app uses `next/font/google`.

Risk:

- Production build can fail or hang when Google Fonts are unreachable.

Recommended fix:

- Consider self-hosting fonts if builds must work offline or behind restrictive networks.

### 19.6 MongoDB DNS/Network Dependency

All data-backed routes require MongoDB DNS and network access.

Observed locally:

- MongoDB Atlas DNS lookup timed out during testing.

Recommended fix:

- Verify Atlas hostname, DNS, firewall, VPN, and IP allowlist.
- Use a local MongoDB for development if Atlas is unreliable.

### 19.7 Lint Warnings

ESLint warnings exist for raw `<img>` usage:

- sponsor logos in public sponsors section
- sponsor logos in admin sponsors page
- Meta Pixel noscript image in root layout

These are performance warnings, not functional failures.

## 20. High-Level Request Flows

### 20.1 Browse Products

1. User opens homepage, category page, or all-products page.
2. React hook `useProducts` builds query params.
3. Browser calls `/api/products`.
4. API connects to MongoDB.
5. API filters available products.
6. API normalizes image URLs.
7. UI renders product cards.

### 20.2 Open Product Detail

1. User clicks product card.
2. Link points to canonical route `/<category>/<slug>`.
3. Server loads product by category and slug.
4. Server generates metadata.
5. Product detail UI renders image gallery, options, quantity, and checkout form.

### 20.3 Create Order

1. User selects required size/color.
2. User enters name, phone, and optional address.
3. Checkout form posts to `/api/orders`.
4. API saves order in MongoDB with `pending` status.
5. API attempts Mofavo sync.
6. API updates order with sync result.
7. UI shows confirmation and order number.

### 20.4 Add Product in Admin

1. Admin logs into UI with password.
2. Admin opens add product form.
3. Admin enters localized product data and uploads images.
4. Form posts multipart data to `/api/admin/products`.
5. API creates optimized image variants.
6. API stores image variants in `ProductImage`.
7. API creates Product document with `imageCount`.
8. Admin is redirected or shown success depending on page logic.

### 20.5 Edit Product Images

1. Admin opens edit product page.
2. Existing product image URLs are loaded from API.
3. Admin keeps/removes/adds images.
4. Form sends product data plus kept image URLs and new files.
5. API resolves kept image indexes.
6. API loads existing stored variants or legacy images.
7. API regenerates final image set and updates image count.

### 20.6 Manage Sponsors

1. Admin opens sponsors page.
2. Page fetches all sponsors.
3. Admin uploads logo and metadata.
4. API validates logo and stores it as data URI.
5. Public homepage fetches only active sponsors and displays them.

## 21. What Must Be Available for the Site to Work

Required for most functionality:

- Node 20.x
- pnpm 9.12.3 through Corepack
- valid `MONGODB_URI`
- reachable MongoDB DNS and network

Required for order sync:

- Mofavo credentials, if external sync is desired

Required for successful production builds in current setup:

- network access to Google Fonts, unless fonts are self-hosted

Required for product images:

- `sharp` working in the deployment environment
- MongoDB storage available for image variants

