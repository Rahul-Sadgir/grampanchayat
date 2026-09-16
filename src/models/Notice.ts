import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotice extends Document {
  villageId: mongoose.Types.ObjectId;
  villageSlug?: string;
  title: string;
  content: string;
  category: string;
  documentUrl?: string;
  fileName?: string;
  isImportant: boolean;
  publishedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    villageId: { type: Schema.Types.ObjectId, ref: "Village", required: true },
    villageSlug: { type: String },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, default: "जाहिर सूचना" },
    documentUrl: { type: String },
    fileName: { type: String },
    isImportant: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

NoticeSchema.index({ villageId: 1, publishedAt: -1 });
NoticeSchema.index({ villageSlug: 1, isActive: 1 });

export const Notice: Model<INotice> =
  mongoose.models.Notice || mongoose.model<INotice>("Notice", NoticeSchema);