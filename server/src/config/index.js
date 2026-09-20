export const config = {
  port: process.env.PORT || 5000,

  mongodbUri: process.env.MONGODB_URI,

  jwtSecret: process.env.JWT_SECRET,

  openaiApiKey: process.env.OPENAI_API_KEY,

  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
};