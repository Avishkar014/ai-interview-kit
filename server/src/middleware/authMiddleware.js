import jwt from "jsonwebtoken";

import { config } from "../config/index.js";

export default function authMiddleware(request, response, next) {
  const token = request.cookies?.token;
  if (!token) return response.status(401).json({ success: false, message: "Authentication required" });
  if (!config.jwtSecret) return response.status(500).json({ success: false, message: "JWT_SECRET is missing in .env" });

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    request.user = { id: payload.userId };
    return next();
  } catch (_error) {
    return response.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}