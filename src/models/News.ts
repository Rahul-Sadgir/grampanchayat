import mongoose, { Schema, Document, Model } from "mongoose";

export interface INews extends Document {
  villageId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  publishedAt: Date;
  isActive: boolean;
}

const NewsSchema = new Schema<INews>(
  {
    villageId: { type: Schema.Types.ObjectId, ref: "Village", required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String },
    publishedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

NewsSchema.index({ villageId: 1, slug: 1 }, { unique: true });

export const News: Model<INews> =
  mongoose.models.News || mongoose.model<INews>("News", NewsSchema);