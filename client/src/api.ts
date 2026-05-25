import axios from "axios";
import type { Company, Review, User } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("review-rate-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    if (data?.errors) {
      const fieldMessages = Object.entries(data.errors)
        .flatMap(([field, messages]) => messages.map((message) => `${field}: ${message}`))
        .join(" ");
      if (fieldMessages) return `${data.message ?? "Validation failed."} ${fieldMessages}`;
    }
    if (data?.message) return data.message;
    if (error.code === "ERR_NETWORK") return "Could not reach the API. Please check your internet connection or try again in a moment.";
  }
  return "Something went wrong. Please try again.";
}

export const authApi = {
  signup: (payload: { name: string; email: string; password: string }) =>
    api.post<{ token: string; user: User }>("/auth/signup", payload),
  login: (payload: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>("/auth/login", payload),
  me: () => api.get<{ user: User }>("/auth/me"),
  updateProfile: (payload: Partial<Pick<User, "name" | "avatarUrl" | "bio">>) =>
    api.patch<{ user: User }>("/auth/profile", payload)
};

export const companyApi = {
  list: (params: { search?: string; city?: string; sort?: string; page?: number; limit?: number }) =>
    api.get<{ count: number; total: number; page: number; hasMore: boolean; companies: Company[] }>("/companies", { params }),
  detail: (id: string) => api.get<{ company: Company }>(`/companies/${id}`),
  create: (payload: {
    name: string;
    location: string;
    city: string;
    foundedOn: string;
    logoText?: string;
    logoUrl?: string;
    logoColor?: string;
    description?: string;
  }) => api.post<{ company: Company }>("/companies", payload)
};

export const reviewApi = {
  list: (companyId: string, params: { sort: string; page?: number; limit?: number }) =>
    api.get<{ count: number; total: number; page: number; hasMore: boolean; reviews: Review[] }>(`/companies/${companyId}/reviews`, { params }),
  create: (companyId: string, payload: { fullName: string; subject: string; text: string; rating: number }) =>
    api.post<{ review: Review }>(`/companies/${companyId}/reviews`, payload),
  update: (companyId: string, reviewId: string, payload: Partial<{ fullName: string; subject: string; text: string; rating: number }>) =>
    api.patch<{ review: Review }>(`/companies/${companyId}/reviews/${reviewId}`, payload),
  remove: (companyId: string, reviewId: string) =>
    api.delete<{ message: string }>(`/companies/${companyId}/reviews/${reviewId}`),
  like: (companyId: string, reviewId: string) =>
    api.post<{ liked: boolean; likes: number }>(`/companies/${companyId}/reviews/${reviewId}/like`),
  share: (companyId: string, reviewId: string) =>
    api.post<{ shareCount: number }>(`/companies/${companyId}/reviews/${reviewId}/share`)
};
