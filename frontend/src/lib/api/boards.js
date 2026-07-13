import client from "./client";

export const boardApi = {
  list: () => client.get("/boards").then((r) => r.data.boards),
  create: (data) => client.post("/boards", data).then((r) => r.data.board),
  get: (id) => client.get(`/boards/${id}`).then((r) => r.data),
  update: (id, data) => client.patch(`/boards/${id}`, data).then((r) => r.data.board),
  remove: (id) => client.delete(`/boards/${id}`).then((r) => r.data),
  activity: (id, limit = 30) =>
    client.get(`/boards/${id}/activity`, { params: { limit } }).then((r) => r.data.activities),
  addMember: (id, data) => client.post(`/boards/${id}/members`, data).then((r) => r.data.member),
  removeMember: (id, userId) => client.delete(`/boards/${id}/members/${userId}`).then((r) => r.data),
};
