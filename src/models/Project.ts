import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  villageId: mongoose.Types.ObjectId;
  villageSlug?: string;
  title: string;
  description: string;
  category: string;
  status: "PLANNED" | "ONGOING" | "COMPLETED";
  budget?: number;
  year?: string;
  agency?: string;
  location?: string;
  startDate?: Date;
  completionDate?: Date;
  images: string[];
}

const ProjectSchema = new Schema<IProject>(
  {
    villageId: { type: Schema.Types.ObjectId, ref: "Village", required: true },
    villageSlug: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ["PLANNED", "ONGOING", "COMPLETED"],
      default: "PLANNED",
    },
    budget: { type: Number },
    year: { type: String },
    agency: { type: String },
    location: { type: String },
    startDate: { type: Date },
    completionDate: { type: Date },
    images: [{ type: String }],
  },
  { timestamps: true }
);

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);