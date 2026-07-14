import { client } from "./client";
import {
  Board,
  Column,
  Task,
  BoardMember,
  BoardRole,
  CreateBoardDTO,
  UpdateBoardDTO,
  AddMemberDTO,
} from "@taskflow/types";

export interface FullBoardData {
  board: Board;
  columns: Column[];
  tasks: Task[];
  members: BoardMember[];
  role: BoardRole;
}

export const boardsApi = {
  list: async (): Promise<Board[]> => {
    const res = await client.get<{ boards: Board[] }>("/boards");
    return res.data.boards;
  },

  get: async (boardId: string): Promise<FullBoardData> => {
    const res = await client.get<FullBoardData>(`/boards/${boardId}`);
    return res.data;
  },

  create: async (data: CreateBoardDTO): Promise<Board> => {
    const res = await client.post<{ board: Board }>("/boards", data);
    return res.data.board;
  },

  update: async (boardId: string, data: UpdateBoardDTO): Promise<Board> => {
    const res = await client.patch<{ board: Board }>(`/boards/${boardId}`, data);
    return res.data.board;
  },

  delete: async (boardId: string): Promise<boolean> => {
    const res = await client.delete<{ success: boolean }>(`/boards/${boardId}`);
    return res.data.success;
  },

  // Alias for backward compatibility with components calling remove()
  remove: async (boardId: string): Promise<boolean> => {
    const res = await client.delete<{ success: boolean }>(`/boards/${boardId}`);
    return res.data.success;
  },

  getActivity: async (boardId: string, limit = 30) => {
    const res = await client.get(`/boards/${boardId}/activity`, { params: { limit } });
    return res.data.activities;
  },

  addMember: async (boardId: string, data: AddMemberDTO): Promise<BoardMember> => {
    const res = await client.post<{ member: BoardMember }>(`/boards/${boardId}/members`, data);
    return res.data.member;
  },

  removeMember: async (boardId: string, userId: string): Promise<boolean> => {
    const res = await client.delete<{ success: boolean }>(`/boards/${boardId}/members/${userId}`);
    return res.data.success;
  },
};
