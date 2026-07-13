import { client } from "./client";
import { Task, CreateTaskDTO, UpdateTaskDTO, MoveTaskDTO } from "@taskflow/types";

export const tasksApi = {
  list: async (boardId: string, params?: Record<string, any>): Promise<Task[]> => {
    const res = await client.get<{ tasks: Task[] }>(`/boards/${boardId}/tasks`, { params });
    return res.data.tasks;
  },

  create: async (boardId: string, data: CreateTaskDTO): Promise<Task> => {
    const res = await client.post<{ task: Task }>(`/boards/${boardId}/tasks`, data);
    return res.data.task;
  },

  update: async (boardId: string, taskId: string, data: UpdateTaskDTO): Promise<Task> => {
    const res = await client.patch<{ task: Task }>(`/boards/${boardId}/tasks/${taskId}`, data);
    return res.data.task;
  },

  move: async (boardId: string, taskId: string, data: MoveTaskDTO): Promise<Task> => {
    const res = await client.patch<{ task: Task }>(`/boards/${boardId}/tasks/${taskId}/move`, data);
    return res.data.task;
  },

  delete: async (boardId: string, taskId: string): Promise<boolean> => {
    const res = await client.delete<{ success: boolean }>(`/boards/${boardId}/tasks/${taskId}`);
    return res.data.success;
  },
};
