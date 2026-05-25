import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 300 }
  },
  { timestamps: true }
);

export type IUser = InferSchemaType<typeof userSchema>;
export const User = mongoose.model("User", userSchema);
