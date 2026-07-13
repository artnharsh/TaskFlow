const AiProvider = require("./AiProvider");
const ApiError = require("../../utils/ApiError");

class OllamaProvider extends AiProvider {
  constructor() {
    super();
    this.model = process.env.OLLAMA_MODEL || "qwen2.5";
    this.baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  }

  async runPrompt(prompt) {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama responded with status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (err) {
      console.error("Ollama request failed:", err.message);
      throw new ApiError(
        502,
        "The Ollama service is temporarily unavailable. Please make sure Ollama is running and the model is pulled.",
      );
    }
  }
}

module.exports = OllamaProvider;
