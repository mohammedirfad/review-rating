import type { Company, Review } from "./types";

export const fallbackCompanies: Company[] = [
  {
    _id: "demo-1",
    name: "Graffersid Web and App Development",
    location: "816, Shekhar Central, Manorama Ganj, AB road, New Palasia, Indore (M.P.)",
    city: "Indore, Madhya Pradesh, India",
    foundedOn: "2016-01-01T00:00:00.000Z",
    logoText: "G",
    logoColor: "#101638",
    description: "Web and app development company.",
    averageRating: 4.5,
    reviewCount: 41
  },
  {
    _id: "demo-2",
    name: "Code Tech Company",
    location: "414, Kanha Apartment, Bhawarkua, Indore (M.P.)",
    city: "Indore, Madhya Pradesh, India",
    foundedOn: "2016-01-01T00:00:00.000Z",
    logoText: "CT",
    logoColor: "#198a00",
    description: "Technology services company.",
    averageRating: 4.5,
    reviewCount: 0
  },
  {
    _id: "demo-3",
    name: "Innogent Pvt. Ltd.",
    location: "910, Shekhar Central, Manorama Ganj, AB road, New Palasia, Indore (M.P.)",
    city: "Indore, Madhya Pradesh, India",
    foundedOn: "2016-01-01T00:00:00.000Z",
    logoText: "i",
    logoColor: "#ff8508",
    description: "Digital product studio.",
    averageRating: 4.5,
    reviewCount: 0
  }
];

export const fallbackReviews: Review[] = [
  {
    _id: "review-1",
    company: "demo-1",
    user: { _id: "u1", name: "Jorque Watson", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" },
    fullName: "Jorque Watson",
    subject: "Excellent delivery",
    text: "Graffersid one of the best Company dolor sit amet, consectetur adipiscing elit. Congue netus feugiat elit suspendisse commodo. Pellentesque risus suspendisse mattis et massa. Ultrices ac at nibh et.",
    rating: 4,
    likedBy: [],
    shareCount: 0,
    createdAt: "2022-01-01T14:33:00.000Z"
  },
  {
    _id: "review-2",
    company: "demo-1",
    user: { _id: "u2", name: "Jenny kole", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80" },
    fullName: "Jenny kole",
    subject: "Reliable team",
    text: "Graffersid one of the best Company dolor sit amet, consectetur adipiscing elit. Congue netus feugiat elit suspendisse commodo. Pellentesque risus suspendisse mattis et massa.",
    rating: 4,
    likedBy: [],
    shareCount: 0,
    createdAt: "2022-01-12T15:00:00.000Z"
  }
];
