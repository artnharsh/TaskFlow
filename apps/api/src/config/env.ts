import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env"), override: true });
dotenv.config({ path: path.join(process.cwd(), ".env"), override: true });

/**
 * Strict Environment Validator.
 * Throws a startup error if any required environment variable is missing or empty.
 */
const getRequired = (key: string): string => {
  const value = process.env[key];
  if (!value || !value.trim()) {
    throw new Error(`[Config Error] Missing required environment variable: ${key}`);
  }
  return value.trim();
};

const port = parseInt(getRequired("PORT"), 10);
const databaseUrl = getRequired("DATABASE_URL");
const jwtSecret = getRequired("JWT_SECRET");
const frontendUrl = getRequired("FRONTEND_URL");

const aiProvider = getRequired("AI_PROVIDER").toLowerCase();
const aiModel = getRequired("AI_MODEL");

const PROVIDERS_REQUIRING_API_KEY = ["gemini", "openai", "anthropic", "claude"];
const PROVIDERS_REQUIRING_HOST = ["ollama", "local"];

let aiApiKey = (process.env.AI_API_KEY || "").trim();
let aiHost = (process.env.AI_HOST || "").trim();

if (PROVIDERS_REQUIRING_API_KEY.includes(aiProvider)) {
  aiApiKey = getRequired("AI_API_KEY");
}

if (PROVIDERS_REQUIRING_HOST.includes(aiProvider)) {
  aiHost = getRequired("AI_HOST");
}

export const config = {
  PORT: port,
  DATABASE_URL: databaseUrl,
  JWT_SECRET: jwtSecret,
  FRONTEND_URL: frontendUrl,

  // Provider Agnostic AI Configuration
  AI_PROVIDER: aiProvider,
  AI_API_KEY: aiApiKey,
  AI_MODEL: aiModel,
  AI_HOST: aiHost,
};
