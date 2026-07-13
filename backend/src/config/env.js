const dotenv = require("dotenv");
dotenv.config();

const requiredEnvs = ["DATABASE_URL", "JWT_SECRET"];
const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);

if (missingEnvs.length > 0) {
  console.error(`[Fatal] Missing required environment variables: ${missingEnvs.join(", ")}`);
  process.exit(1);
}

module.exports = {
  PORT: process.env.PORT || 8000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  NODE_ENV: process.env.NODE_ENV || "development",
};
