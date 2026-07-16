const { GoogleGenAI } = require("@google/genai");
const ApiError = require("../utils/ApiError");

// Explicitly use the definitive model designation string
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

let client = null;

const getClient = () => {
  const key = process.env.GEMINI_API_KEY;

  // CHANGED: Fixed misleading error code (401 Unauthorized makes more sense than 503 Service Unavailable)
  if (!key || key === "your-gemini-api-key") {
    throw new ApiError(401, "Gemini API key is not configured on the server");
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey: key });
  }

  return client;
};

const extractJson = (text) => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;

  const start = candidate.search(/[\[{]/);

  if (start === -1)
    throw new ApiError(502, "AI returned an unexpected response");

  const end = Math.max(
    candidate.lastIndexOf("]"),
    candidate.lastIndexOf("}")
  );

  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    throw new ApiError(502, "Failed to parse AI response");
  }
};

const runPrompt = async (prompt) => {
  try {
    // CORRECT CALL STRUCTURE: Explicit initialization parameter objects
    const response = await getClient().models.generateContent({
      model: MODEL,
      contents: [prompt] 
    });

    // Handle standard response extraction safely
    if (response && response.text) {
        return response.text;
    }
    
    throw new ApiError(502, "Empty response received from AI service");

  } catch (err) {
    if (err.isApiError) throw err;

    // Capture standard API HTTP status codes safely 
    const status = err.status || err.statusCode || (err.statusText ? 400 : null);

    if (status === 429) {
      throw new ApiError(
        429,
        "AI quota exceeded. Please wait a minute before making another request."
      );
    }

    if (status === 404) {
      throw new ApiError(
        404,
        `Model variant '${MODEL}' not found. Verify model settings.`
      );
    }

    if (status === 400 || status === 401 || status === 403) {
      throw new ApiError(
        401,
        "AI request rejected - verify your GEMINI_API_KEY is valid."
      );
    }

    console.error("Gemini request failed details:", err);

    throw new ApiError(
      503,
      "The AI service is temporarily unavailable. Please try again."
    );
  }
};

const VALID_PRIORITIES = ["low", "medium", "high", "urgent"];

const normalizeTask = (t) => ({
  title: String(t.title || "").trim().slice(0, 200),
  description: String(t.description || "").trim().slice(0, 1000),
  priority: VALID_PRIORITIES.includes(t.priority) ? t.priority : "medium",
});

const generateTasks = async (goal, count = 6) => {
  const prompt = `You are a senior project manager. Break the following project goal into ${count} concrete, actionable Kanban tasks.

Goal: "${goal}"

Respond ONLY with a JSON array. Each item: { "title": string, "description": string (1-2 sentences), "priority": "low"|"medium"|"high"|"urgent" }.
No markdown, no commentary.`;

  const json = extractJson(await runPrompt(prompt));

  if (!Array.isArray(json))
    throw new ApiError(502, "AI did not return a task list");

  return json.map(normalizeTask).filter((t) => t.title);
};

const breakdownTask = async (title, description = "", count = 5) => {
  const prompt = `Break the following task into ${count} smaller, sequential subtasks.

Task title: "${title}"
Task details: "${description || "(n/a)"}"

Respond ONLY with a JSON array. Each item: { "title": string, "description": string (short), "priority": "low"|"medium"|"high"|"urgent" }.
No markdown, no commentary.`;

  const json = extractJson(await runPrompt(prompt));

  if (!Array.isArray(json))
    throw new ApiError(502, "AI did not return subtasks");

  return json.map(normalizeTask).filter((t) => t.title);
};

const summarizeBoard = async ({ boardTitle, columns }) => {
  const snapshot = columns
    .map(
      (c) =>
        `${c.title} (${c.tasks.length}):\n` +
        (c.tasks
          .map((t) => `  - ${t.title} [${t.priority}]`)
          .join("\n") || "  (none)")
    )
    .join("\n");

  const prompt = `You are a scrum master. Write a concise sprint summary for the Kanban board "${boardTitle}".
Current board state:
${snapshot}

Respond ONLY with JSON: {
  "headline": string (one sentence overview),
  "completed": string[] (key done items),
  "inProgress": string[] (what's actively being worked),
  "risks": string[] (blockers/risks/overdue concerns),
  "recommendations": string[] (next priorities)
}
No markdown, no commentary.`;

  return extractJson(await runPrompt(prompt));
};

module.exports = {
  generateTasks,
  breakdownTask,
  summarizeBoard,
};