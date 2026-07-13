import { client } from "./client";
import { User, Task } from "@taskflow/types";

export const usersApi = {
  me: async (): Promise<User> => {
    const res = await client.get<User>("/users/me");
    return res.data;
  },

  updateMe: async (data: { name?: string }): Promise<User> => {
    const res = await client.patch<{ user: User }>("/users/me", data);
    return res.data.user;
  },

  myTasks: async (): Promise<Task[]> => {
    const res = await client.get<{ tasks: Task[] }>("/users/me/tasks");
    return res.data.tasks;
  },
};
