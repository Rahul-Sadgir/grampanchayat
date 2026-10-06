import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "VILLAGE_ADMIN" | "SUPER_ADMIN" | "CONTENT_EDITOR";
  villageId: mongoose.Types.ObjectId;
  villageSlug: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["VILLAGE_ADMIN", "SUPER_ADMIN", "CONTENT_EDITOR"],
      default: "VILLAGE_ADMIN",
    },
    villageId: { type: Schema.Types.ObjectId, ref: "Village", required: true },
    villageSlug: { type: String, required: true, default: "komalwadi" },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);