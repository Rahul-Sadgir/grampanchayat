import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVillageGalleryImage {
  url: string;
  caption?: string;
  category?: string;
}

export interface IVillage extends Document {
  name: string;
  slug: string;
  district: string;
  taluka: string;
  state: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  galleryImages?: IVillageGalleryImage[];
  address?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  primaryColor: string;
  secondaryColor: string;
  createdAt: Date;
  updatedAt: Date;
}

const VillageSchema = new Schema<IVillage>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    district: { type: String, required: true },
    taluka: { type: String, required: true },
    state: { type: String, default: "महाराष्ट्र" },
    description: { type: String },
    logo: { type: String },
    coverImage: { type: String },
    galleryImages: [
      {
        url: { type: String, required: true },
        caption: { type: String },
        category: { type: String, default: "सर्वसाधारण" },
      },
    ],
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    primaryColor: { type: String, default: "#14532d" },
    secondaryColor: { type: String, default: "#ea580c" },
  },
  { timestamps: true }
);

export const Village: Model<IVillage> =
  mongoose.models.Village || mongoose.model<IVillage>("Village", VillageSchema);