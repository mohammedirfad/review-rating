import { z } from "zod";

export const reviewSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  subject: z.string().trim().min(2, "Subject is required."),
  text: z.string().trim().min(10, "Review must be at least 10 characters."),
  rating: z.coerce.number().int().min(1).max(5)
});

export const reviewQuerySchema = z.object({
  sort: z.enum(["date", "rating", "relevance"]).default("date"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});
