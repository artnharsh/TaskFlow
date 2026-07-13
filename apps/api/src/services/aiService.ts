import aiProvider from "./ai";
import ApiError from "../utils/ApiError";
import { AISuggestedTask, Priority, AISummaryResponse, Column, Task } from "@taskflow/types";

const extractJson = <T = any>(text: string): T => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;

  const start = candidate.search(/[\[{]/);
  if (start === -1) throw new ApiError(502, "AI returned an unexpected response format");

  const end = Math.max(candidate.lastIndexOf("]"), candidate.lastIndexOf("}"));

  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    throw new ApiError(502, "Failed to parse AI response payload");
  }
};

const VALID_PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

const normalizeTask = (t: any): AISuggestedTask => ({
  title: String(t.title || "")
    .trim()
    .slice(0, 200),
  description: String(t.description || "")
    .trim()
    .slice(0, 1000),
  priority: VALID_PRIORITIES.includes(t.priority) ? (t.priority as Priority) : "medium",
});

export const generateTasks = async (goal: string, count = 6): Promise<AISuggestedTask[]> => {
  const prompt = `You are a senior project manager. Break the following project goal into ${count} concrete, actionable Kanban tasks.

Goal: "${goal}"

Respond ONLY with a JSON array. Each item: { "title": string, "description": string (1-2 sentences), "priority": "low"|"medium"|"high"|"urgent" }.
No markdown, no commentary.`;

  const json = extractJson<any[]>(await aiProvider.runPrompt(prompt));

  if (!Array.isArray(json)) throw new ApiError(502, "AI did not return a valid task list array");

  return json.map(normalizeTask).filter((t) => t.title);
};

export const breakdownTask = async (
  title: string,
  description = "",
  count = 5,
): Promise<AISuggestedTask[]> => {
  const prompt = `Break the following task into ${count} smaller, sequential subtasks.

Task title: "${title}"
Task details: "${description || "(n/a)"}"

Respond ONLY with a JSON array. Each item: { "title": string, "description": string (short), "priority": "low"|"medium"|"high"|"urgent" }.
No markdown, no commentary.`;

  const json = extractJson<any[]>(await aiProvider.runPrompt(prompt));

  if (!Array.isArray(json)) throw new ApiError(502, "AI did not return subtasks");

  return json.map(normalizeTask).filter((t) => t.title);
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
  const snapshot = columns
    .map(
      (c) =>
        `${c.title} (${c.tasks.length}):\n` +
        (c.tasks.map((t) => `  - ${t.title} [${t.priority}]`).join("\n") || "  (none)"),
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

  return extractJson<AISummaryResponse>(await aiProvider.runPrompt(prompt));
};
