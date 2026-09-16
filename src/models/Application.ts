import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDocumentMeta {
  documentName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface IApplication extends Document {
  applicationNumber: string;
  villageId: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  formId?: mongoose.Types.ObjectId;
  serviceName?: string;
  serviceSlug?: string;
  villageSlug?: string;
  applicantName: string;
  mobileNumber: string;
  email?: string;
  address: string;
  formData: Record<string, any>;
  documents: IDocumentMeta[];
  status:
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "DOCUMENTS_REQUIRED"
    | "DOCUMENTS_SUBMITTED"
    | "APPROVED"
    | "REJECTED"
    | "COMPLETED";
  adminNotes?: string;
  // WhatsApp Response metadata
  responseDocumentUrl?: string;
  responseDocumentName?: string;
  responseText?: string;
  responseSentAt?: Date;
  responseType?: "DOCUMENT" | "MESSAGE" | "BOTH";
  submittedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    applicationNumber: { type: String, required: true, unique: true },
    villageId: { type: Schema.Types.ObjectId, ref: "Village", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: false },
    formId: { type: Schema.Types.ObjectId, ref: "Form", required: false },
    serviceName: { type: String },
    serviceSlug: { type: String },
    villageSlug: { type: String },
    applicantName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    formData: { type: Schema.Types.Mixed, required: true },
    documents: [
      {
        documentName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String, required: true },
        fileSize: { type: Number, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: [
        "SUBMITTED",
        "UNDER_REVIEW",
        "DOCUMENTS_REQUIRED",
        "DOCUMENTS_SUBMITTED",
        "APPROVED",
        "REJECTED",
        "COMPLETED",
      ],
      default: "SUBMITTED",
    },
    adminNotes: { type: String },
    // WhatsApp Response Fields
    responseDocumentUrl: { type: String },
    responseDocumentName: { type: String },
    responseText: { type: String },
    responseSentAt: { type: Date },
    responseType: {
      type: String,
      enum: ["DOCUMENT", "MESSAGE", "BOTH"],
      default: "MESSAGE",
    },
    submittedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

ApplicationSchema.index({ villageId: 1, status: 1 });
ApplicationSchema.index({ applicationNumber: 1, mobileNumber: 1 });

export const Application: Model<IApplication> =
  mongoose.models.Application ||
  mongoose.model<IApplication>("Application", ApplicationSchema);