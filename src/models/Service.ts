import mongoose, { Schema, Document, Model } from "mongoose";

export interface IService extends Document {
  villageId: mongoose.Types.ObjectId;
  villageSlug?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tabCategory: "aarz" | "certificates" | "self-declaration" | "tax" | "rti" | "grievance";
  icon: string;
  fileUrl?: string;
  fileName?: string;
  isPdfOnly: boolean;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    villageId: { type: Schema.Types.ObjectId, ref: "Village", required: true },
    villageSlug: { type: String },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    tabCategory: {
      type: String,
      enum: ["aarz", "certificates", "self-declaration", "tax", "rti", "grievance"],
      default: "aarz",
    },
    icon: { type: String, default: "FileText" },
    fileUrl: { type: String },
    fileName: { type: String },
    isPdfOnly: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ServiceSchema.index({ villageId: 1, slug: 1 });
ServiceSchema.index({ villageSlug: 1, tabCategory: 1, isActive: 1 });

export const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);