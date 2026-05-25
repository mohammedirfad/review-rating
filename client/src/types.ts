export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
};

export type Company = {
  _id: string;
  name: string;
  location: string;
  city: string;
  foundedOn: string;
  logoText: string;
  logoUrl?: string;
  logoColor: string;
  description: string;
  averageRating: number;
  reviewCount: number;
};

export type Review = {
  _id: string;
  company: string;
  user: { _id: string; name: string; avatarUrl?: string } | string;
  fullName: string;
  subject: string;
  text: string;
  rating: number;
  likedBy: string[];
  shareCount: number;
  createdAt: string;
};

export type AuthMode = "login" | "signup";
