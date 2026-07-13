import { GoogleGenAI } from "@google/genai";
import { AiProvider } from "./AiProvider";
import { config } from "../../config/env";
import ApiError from "../../utils/ApiError";

export class GeminiProvider extends AiProvider {
  private ai: GoogleGenAI | null = null;

  constructor() {
    super();
    if (config.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
    }
  }

  async runPrompt(prompt: string): Promise<string> {
    if (!this.ai) {
      throw ApiError.internalServer("GEMINI_API_KEY is not configured on the server.");
    }

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text || "";
    } catch (error: any) {
      console.error("[Gemini Provider Error]", error);
      throw new ApiError(
        502,
        "The Gemini AI service is temporarily unavailable. Please try again.",
      );
    }
  }
}
