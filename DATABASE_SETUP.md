# MongoDB Database Setup for MH Fashion

## 🚀 Quick Start

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Free tier is sufficient for development)

### 2. Get Your Connection String
1. In your cluster, click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password

### 3. Set Up Environment Variables
1. Copy `env.example` to `.env.local`
2. Update the `MONGODB_URI` with your connection string:

```bash
# .env.local
mongodb+srv://nailirihab8_db_user:Z7GdQCOYjPeQJXCo@cluster0.hosllhp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### 4. Test Database Connection
Visit `/api/test-db` to test your connection.

## 📊 Database Schema

### Product Model
```typescript
{
  name: {
    fr: string,        // French name
    ar: string         // Arabic name
  },
  price: number,       // Current price
  originalPrice?: number, // Original price (for discounts)
  size: string[],      // Available sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  color: string[],     // Available colors
  discount: number,    // Discount percentage (0-100)
  category: string,    // Product category
  availability: boolean, // In stock
  images: string[],    // Product image URLs
  description?: {      // Optional description
    fr: string,
    ar: string
  },
  rating?: number,     // Average rating (0-5)
  reviews?: number,    // Number of reviews
  createdAt: Date,     // Creation timestamp
  updatedAt: Date      // Last update timestamp
}
```

### Categories
- `ensembles` - Complete outfits
- `tShirtsPolos` - T-shirts and polos
- `shortsPantalons` - Shorts and pants
- `chemises` - Shirts
- `packsOffresSpeciales` - Special offer packs
- `promos` - Promotions
- `nouveautes` - New arrivals

## 🔌 API Endpoints

### Test Connection
```
GET /api/test-db
```

### Products
```
GET /api/products - Get all products
GET /api/products?category=ensembles - Filter by category
GET /api/products?search=shirt - Search products
GET /api/products?page=1&limit=20 - Pagination

POST /api/products - Create new product
```

## 📝 Sample Product Data

```json
{
  "name": {
    "fr": "T-shirt Premium en Coton",
    "ar": "تيشرت قطن مميز"
  },
  "price": 29.99,
  "originalPrice": 39.99,
  "size": ["S", "M", "L", "XL"],
  "color": ["Blanc", "Noir", "Bleu"],
  "discount": 25,
  "category": "tShirtsPolos",
  "availability": true,
  "images": [
    "/products/tshirt-white-1.jpg",
    "/products/tshirt-white-2.jpg"
  ],
  "description": {
    "fr": "T-shirt en coton 100% bio, confortable et durable",
    "ar": "تيشرت من القطن العضوي 100٪، مريح ودائم"
  }
}
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Test database connection
curl http://localhost:3000/api/test-db

# Get all products
curl http://localhost:3000/api/products

# Create a product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d @sample-product.json
```

## 🔒 Security Notes

1. **Never commit `.env.local`** to version control
2. **Use environment variables** for sensitive data
3. **Set up IP whitelist** in MongoDB Atlas
4. **Use strong passwords** for database users
5. **Enable authentication** for production

## 📱 Next Steps

1. ✅ Database connection setup
2. 🔄 Product CRUD operations
3. 🔍 Search and filtering
4. 🖼️ Image upload integration
5. 👤 User authentication
6. 🛒 Shopping cart functionality
7. 💳 Payment integration
8. 📊 Admin dashboard

## 🆘 Troubleshooting

### Common Issues

1. **Connection refused**: Check your IP whitelist in MongoDB Atlas
2. **Authentication failed**: Verify username/password in connection string
3. **Network timeout**: Check your internet connection and firewall settings
4. **Schema validation error**: Ensure all required fields are provided

### Get Help

- Check MongoDB Atlas logs
- Review connection string format
- Verify environment variables
- Test with MongoDB Compass
