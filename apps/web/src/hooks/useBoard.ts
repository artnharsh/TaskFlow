import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { boardApi, taskApi, columnApi } from "../lib/api";
import { connectSocket } from "../lib/socket";
import {
  Board,
  Column,
  Task,
  BoardMember,
  BoardRole,
  CreateTaskDTO,
  UpdateTaskDTO,
} from "@taskflow/types";

/**
 * Loads a board and keeps it in sync via Socket.IO. Returns board state plus
 * mutation helpers that update optimistically and persist to the API.
 */
export const useBoard = (boardId: string) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [role, setRole] = useState<BoardRole>("member");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presence, setPresence] = useState<any[]>([]);

  const upsertTask = useCallback((task: Task) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx === -1) return [...prev, task];
      const next = [...prev];
      next[idx] = task;
      return next;
    });
  }, []);

  const removeTaskLocal = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initial load
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    boardApi
      .get(boardId)
      .then((data) => {
        if (!alive) return;
        setBoard(data.board);
        setColumns(data.columns);
        setTasks(data.tasks);
        setMembers(data.members);
        setRole(data.role);
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [boardId]);

  // Real-time sync
  useEffect(() => {
    const socket = connectSocket();
    if (socket) {
      socket.emit("board:join", boardId);
    }

    const onCreated = (t: Task) => upsertTask(t);
    const onUpdated = (t: Task) => upsertTask(t);
    const onMoved = (t: Task) => upsertTask(t);
    const onDeleted = ({ id }: { id: string }) => removeTaskLocal(id);
    const onColCreated = (c: Column) =>
      setColumns((p) => [...p, c].sort((a, b) => a.position - b.position));
    const onColUpdated = (c: Column) =>
      setColumns((p) =>
        p.map((x) => (x.id === c.id ? c : x)).sort((a, b) => a.position - b.position),
      );
    const onColDeleted = ({ id }: { id: string }) =>
      setColumns((p) => p.filter((x) => x.id !== id));
    const onBoardUpdated = (b: Board) => setBoard(b);
    const onPresenceSync = ({ users }: { users: any[] }) => setPresence(users || []);
    const onPresenceJoin = ({ user }: { user: any }) =>
      setPresence((p) => (p.find((u) => u.id === user.id) ? p : [...p, user]));
    const onPresenceLeave = ({ user }: { user: any }) =>
      setPresence((p) => p.filter((u) => u.id !== user.id));

    if (socket) {
      socket.on("task:created", onCreated);
      socket.on("task:updated", onUpdated);
      socket.on("task:moved", onMoved);
      socket.on("task:deleted", onDeleted);
      socket.on("column:created", onColCreated);
      socket.on("column:updated", onColUpdated);
      socket.on("column:deleted", onColDeleted);
      socket.on("board:updated", onBoardUpdated);
      socket.on("presence:sync", onPresenceSync);
      socket.on("presence:join", onPresenceJoin);
      socket.on("presence:leave", onPresenceLeave);
    }

    return () => {
      if (socket) {
        socket.emit("board:leave", boardId);
        socket.off("task:created", onCreated);
        socket.off("task:updated", onUpdated);
        socket.off("task:moved", onMoved);
        socket.off("task:deleted", onDeleted);
        socket.off("column:created", onColCreated);
        socket.off("column:updated", onColUpdated);
        socket.off("column:deleted", onColDeleted);
        socket.off("board:updated", onBoardUpdated);
        socket.off("presence:sync", onPresenceSync);
        socket.off("presence:join", onPresenceJoin);
        socket.off("presence:leave", onPresenceLeave);
      }
      setPresence([]);
    };
  }, [boardId, upsertTask, removeTaskLocal]);

  /* ----------------------------- mutations ----------------------------- */

  const createTask = useCallback(
    async (data: CreateTaskDTO) => {
      try {
        const task = await taskApi.create(boardId, data);
        upsertTask(task);
        return task;
      } catch (err: any) {
        toast.error(err.message);
        throw err;
      }
    },
    [boardId, upsertTask],
  );

  const updateTask = useCallback(
    async (taskId: string, data: UpdateTaskDTO) => {
      const prev = tasks.find((t) => t.id === taskId);
      if (prev) upsertTask({ ...prev, ...data }); // optimistic
      try {
        const task = await taskApi.update(boardId, taskId, data);
        upsertTask(task);
        return task;
      } catch (err: any) {
        if (prev) upsertTask(prev);
        toast.error(err.message);
        throw err;
      }
    },
    [boardId, tasks, upsertTask],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      const prev = tasks.find((t) => t.id === taskId);
      removeTaskLocal(taskId); // optimistic
      try {
        await taskApi.remove(boardId, taskId);
        toast.success("Task deleted");
      } catch (err: any) {
        if (prev) upsertTask(prev);
        toast.error(err.message);
      }
    },
    [boardId, tasks, removeTaskLocal, upsertTask],
  );

  // Apply a local move immediately, then persist.
  const moveTask = useCallback(
    async (taskId: string, columnId: string, position: number) => {
      const prev = tasks.find((t) => t.id === taskId);
      if (!prev) return;
      upsertTask({ ...prev, column_id: columnId, position });
      try {
        await taskApi.move(boardId, taskId, { column_id: columnId, position });
      } catch (err: any) {
        upsertTask(prev);
        toast.error(err.message);
      }
    },
    [boardId, tasks, upsertTask],
  );

  const addColumn = useCallback(
    async (title: string) => {
      try {
        const col = await columnApi.create(boardId, { title });
        setColumns((p) => [...p, col].sort((a, b) => a.position - b.position));
      } catch (err: any) {
        toast.error(err.message);
      }
    },
    [boardId],
  );

  const renameColumn = useCallback(
    async (columnId: string, title: string) => {
      setColumns((p) => p.map((c) => (c.id === columnId ? { ...c, title } : c)));
      try {
        await columnApi.update(boardId, columnId, { title });
      } catch (err: any) {
        toast.error(err.message);
      }
    },
    [boardId],
  );

  const deleteColumn = useCallback(
    async (columnId: string) => {
      try {
        await columnApi.remove(boardId, columnId);
        setColumns((p) => p.filter((c) => c.id !== columnId));
        setTasks((p) => p.filter((t) => t.column_id !== columnId));
      } catch (err: any) {
        toast.error(err.message);
      }
    },
    [boardId],
  );

  return {
    board,
    columns,
    tasks,
    members,
    role,
    loading,
    error,
    presence,
    setBoard,
    setMembers,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    upsertTask,
    addColumn,
    renameColumn,
    deleteColumn,
  };
};
