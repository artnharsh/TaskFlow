const { GoogleGenAI } = require("@google/genai");
const AiProvider = require("./AiProvider");
const ApiError = require("../../utils/ApiError");

class GeminiProvider extends AiProvider {
  constructor() {
    super();
    this.model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    this.client = null;
  }

  getClient() {
    const key = process.env.GEMINI_API_KEY;

    if (!key || key === "your-gemini-api-key") {
      throw new ApiError(503, "Gemini API key is not configured on the server");
    }

    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: key });
    }

    return this.client;
  }

  async runPrompt(prompt) {
    try {
      const response = await this.getClient().models.generateContent({
        model: this.model,
        contents: prompt,
      });

      return response.text;
    } catch (err) {
      if (err.isApiError) throw err;

      const status = err.status || err.statusCode;

      if (status === 429) {
        throw new ApiError(
          429,
          err.message || "AI quota exceeded. Check your Gemini plan/billing and try again later.",
        );
      }

      if (status === 400 || status === 401 || status === 403) {
        throw new ApiError(503, "AI request rejected - verify your GEMINI_API_KEY is valid.");
      }

      console.error("Gemini request failed:", err.message);

      throw new ApiError(
        502,
        "The Gemini AI service is temporarily unavailable. Please try again.",
      );
    }
  }
}

module.exports = GeminiProvider;
