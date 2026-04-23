import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AdminUserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    passwordSalt: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
      required: true,
    },
    totpSecret: {
      type: String,
      required: true,
    },
    passwordChangeVerifiedAt: Date,
    passwordChangedAt: Date,
    lastLoginAt: Date,
    schemaVersion: {
      type: Number,
      default: 1,
    },
  },
  {
    collection: "admin_users",
    timestamps: true,
  },
);

export type AdminUserDocument = InferSchemaType<typeof AdminUserSchema>;

export const AdminUserModel =
  (mongoose.models.AdminUser as Model<AdminUserDocument> | undefined) ??
  mongoose.model<AdminUserDocument>("AdminUser", AdminUserSchema);
