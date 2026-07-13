import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Board, CreateBoardDTO } from "@taskflow/types";
import { boardsApi } from "../lib/api";
import { useAuth } from "./AuthContext";

interface BoardsContextType {
  boards: Board[];
  loading: boolean;
  refreshBoards: () => Promise<Board[]>;
  createBoard: (data: CreateBoardDTO) => Promise<Board>;
}

const BoardsContext = createContext<BoardsContextType | null>(null);

export const BoardsProvider = ({ children }: { children: ReactNode }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshBoards = useCallback(async (): Promise<Board[]> => {
    if (!user) {
      setBoards([]);
      setLoading(false);
      return [];
    }
    setLoading(true);
    try {
      const b = await boardsApi.list();
      setBoards(b);
      return b;
    } catch {
      setBoards([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshBoards();
  }, [refreshBoards]);

  const createBoard = useCallback(async (data: CreateBoardDTO) => {
    const b = await boardsApi.create(data);
    setBoards((prev) => [b, ...prev]);
    return b;
  }, []);

  return (
    <BoardsContext.Provider value={{ boards, loading, refreshBoards, createBoard }}>
      {children}
    </BoardsContext.Provider>
  );
};

export const useBoards = (): BoardsContextType => {
  const ctx = useContext(BoardsContext);
  if (!ctx) throw new Error("useBoards must be used within BoardsProvider");
  return ctx;
};
