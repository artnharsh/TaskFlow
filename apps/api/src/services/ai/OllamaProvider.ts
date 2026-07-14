import { AiProvider } from "./AiProvider";
import { config } from "../../config/env";
import ApiError from "../../utils/ApiError";

export class OllamaProvider extends AiProvider {
  private host: string;
  private model: string;

  constructor() {
    super();
    this.host = config.AI_HOST || "http://localhost:11434";
    this.model = config.AI_MODEL || "qwen2.5";
  }

  async runPrompt(prompt: string): Promise<string> {
    try {
      const res = await fetch(`${this.host}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
        }),
      });

      if (!res.ok) {
        let errorMsg = `HTTP error! status: ${res.status}`;
        try {
          const errData = (await res.json()) as { error?: string };
          if (errData.error) errorMsg = errData.error;
        } catch {
          /* ignore json parse error */
        }
        throw new ApiError(500, `Ollama Error: ${errorMsg}`);
      }

      const data = (await res.json()) as { response: string };
      return data.response || "";
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      console.error("[Ollama Provider Error]", error);
      throw new ApiError(
        502,
        `Failed to reach local Ollama instance running at ${this.host}. Make sure Ollama is active.`,
      );
    }
  }
}
