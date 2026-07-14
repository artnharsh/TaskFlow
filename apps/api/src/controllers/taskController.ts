import { Request, Response } from "express";
import { query } from "../config/db";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { emitToBoard, logActivity } from "../realtime";

const PRIORITIES = ["low", "medium", "high", "urgent"];

const fetchTask = async (taskId: string) => {
  const { rows } = await query(
    `
    SELECT t.*,
           a.name AS assignee_name,
           a.email AS assignee_email,
           a.avatar_url AS assignee_avatar
      FROM tasks t
      LEFT JOIN users a ON a.id = t.assignee_id
     WHERE t.id = $1
    `,
    [taskId],
  );

  return rows[0];
};

const ensureColumnInBoard = async (columnId: string, boardId: string) => {
  const { rows } = await query("SELECT id FROM columns WHERE id = $1 AND board_id = $2", [
    columnId,
    boardId,
  ]);

  if (!rows.length) throw ApiError.badRequest("Column does not belong to this board");
};

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const filters = ["t.board_id = $1"];
  const params: any[] = [req.board!.id];

  if (req.query.priority) {
    params.push(req.query.priority);
    filters.push(`t.priority = $${params.length}`);
  }

  if (req.query.assignee) {
    params.push(req.query.assignee);
    filters.push(`t.assignee_id = $${params.length}`);
  }

  if (req.query.column) {
    params.push(req.query.column);
    filters.push(`t.column_id = $${params.length}`);
  }

  if (req.query.q) {
    params.push(`%${req.query.q}%`);
    filters.push(`(t.title ILIKE $${params.length} OR t.description ILIKE $${params.length})`);
  }

  const { rows } = await query(
    `
     SELECT t.*,
            a.name AS assignee_name,
            a.email AS assignee_email,
            a.avatar_url AS assignee_avatar
       FROM tasks t
       LEFT JOIN users a ON a.id = t.assignee_id
      WHERE ${filters.join(" AND ")}
      ORDER BY t.position ASC
    `,
    params,
  );

  res.json({ tasks: rows });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { column_id, title: rawTitle, description, due_date, assignee_id } = req.body;

  const title = (rawTitle || "").trim();
  const priority = PRIORITIES.includes(req.body.priority) ? req.body.priority : "medium";

  if (!title) throw ApiError.badRequest("Task title is required");

  if (!column_id) throw ApiError.badRequest("column_id is required");

  await ensureColumnInBoard(column_id, req.board!.id);

  const posRes = await query(
    "SELECT COALESCE(MAX(position), 0) + 1000 AS pos FROM tasks WHERE column_id = $1",
    [column_id],
  );

  const { rows } = await query(
    `
    INSERT INTO tasks (
      board_id, column_id, title, description, priority, due_date, assignee_id, position, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id
    `,
    [
      req.board!.id,
      column_id,
      title,
      description || null,
      priority,
      due_date || null,
      assignee_id || null,
      posRes.rows[0].pos,
      req.user.id,
    ],
  );

  const task = await fetchTask(rows[0].id);

  emitToBoard(req.board!.id, "task:created", task);

  await logActivity({
    boardId: req.board!.id,
    userId: req.user.id,
    action: "task:created",
    details: { title, taskId: task.id },
  });

  res.status(201).json({ task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, priority, due_date, assignee_id } = req.body;

  if (priority && !PRIORITIES.includes(priority)) {
    throw ApiError.badRequest("Invalid priority level");
  }

  const { rows } = await query(
    `
     UPDATE tasks
        SET title       = COALESCE($3, title),
            description = CASE WHEN $4::text IS NULL THEN description ELSE $4 END,
            priority    = COALESCE($5, priority),
            due_date    = CASE WHEN $6::timestamptz IS NULL THEN due_date ELSE $6 END,
            assignee_id = CASE WHEN $7::uuid IS NULL THEN assignee_id ELSE $7 END,
            updated_at  = now()
      WHERE id = $1 AND board_id = $2
      RETURNING id
    `,
    [
      req.params.taskId,
      req.board!.id,
      title ? String(title).trim() : null,
      description ?? null,
      priority ?? null,
      due_date ?? null,
      assignee_id === undefined ? null : assignee_id,
    ],
  );

  if (!rows.length) throw ApiError.notFound("Task not found");

  const task = await fetchTask(rows[0].id);

  emitToBoard(req.board!.id, "task:updated", task);

  res.json({ task });
});

export const moveTask = asyncHandler(async (req: Request, res: Response) => {
  const { column_id, position } = req.body;

  if (!column_id || position === undefined) {
    throw ApiError.badRequest("column_id and position are required");
  }

  await ensureColumnInBoard(column_id, req.board!.id);

  const prevRes = await query(
    "SELECT t.column_id, c.title FROM tasks t JOIN columns c ON c.id = t.column_id WHERE t.id = $1 AND t.board_id = $2",
    [req.params.taskId, req.board!.id],
  );

  if (!prevRes.rows.length) throw ApiError.notFound("Task not found");

  const prevColId = prevRes.rows[0].column_id;
  const movedColumns = prevColId !== column_id;

  const { rows } = await query(
    `UPDATE tasks
        SET column_id = $3, position = $4, updated_at = now()
      WHERE id = $1 AND board_id = $2
      RETURNING id`,
    [req.params.taskId, req.board!.id, column_id, position],
  );

  const task = await fetchTask(rows[0].id);

  emitToBoard(req.board!.id, "task:moved", task);

  if (movedColumns) {
    const colRes = await query("SELECT title FROM columns WHERE id = $1", [column_id]);

    await logActivity({
      boardId: req.board!.id,
      userId: req.user.id,
      action: "task:moved",
      details: {
        title: task.title,
        from: prevRes.rows[0].title,
        to: colRes.rows[0]?.title || "new column",
      },
    });
  }

  res.json({ task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { rows } = await query(
    "DELETE FROM tasks WHERE id = $1 AND board_id = $2 RETURNING title",
    [req.params.taskId, req.board!.id],
  );

  if (!rows.length) throw ApiError.notFound("Task not found");

  emitToBoard(req.board!.id, "task:deleted", { id: req.params.taskId });

  await logActivity({
    boardId: req.board!.id,
    userId: req.user.id,
    action: "task:deleted",
    details: { title: rows[0].title },
  });

  res.json({ success: true });
});
