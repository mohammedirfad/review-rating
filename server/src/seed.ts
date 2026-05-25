import bcrypt from "bcryptjs";
import { connectDb } from "./config/db.js";
import { Company } from "./models/company.model.js";
import { Review } from "./models/review.model.js";
import { User } from "./models/user.model.js";
import { refreshCompanyRating } from "./services/rating.service.js";

await connectDb();
await Promise.all([Company.deleteMany({}), Review.deleteMany({}), User.deleteMany({})]);

const passwordHash = await bcrypt.hash("password123", 12);
const [user, secondUser] = await User.create([
  {
    name: "Jorque Watson",
    email: "demo@reviewrate.com",
    passwordHash,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
  },
  {
    name: "Jenny kole",
    email: "jenny@reviewrate.com",
    passwordHash,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80"
  }
]);

const companies = await Company.create([
  {
    name: "Graffersid Web and App Development",
    location: "816, Shekhar Central, Manorama Ganj, AB road, New Palasia, Indore (M.P.)",
    city: "Indore, Madhya Pradesh, India",
    foundedOn: new Date("2016-01-01"),
    logoText: "G",
    logoColor: "#101638",
    description: "Web and mobile app development company.",
    createdBy: user._id
  },
  {
    name: "Code Tech Company",
    location: "414, Kanha Apartment, Bhawarkua, Indore (M.P.)",
    city: "Indore, Madhya Pradesh, India",
    foundedOn: new Date("2016-01-01"),
    logoText: "CT",
    logoColor: "#198a00",
    description: "Technology services and consulting company.",
    createdBy: user._id
  },
  {
    name: "Innogent Pvt. Ltd.",
    location: "910, Shekhar Central, Manorama Ganj, AB road, New Palasia, Indore (M.P.)",
    city: "Indore, Madhya Pradesh, India",
    foundedOn: new Date("2016-01-01"),
    logoText: "i",
    logoColor: "#ff8508",
    description: "Digital product and innovation studio.",
    createdBy: user._id
  }
]);

await Review.create([
  {
    company: companies[0]._id,
    user: user._id,
    fullName: "Jorque Watson",
    subject: "Excellent delivery",
    text: "Graffersid one of the best Company dolor sit amet, consectetur adipiscing elit. Congue netus feugiat elit suspendisse commodo. Pellentesque risus suspendisse mattis et massa.",
    rating: 4
  },
  {
    company: companies[0]._id,
    user: secondUser._id,
    fullName: "Jenny kole",
    subject: "Reliable team",
    text: "Graffersid one of the best Company dolor sit amet, consectetur adipiscing elit. Congue netus feugiat elit suspendisse commodo. Pellentesque risus suspendisse mattis et massa.",
    rating: 4
  }
]);

for (const company of companies) {
  await refreshCompanyRating(company._id);
}

console.log("Seed complete. Demo login: demo@reviewrate.com / password123");
process.exit(0);
