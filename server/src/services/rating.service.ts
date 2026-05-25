import { Types } from "mongoose";
import { Company } from "../models/company.model.js";
import { Review } from "../models/review.model.js";

export async function refreshCompanyRating(companyId: string | Types.ObjectId) {
  const [summary] = await Review.aggregate([
    { $match: { company: new Types.ObjectId(companyId.toString()) } },
    {
      $group: {
        _id: "$company",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  await Company.findByIdAndUpdate(companyId, {
    averageRating: summary ? Number(summary.averageRating.toFixed(1)) : 0,
    reviewCount: summary?.reviewCount ?? 0
  });
}
