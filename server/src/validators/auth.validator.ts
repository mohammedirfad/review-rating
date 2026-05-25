import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(1, "Password is required.")
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  avatarUrl: z.string().trim().url().or(z.literal("")).optional(),
  bio: z.string().trim().max(300).optional()
});
