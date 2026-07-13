import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

export const config = {
  PORT: parseInt(process.env.PORT || "8000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/taskflow",
  JWT_SECRET: process.env.JWT_SECRET || "supersecretjwtkey123",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  AI_PROVIDER: process.env.AI_PROVIDER || "gemini",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  OLLAMA_HOST: process.env.OLLAMA_HOST || "http://localhost:11434",
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || "qwen2.5",
};
