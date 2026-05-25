import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";
import { loginSchema, profileSchema, signupSchema } from "../validators/auth.validator.js";

function toAuthResponse(user: { _id: unknown; name: string; email: string; avatarUrl?: string; bio?: string }) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? "",
    bio: user.bio ?? ""
  };
}

export const signup = asyncHandler(async (req, res) => {
  const body = signupSchema.parse(req.body);
  const existing = await User.findOne({ email: body.email });
  if (existing) throw new ApiError(409, "Email is already registered.");

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await User.create({ name: body.name, email: body.email, passwordHash });
  const token = signToken({ userId: String(user._id) });

  res.status(201).json({ token, user: toAuthResponse(user) });
});

export const login = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const user = await User.findOne({ email: body.email });
  if (!user) throw new ApiError(401, "Invalid email or password.");

  const isMatch = await bcrypt.compare(body.password, user.passwordHash);
  if (!isMatch) throw new ApiError(401, "Invalid email or password.");

  const token = signToken({ userId: String(user._id) });
  res.json({ token, user: toAuthResponse(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: toAuthResponse(req.user!) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const body = profileSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(req.user!._id, body, { new: true }).select("-passwordHash");
  res.json({ user: toAuthResponse(user!) });
});
