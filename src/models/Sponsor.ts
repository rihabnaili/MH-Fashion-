import mongoose, { Schema, Document } from 'mongoose';

export interface ISponsor extends Document {
  name: string;
  logoDataUri: string;
  websiteUrl?: string;
  active: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const SponsorSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logoDataUri: {
      type: String,
      required: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

SponsorSchema.index({ active: 1, displayOrder: 1, createdAt: -1 });

export default mongoose.models.Sponsor || mongoose.model<ISponsor>('Sponsor', SponsorSchema);
