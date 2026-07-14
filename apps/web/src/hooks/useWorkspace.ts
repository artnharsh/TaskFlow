import { useState, useEffect } from "react";
import { boardApi } from "../lib/api";
import { useBoards } from "../context/BoardsContext";
import { Task, BoardMember, Board } from "@taskflow/types";

export interface WorkspaceTask extends Task {
  board_id: string;
  board_title: string;
  board_color: string;
  status: string;
}

export interface WorkspaceMember extends BoardMember {
  boards: string[];
}

/**
 * Aggregates every board the user can see into a single flat list of tasks
 * (each tagged with its board + status) and a de-duplicated member directory.
 */
export const useWorkspace = () => {
  const { boards, loading: boardsLoading } = useBoards();
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (boardsLoading) return;
    if (!boards.length) {
      setTasks([]);
      setMembers([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(boards.map((b) => boardApi.get(b.id).catch(() => null))).then((results) => {
      if (cancelled) return;
      const allTasks: WorkspaceTask[] = [];
      const memberMap = new Map<string, WorkspaceMember>();

      results.forEach((res, i) => {
        if (!res) return;
        const board = res.board || boards[i];
        const colTitle: Record<string, string> = {};
        (res.columns || []).forEach((c) => {
          colTitle[c.id] = c.title;
        });
        (res.tasks || []).forEach((t) =>
          allTasks.push({
            ...t,
            board_id: board.id,
            board_title: board.title,
            board_color: board.color,
            status: colTitle[t.column_id] || "",
          }),
        );
        (res.members || []).forEach((m) => {
          const existing = memberMap.get(m.id);
          if (existing) {
            if (!existing.boards.includes(board.title)) existing.boards.push(board.title);
          } else {
            memberMap.set(m.id, { ...m, boards: [board.title] });
          }
        });
      });

      setTasks(allTasks);
      setMembers([...memberMap.values()]);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [boards, boardsLoading]);

  return { tasks, members, boards, loading: loading || boardsLoading };
};
