export const config = {
  port: process.env.PORT || 5000,

  mongodbUri: process.env.MONGODB_URI,

  jwtSecret: process.env.JWT_SECRET,

  geminiApiKey: process.env.GEMINI_API_KEY,

  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",

  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
};