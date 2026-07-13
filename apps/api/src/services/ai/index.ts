import { AiProvider } from "./AiProvider";
import { GeminiProvider } from "./GeminiProvider";
import { OllamaProvider } from "./OllamaProvider";
import { config } from "../../config/env";

const getAiProvider = (): AiProvider => {
  const provider = config.AI_PROVIDER.toLowerCase();

  switch (provider) {
    case "ollama":
      return new OllamaProvider();
    case "gemini":
    default:
      return new GeminiProvider();
  }
};

export default getAiProvider();
