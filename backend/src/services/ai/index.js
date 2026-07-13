const GeminiProvider = require("./GeminiProvider");
const OllamaProvider = require("./OllamaProvider");

const getAiProvider = () => {
  const providerType = process.env.AI_PROVIDER || "gemini";

  if (providerType === "ollama") {
    return new OllamaProvider();
  }

  return new GeminiProvider();
};

module.exports = getAiProvider();
