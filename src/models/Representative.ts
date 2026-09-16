import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRepresentative extends Document {
  villageId: mongoose.Types.ObjectId;
  villageSlug: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  ward?: string;
  photoUrl?: string;
  isSarpanch: boolean;
  isUpasarpanch: boolean;
  order: number;
  isActive: boolean;
  term?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RepresentativeSchema = new Schema<IRepresentative>(
  {
    villageId: { type: Schema.Types.ObjectId, ref: "Village", required: true },
    villageSlug: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    ward: { type: String, trim: true },
    photoUrl: { type: String },
    isSarpanch: { type: Boolean, default: false },
    isUpasarpanch: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    term: { type: String, default: "२०२२ - २०२७" },
  },
  { timestamps: true }
);

RepresentativeSchema.index({ villageId: 1, order: 1 });
RepresentativeSchema.index({ villageSlug: 1, isActive: 1 });

export const Representative: Model<IRepresentative> =
  mongoose.models.Representative ||
  mongoose.model<IRepresentative>("Representative", RepresentativeSchema);
