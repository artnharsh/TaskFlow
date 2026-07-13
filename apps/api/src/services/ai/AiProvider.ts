export abstract class AiProvider {
  /**
   * Run a text prompt against the underlying AI service.
   * @param prompt Plain text prompt
   * @returns Raw text response from the model
   */
  abstract runPrompt(prompt: string): Promise<string>;
}
