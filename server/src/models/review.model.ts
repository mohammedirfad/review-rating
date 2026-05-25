import mongoose, { Schema, type InferSchemaType } from "mongoose";

const reviewSchema = new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    shareCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

reviewSchema.index({ company: 1, user: 1 }, { unique: true });

export type IReview = InferSchemaType<typeof reviewSchema>;
export const Review = mongoose.model("Review", reviewSchema);
