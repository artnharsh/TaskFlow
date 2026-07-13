export * from "./client";
export * from "./auth";
export * from "./boards";
export * from "./columns";
export * from "./tasks";
export * from "./ai";
export * from "./users";

import { boardsApi } from "./boards";
import { columnsApi } from "./columns";
import { tasksApi } from "./tasks";
import { authApi } from "./auth";
import { aiApi } from "./ai";
import { usersApi } from "./users";

// Alias exports for compatibility
export const boardApi = boardsApi;
export const columnApi = columnsApi;
export const taskApi = tasksApi;
export const userApi = usersApi;
