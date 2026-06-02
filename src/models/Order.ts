import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  items: Array<{
    productId: string;
    productName: {
      fr: string;
      ar: string;
    };
    price: number;
    originalPrice?: number;
    size: string;
    color: string;
    quantity: number;
    images: string[];
  }>;
  totalAmount: number;
  totalDiscount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  mofavo?: {
    syncStatus: 'notConfigured' | 'synced' | 'failed';
    externalOrderId?: number;
    error?: string;
    syncedAt?: Date;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  items: [{
    productId: {
      type: String,
      required: true
    },
    productName: {
      fr: { type: String, required: true },
      ar: { type: String, required: true }
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
    size: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    images: [{
      type: String,
      required: true
    }]
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  mofavo: {
    syncStatus: {
      type: String,
      enum: ['notConfigured', 'synced', 'failed'],
      default: 'notConfigured'
    },
    externalOrderId: {
      type: Number
    },
    error: {
      type: String,
      trim: true
    },
    syncedAt: {
      type: Date
    }
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better search performance
OrderSchema.index({ 
  orderNumber: 1,
  'customer.phone': 1,
  status: 1,
  createdAt: -1
});

// Virtual for total items count
OrderSchema.virtual('totalItems').get(function(this: any) {
  return this.items.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
});

// Ensure virtual fields are serialized
OrderSchema.set('toJSON', { virtuals: true });
OrderSchema.set('toObject', { virtuals: true });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
