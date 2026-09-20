import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { config } from "../config/index.js";
import User from "../models/user.model.js";

const credentialsSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8),
});

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

function issueToken(userId) {
  if (!config.jwtSecret) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign({ userId: userId.toString() }, config.jwtSecret, { expiresIn: "7d" });
}

function publicUser(user) {
  return { id: user._id.toString(), email: user.email, createdAt: user.createdAt };
}

function validationError(response, error) {
  return response.status(400).json({ success: false, message: "Invalid request", errors: error.flatten().fieldErrors });
}

export async function register(request, response) {
  const parsed = credentialsSchema.safeParse(request.body);
  if (!parsed.success) return validationError(response, parsed.error);

  try {
    const existingUser = await User.findOne({ email: parsed.data.email });
    if (existingUser) return response.status(409).json({ success: false, message: "Email is already registered" });

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await User.create({ email: parsed.data.email, passwordHash });
    const token = issueToken(user._id);

    return response.status(201).cookie("token", token, cookieOptions).json({ success: true, user: publicUser(user) });
  } catch (error) {
    if (error?.code === 11000) return response.status(409).json({ success: false, message: "Email is already registered" });
    return response.status(500).json({ success: false, message: "Unable to register user" });
  }
}

export async function login(request, response) {
  const parsed = credentialsSchema.safeParse(request.body);
  if (!parsed.success) return validationError(response, parsed.error);

  const user = await User.findOne({ email: parsed.data.email });
  const passwordMatches = user && await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!passwordMatches) return response.status(401).json({ success: false, message: "Invalid email or password" });

  const token = issueToken(user._id);
  return response.status(200).cookie("token", token, cookieOptions).json({ success: true, user: publicUser(user) });
}

export function logout(_request, response) {
  return response.clearCookie("token", cookieOptions).status(200).json({ success: true, message: "Logged out" });
}

export async function me(request, response) {
  const user = await User.findById(request.user.id);
  if (!user) return response.status(404).json({ success: false, message: "User not found" });
  return response.status(200).json({ success: true, user: publicUser(user) });
}