import { client } from "./client";
import { User, RegisterDTO, LoginDTO, AuthResponse } from "@taskflow/types";

export const authApi = {
  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>("/auth/register", data);
    return res.data;
  },
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>("/auth/login", data);
    return res.data;
  },
  me: async (): Promise<User> => {
    const res = await client.get<User>("/auth/me");
    return res.data;
  },
};
