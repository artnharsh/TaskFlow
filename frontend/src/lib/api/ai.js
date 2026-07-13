import client from "./client";

export const aiApi = {
  generateTasks: (boardId, data) =>
    client.post(`/boards/${boardId}/ai/generate-tasks`, data).then((r) => r.data),
  breakdown: (boardId, data) =>
    client.post(`/boards/${boardId}/ai/breakdown`, data).then((r) => r.data.subtasks),
  summary: (boardId) => client.post(`/boards/${boardId}/ai/summary`).then((r) => r.data.summary),
};
