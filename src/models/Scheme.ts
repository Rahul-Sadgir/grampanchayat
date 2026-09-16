import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISchemeFaq {
  question: string;
  answer: string;
}

export interface IScheme extends Document {
  villageId?: mongoose.Types.ObjectId;
  villageSlug?: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  benefits?: string[];
  subsidyDetails?: string;
  targetAudience?: string;
  eligibility: string;
  documentsRequired: string;
  applicationProcess: string;
  content?: string;
  faq?: ISchemeFaq[];
  externalLink?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const SchemeFaqSchema = new Schema<ISchemeFaq>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const SchemeSchema = new Schema<IScheme>(
  {
    villageId: { type: Schema.Types.ObjectId, ref: "Village" },
    villageSlug: { type: String, default: "ALL" },
    slug: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, default: "/images/schemes/pmay-gharkul.jpg" },
    benefits: [{ type: String }],
    subsidyDetails: { type: String },
    targetAudience: { type: String },
    eligibility: { type: String, default: "सर्व पात्र नागरिक" },
    documentsRequired: { type: String, default: "आधार कार्ड, बँक पासबुक" },
    applicationProcess: {
      type: String,
      default: "ग्रामपंचायतीमध्ये संपर्क साधावा किंवा संबंधित शासकीय पोर्टलवर ऑनलाइन अर्ज करावा.",
    },
    content: { type: String },
    faq: [SchemeFaqSchema],
    externalLink: { type: String },
    attachmentUrl: { type: String },
    attachmentName: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Scheme: Model<IScheme> =
  mongoose.models.Scheme || mongoose.model<IScheme>("Scheme", SchemeSchema);