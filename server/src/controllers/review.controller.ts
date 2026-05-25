import { Company } from "../models/company.model.js";
import { Review } from "../models/review.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { refreshCompanyRating } from "../services/rating.service.js";
import { reviewQuerySchema, reviewSchema } from "../validators/review.validator.js";
import { isValidObjectId, type SortOrder } from "mongoose";

function reviewSort(value: "date" | "rating" | "relevance"): Record<string, SortOrder> {
  if (value === "rating") return { rating: -1, createdAt: -1 };
  if (value === "relevance") return { shareCount: -1, rating: -1, createdAt: -1 };
  return { createdAt: -1 };
}

export const listReviews = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.companyId)) throw new ApiError(400, "Invalid company id.");
  const query = reviewQuerySchema.parse(req.query);
  const skip = (query.page - 1) * query.limit;
  const [reviews, total] = await Promise.all([
    Review.find({ company: req.params.companyId })
      .populate("user", "name avatarUrl")
      .sort(reviewSort(query.sort))
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Review.countDocuments({ company: req.params.companyId })
  ]);

  res.json({ count: reviews.length, total, page: query.page, hasMore: skip + reviews.length < total, reviews });
});

export const createReview = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.companyId)) throw new ApiError(400, "Invalid company id.");
  const company = await Company.findById(req.params.companyId);
  if (!company) throw new ApiError(404, "Company not found.");

  const body = reviewSchema.parse(req.body);
  const existing = await Review.findOne({ company: company._id, user: req.user!._id }).lean();
  if (existing) throw new ApiError(409, "You have already reviewed this company.");

  const review = await Review.create({
    ...body,
    company: company._id,
    user: req.user!._id
  });

  await refreshCompanyRating(company._id);
  res.status(201).json({ review });
});

export const updateReview = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.reviewId)) throw new ApiError(400, "Invalid review id.");
  const body = reviewSchema.partial().parse(req.body);
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, "Review not found.");
  if (String(review.user) !== String(req.user!._id)) throw new ApiError(403, "You can edit only your own review.");

  Object.assign(review, body);
  await review.save();
  await refreshCompanyRating(review.company);

  res.json({ review });
});

export const deleteReview = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.reviewId)) throw new ApiError(400, "Invalid review id.");
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, "Review not found.");
  if (String(review.user) !== String(req.user!._id)) throw new ApiError(403, "You can delete only your own review.");

  const companyId = review.company;
  await review.deleteOne();
  await refreshCompanyRating(companyId);

  res.json({ message: "Review deleted." });
});

export const toggleLike = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.reviewId)) throw new ApiError(400, "Invalid review id.");
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, "Review not found.");

  const userId = String(req.user!._id);
  const liked = review.likedBy.some((id) => String(id) === userId);
  review.likedBy = liked
    ? review.likedBy.filter((id) => String(id) !== userId)
    : [...review.likedBy, req.user!._id];
  await review.save();

  res.json({ liked: !liked, likes: review.likedBy.length });
});

export const shareReview = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.reviewId)) throw new ApiError(400, "Invalid review id.");
  const review = await Review.findByIdAndUpdate(
    req.params.reviewId,
    { $inc: { shareCount: 1 } },
    { new: true }
  );
  if (!review) throw new ApiError(404, "Review not found.");
  res.json({ shareCount: review.shareCount });
});
