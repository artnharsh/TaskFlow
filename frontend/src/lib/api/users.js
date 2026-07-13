import client from "./client";

export const userApi = {
  search: (q) => client.get("/users/search", { params: { q } }).then((r) => r.data.users),
};
