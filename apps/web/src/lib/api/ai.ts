import { client } from "./client";
import {
  Task,
  AIGenerateTasksRequest,
  AIBreakdownRequest,
  AISuggestedTask,
  AISummaryResponse,
} from "@taskflow/types";

export const aiApi = {
  generateTasks: async (
    boardId: string,
    payload: AIGenerateTasksRequest,
  ): Promise<{ tasks: Task[] | AISuggestedTask[]; persisted: boolean }> => {
    const res = await client.post(`/boards/${boardId}/ai/generate-tasks`, payload);
    return res.data;
  },

  breakdown: async (
    boardId: string,
    payload: AIBreakdownRequest,
  ): Promise<{ parentTitle: string; subtasks: AISuggestedTask[] }> => {
    const res = await client.post(`/boards/${boardId}/ai/breakdown`, payload);
    return res.data;
  },

  summary: async (boardId: string): Promise<{ summary: AISummaryResponse }> => {
    const res = await client.post(`/boards/${boardId}/ai/summary`);
    return res.data;
  },
};
