import client from "./client";

export const taskApi = {
  list: (boardId, params) =>
    client.get(`/boards/${boardId}/tasks`, { params }).then((r) => r.data.tasks),
  create: (boardId, data) =>
    client.post(`/boards/${boardId}/tasks`, data).then((r) => r.data.task),
  update: (boardId, taskId, data) =>
    client.patch(`/boards/${boardId}/tasks/${taskId}`, data).then((r) => r.data.task),
  move: (boardId, taskId, data) =>
    client.patch(`/boards/${boardId}/tasks/${taskId}/move`, data).then((r) => r.data.task),
  remove: (boardId, taskId) =>
    client.delete(`/boards/${boardId}/tasks/${taskId}`).then((r) => r.data),
};
