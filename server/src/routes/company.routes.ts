import { Router } from "express";
import { createCompany, getCompany, listCompanies } from "../controllers/company.controller.js";
import { createReview, deleteReview, listReviews, shareReview, toggleLike, updateReview } from "../controllers/review.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const companyRouter = Router();

companyRouter.get("/", listCompanies);
companyRouter.post("/", requireAuth, createCompany);
companyRouter.get("/:id", getCompany);
companyRouter.get("/:companyId/reviews", listReviews);
companyRouter.post("/:companyId/reviews", requireAuth, createReview);
companyRouter.patch("/:companyId/reviews/:reviewId", requireAuth, updateReview);
companyRouter.delete("/:companyId/reviews/:reviewId", requireAuth, deleteReview);
companyRouter.post("/:companyId/reviews/:reviewId/like", requireAuth, toggleLike);
companyRouter.post("/:companyId/reviews/:reviewId/share", shareReview);
