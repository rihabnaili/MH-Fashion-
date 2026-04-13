import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: {
    fr: string;
    ar: string;
  };
  price: number;
  originalPrice?: number;
  size: string[];
  color: string[];
  discount: number;
  category: string;
  availability: boolean;
  images: string[];
  imageCount: number;
  description?: {
    fr: string;
    ar: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: {
    fr: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true }
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  originalPrice: { 
    type: Number, 
    min: 0 
  },
  size: [{ 
    type: String, 
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  }],
  color: [{ 
    type: String, 
    required: true,
    trim: true
  }],
  discount: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },
  category: { 
    type: String, 
    required: true,
    enum: ['ensembles', 'tShirtsPolos', 'shortsPantalons', 'chemises', 'packsOffresSpeciales', 'promos', 'nouveautes']
  },
  availability: { 
    type: Boolean, 
    default: true 
  },
  images: [{ 
    type: String, 
    required: false 
  }],
  imageCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  description: {
    fr: { type: String, trim: true },
    ar: { type: String, trim: true }
  }
}, {
  timestamps: true
});

// Index for better search performance
ProductSchema.index({ 
  'name.fr': 'text', 
  'name.ar': 'text',
  category: 1,
  availability: 1,
  price: 1
});

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function(this: any) {
  if (this.originalPrice && this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return this.discount;
});

// Ensure virtual fields are serialized
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
