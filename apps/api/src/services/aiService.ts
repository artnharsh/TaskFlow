import aiProvider from "./ai";
import ApiError from "../utils/ApiError";
import { AISuggestedTask, Priority, AISummaryResponse } from "@taskflow/types";

/**
 * Robust JSON Extractor for AI LLM Payloads.
 * Handles markdown code-blocks, extra surrounding text, trailing commas, and malformed quotes.
 */
const extractJson = <T = any>(rawText: string): T => {
  if (!rawText || typeof rawText !== "string") {
    throw new ApiError(502, "AI provider returned an empty or invalid response string.");
  }

  // 1. Strip Markdown Fences
  const fenced = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  let candidate = fenced ? fenced[1].trim() : rawText.trim();

  // 2. Locate starting '[' or '{' and ending ']' or '}'
  const start = candidate.search(/[\[{]/);
  const end = Math.max(candidate.lastIndexOf("]"), candidate.lastIndexOf("}"));

  if (start === -1 || end === -1 || end < start) {
    console.error("❌ [AI Parser Error] Couldn't find valid JSON boundaries in raw response:");
    console.error(rawText);
    throw new ApiError(502, "AI model output did not contain a valid JSON structure.");
  }

  candidate = candidate.slice(start, end + 1);

  // 3. Clean common LLM formatting glitches (e.g. trailing commas before closing braces/brackets)
  const cleaned = candidate.replace(/,\s*([\]}])/g, "$1");

  try {
    return JSON.parse(cleaned) as T;
  } catch (parseErr: any) {
    console.error("❌ [AI JSON Parse Failure] Raw text snippet:");
    console.error(cleaned);
    console.error("Parse Error Details:", parseErr.message);
    throw new ApiError(502, `Failed to parse AI output payload: ${parseErr.message}`);
  }
};

const VALID_PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

const normalizeTask = (t: any): AISuggestedTask => ({
  title: String(t?.title || "")
    .trim()
    .slice(0, 200),
  description: String(t?.description || "")
    .trim()
    .slice(0, 1000),
  priority: VALID_PRIORITIES.includes(t?.priority) ? (t.priority as Priority) : "medium",
});

export const generateTasks = async (goal: string, count = 6): Promise<AISuggestedTask[]> => {
  if (!goal || !goal.trim()) {
    throw ApiError.badRequest("Please provide a project goal for AI task generation.");
  }

  const prompt = `You are a senior project manager. Break the following project goal into ${count} concrete, actionable Kanban tasks.

Goal: "${goal.trim()}"

Respond ONLY with a JSON array. Each item: { "title": string, "description": string (1-2 sentences), "priority": "low"|"medium"|"high"|"urgent" }.
No markdown, no commentary.`;

  try {
    const rawResult = await aiProvider.runPrompt(prompt);
    const json = extractJson<any[]>(rawResult);

    if (!Array.isArray(json)) {
      throw new ApiError(502, "AI model response was not a JSON array of tasks.");
    }

    return json.map(normalizeTask).filter((t) => t.title);
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    console.error("❌ [AI Service Task Generation Error]:", err);
    throw new ApiError(502, "Failed to generate AI tasks. Please try again.");
  }
};

export const breakdownTask = async (
  title: string,
  description = "",
  count = 5,
): Promise<AISuggestedTask[]> => {
  if (!title || !title.trim()) {
    throw ApiError.badRequest("Task title is required for breakdown.");
  }

  const prompt = `Break the following task into ${count} smaller, sequential subtasks.

Task title: "${title.trim()}"
Task details: "${description ? description.trim() : "(n/a)"}"

Respond ONLY with a JSON array. Each item: { "title": string, "description": string (short), "priority": "low"|"medium"|"high"|"urgent" }.
No markdown, no commentary.`;

  try {
    const rawResult = await aiProvider.runPrompt(prompt);
    const json = extractJson<any[]>(rawResult);

    if (!Array.isArray(json)) {
      throw new ApiError(502, "AI model response was not a valid JSON array of subtasks.");
    }

    return json.map(normalizeTask).filter((t) => t.title);
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    console.error("❌ [AI Subtask Breakdown Error]:", err);
    throw new ApiError(502, "Failed to breakdown task. Please try again.");
  }
};

interface BoardSummaryInput {
  boardTitle: string;
  columns: Array<{
    title: string;
    tasks: Array<{ title: string; priority: Priority }>;
  }>;
}

export const summarizeBoard = async ({
  boardTitle,
  columns,
}: BoardSummaryInput): Promise<AISummaryResponse> => {
  if (!boardTitle) {
    throw ApiError.badRequest("Board title is required for AI summary generation.");
  }

  const snapshot = (columns || [])
    .map(
      (c) =>
        `${c.title} (${c.tasks?.length || 0}):\n` +
        ((c.tasks || []).map((t) => `  - ${t.title} [${t.priority}]`).join("\n") || "  (none)"),
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

  try {
    const rawResult = await aiProvider.runPrompt(prompt);
    return extractJson<AISummaryResponse>(rawResult);
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    console.error("❌ [AI Board Summarize Error]:", err);
    throw new ApiError(502, "Failed to generate AI board summary. Please try again.");
  }
};
