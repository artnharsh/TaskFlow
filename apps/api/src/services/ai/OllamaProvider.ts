import { AiProvider } from "./AiProvider";
import { config } from "../../config/env";
import ApiError from "../../utils/ApiError";

export class OllamaProvider extends AiProvider {
  private host: string;
  private model: string;

  constructor() {
    super();
    this.host = config.OLLAMA_HOST;
    this.model = config.OLLAMA_MODEL;
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
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = (await res.json()) as { response: string };
      return data.response || "";
    } catch (error: any) {
      console.error("[Ollama Provider Error]", error);
      throw new ApiError(
        502,
        `Failed to reach local Ollama instance running at ${this.host}. Make sure Ollama is active.`,
      );
    }
  }
}
