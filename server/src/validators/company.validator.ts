import { z } from "zod";

export const companySchema = z.object({
  name: z.string().trim().min(2, "Company name is required."),
  location: z.string().trim().min(3, "Location is required."),
  city: z.string().trim().min(2, "City is required."),
  foundedOn: z.coerce.date(),
  logoText: z.string().trim().min(1).max(4).optional(),
  logoUrl: z
    .string()
    .trim()
    .refine((value) => !value || /^data:image\/(png|jpe?g|webp);base64,/i.test(value), {
      message: "Upload a valid PNG, JPG, JPEG, or WEBP logo."
    })
    .optional(),
  logoColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  description: z.string().trim().max(500).optional()
});

export const companyQuerySchema = z.object({
  search: z.string().trim().optional(),
  city: z.string().trim().optional(),
  sort: z.enum(["name", "rating", "date"]).default("name"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});
