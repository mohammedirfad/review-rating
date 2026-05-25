import { Company } from "../models/company.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { companyQuerySchema, companySchema } from "../validators/company.validator.js";
import { isValidObjectId, type SortOrder } from "mongoose";

function sortFor(value: "name" | "rating" | "date"): Record<string, SortOrder> {
  if (value === "rating") return { averageRating: -1, reviewCount: -1 };
  if (value === "date") return { createdAt: -1 };
  return { name: 1 };
}

export const createCompany = asyncHandler(async (req, res) => {
  const body = companySchema.parse(req.body);
  const company = await Company.create({
    ...body,
    logoText: body.logoText || body.name.slice(0, 2).toUpperCase(),
    logoColor: body.logoColor ?? "#101638",
    createdBy: req.user!._id
  });

  res.status(201).json({ company });
});

export const listCompanies = asyncHandler(async (req, res) => {
  const query = companyQuerySchema.parse(req.query);
  const filter: Record<string, unknown> = {};

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { location: { $regex: query.search, $options: "i" } },
      { city: { $regex: query.search, $options: "i" } }
    ];
  }

  if (query.city) filter.city = { $regex: query.city, $options: "i" };

  const skip = (query.page - 1) * query.limit;
  const [companies, total] = await Promise.all([
    Company.find(filter).sort(sortFor(query.sort)).skip(skip).limit(query.limit).lean(),
    Company.countDocuments(filter)
  ]);

  res.json({
    count: companies.length,
    total,
    page: query.page,
    hasMore: skip + companies.length < total,
    companies
  });
});

export const getCompany = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid company id.");
  const company = await Company.findById(req.params.id).lean();
  if (!company) throw new ApiError(404, "Company not found.");
  res.json({ company });
});
