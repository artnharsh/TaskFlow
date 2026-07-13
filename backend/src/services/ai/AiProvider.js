class AiProvider {
  /**
   * Run a prompt through the AI model and return the text response.
   * @param {string} prompt - The prompt to send to the AI
   * @returns {Promise<string>} The AI's response text
   */
  async runPrompt(prompt) {
    throw new Error("runPrompt() must be implemented by subclass");
  }
}

module.exports = AiProvider;
