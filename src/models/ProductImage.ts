import mongoose, { Document, Schema } from 'mongoose';

interface IImageVariant {
  data: Buffer;
  contentType: string;
}

export interface IProductImage extends Document {
  productId: mongoose.Types.ObjectId;
  position: number;
  variants: {
    thumb: IImageVariant;
    detail: IImageVariant;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ImageVariantSchema = new Schema<IImageVariant>(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true, trim: true },
  },
  {
    _id: false,
  }
);

const ProductImageSchema = new Schema<IProductImage>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    position: {
      type: Number,
      required: true,
      min: 0,
    },
    variants: {
      thumb: { type: ImageVariantSchema, required: true },
      detail: { type: ImageVariantSchema, required: true },
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

ProductImageSchema.index({ productId: 1, position: 1 }, { unique: true });

export default mongoose.models.ProductImage ||
  mongoose.model<IProductImage>('ProductImage', ProductImageSchema);
