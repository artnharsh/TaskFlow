import { client } from "./client";
import { Column, CreateColumnDTO, UpdateColumnDTO } from "@taskflow/types";

export const columnsApi = {
  create: async (boardId: string, data: CreateColumnDTO): Promise<Column> => {
    const res = await client.post<{ column: Column }>(`/boards/${boardId}/columns`, data);
    return res.data.column;
  },

  update: async (boardId: string, columnId: string, data: UpdateColumnDTO): Promise<Column> => {
    const res = await client.patch<{ column: Column }>(
      `/boards/${boardId}/columns/${columnId}`,
      data,
    );
    return res.data.column;
  },

  delete: async (boardId: string, columnId: string): Promise<boolean> => {
    const res = await client.delete<{ success: boolean }>(`/boards/${boardId}/columns/${columnId}`);
    return res.data.success;
  },

  // Alias for backward compatibility with components calling remove()
  remove: async (boardId: string, columnId: string): Promise<boolean> => {
    const res = await client.delete<{ success: boolean }>(`/boards/${boardId}/columns/${columnId}`);
    return res.data.success;
  },
};
