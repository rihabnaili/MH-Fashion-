# MH Fashion E-commerce Platform

MH Fashion is a modern, bilingual (French/Arabic) e-commerce platform built with Next.js 14, MongoDB, and Tailwind CSS. The platform offers a comprehensive shopping experience with both customer-facing and admin interfaces.

## 🚀 Features

### Customer Features
- **Bilingual Support**: Full French and Arabic language support
- **Product Browsing**: Browse products by categories with grid/list view options
- **Shopping Cart**: Real-time cart management with persistent storage
- **Search Functionality**: Advanced product search with filters
- **Responsive Design**: Optimized for all device sizes
- **Image Gallery**: Product image galleries with zoom functionality
- **Category Navigation**: Intuitive category-based navigation

### Admin Features
- **Secure Admin Panel**: Password-protected admin interface
- **Product Management**: Add, edit, and delete products
- **Order Management**: Track and manage customer orders
- **Image Upload**: Multiple image upload with drag-and-drop support
- **Inventory Control**: Track product stock levels
- **Analytics Dashboard**: Monitor sales and performance

## 🛠️ Technology Stack

- **Frontend**:
  - Next.js 14.1.0
  - React 18
  - Tailwind CSS
  - HeadlessUI/React
  - Lucide React Icons

- **Backend**:
  - Next.js API Routes
  - MongoDB with Mongoose
  - Authentication system

- **Key Libraries**:
  - `@headlessui/react`: UI components
  - `react-hook-form`: Form handling
  - `i18next`: Internationalization
  - Sharp: Image optimization
  - MongoDB: Database
  - Mongoose: ODM

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/           # Public routes
│   ├── admin/             # Admin panel routes
│   │   ├── orders/        # Order management
│   │   ├── products/      # Product management
│   │   └── product/       # Product CRUD operations
│   ├── api/              # API routes
│   │   ├── admin/        # Admin API endpoints
│   │   ├── orders/       # Order endpoints
│   │   └── products/     # Product endpoints
│   ├── components/       # Reusable components
│   │   ├── admin/       # Admin components
│   │   ├── layouts/     # Layout components
│   │   ├── sections/    # Page sections
│   │   └── ui/          # UI components
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   └── i18n/           # Translation files
├── lib/                # Utility functions
├── models/            # Mongoose models
└── public/           # Static assets
```

## 🔧 Key Components

### Frontend Components
1. **Layouts**:
   - `MainLayout.js`: Main site layout with header, footer, and sidebar
   - `AdminNavigation.tsx`: Admin panel navigation structure

2. **UI Components**:
   - `ProductCard.js`: Reusable product display component
   - `ImageUploadManager.tsx`: Drag-and-drop image upload
   - `CartModal.tsx`: Shopping cart interface
   - `SearchModal.tsx`: Search interface

3. **Sections**:
   - `HeroSection.js`: Homepage hero section
   - `FeaturedProducts.js`: Featured products display
   - `CategoriesSection.js`: Category navigation
   - `ServicesSection.js`: Service features display

### Backend Components
1. **API Routes**:
   - Product management (`/api/products`)
   - Order management (`/api/orders`)
   - Admin operations (`/api/admin/*`)

2. **Models**:
   - `Product.ts`: Product schema and model
   - `Order.ts`: Order schema and model

## 🔐 Authentication & Security

- Protected admin routes with password authentication
- Secure API endpoints
- MongoDB connection with proper error handling
- Input validation and sanitization

## 🌐 Internationalization

- Dual language support (French/Arabic)
- Separate translation files for frontend and backend
- Language toggle functionality
- RTL support for Arabic

## 💾 Database Schema

### Product Schema
```typescript
{
  name: {
    fr: String,  // French name
    ar: String   // Arabic name
  },
  price: Number,
  size: String,
  color: String,
  category: String,
  images: [String],
  // Additional fields...
}
```

### Order Schema
```typescript
{
  products: [{
    productId: ObjectId,
    quantity: Number,
    price: Number
  }],
  status: String,
  // Additional fields...
}
```

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone [repository-url]
cd mh-fashion
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
npm start
```

## 🔧 Configuration

- **MongoDB**: Configure connection in `src/lib/mongodb.ts`
- **Image Upload**: Configure in admin components
- **Languages**: Manage translations in `src/app/i18n/`
- **API Routes**: Configure in `src/app/api/`

## 🚀 Deployment

The application is configured for deployment with:
- Standalone output
- Optimized image handling
- Environment variable management
- Static asset optimization

## 🛠️ Development Commands

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint
