import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().default("mongodb://127.0.0.1:27017/review-rate"),
  JWT_SECRET: z.string().min(16).default("local-development-secret-key"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().default("http://localhost:5173")
});

export const env = schema.parse(process.env);
