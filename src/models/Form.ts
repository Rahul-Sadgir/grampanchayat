import mongoose, { Schema, Model } from "mongoose";

export interface IForm {
  serviceId: mongoose.Types.ObjectId;
  villageId: mongoose.Types.ObjectId;
  version: number;
  schema: Record<string, any>;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const FormSchema = new Schema<IForm>(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    villageId: { type: Schema.Types.ObjectId, ref: "Village", required: true },
    version: { type: Number, default: 1 },
    schema: { type: Schema.Types.Mixed, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Form: Model<IForm> =
  mongoose.models.Form || mongoose.model<IForm>("Form", FormSchema);