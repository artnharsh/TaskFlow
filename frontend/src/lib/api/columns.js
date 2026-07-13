import client from "./client";

export const columnApi = {
  create: (boardId, data) =>
    client.post(`/boards/${boardId}/columns`, data).then((r) => r.data.column),
  update: (boardId, columnId, data) =>
    client.patch(`/boards/${boardId}/columns/${columnId}`, data).then((r) => r.data.column),
  remove: (boardId, columnId) =>
    client.delete(`/boards/${boardId}/columns/${columnId}`).then((r) => r.data),
};
