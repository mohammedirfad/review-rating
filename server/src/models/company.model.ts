import mongoose, { Schema, type InferSchemaType } from "mongoose";

const companySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    location: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    foundedOn: { type: Date, required: true },
    logoText: { type: String, required: true, trim: true, maxlength: 4 },
    logoUrl: { type: String, default: "" },
    logoColor: { type: String, required: true, default: "#101638" },
    description: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

companySchema.index({ name: "text", city: "text", location: "text" });

export type ICompany = InferSchemaType<typeof companySchema>;
export const Company = mongoose.model("Company", companySchema);
