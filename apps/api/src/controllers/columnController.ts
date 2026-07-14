import { Request, Response } from "express";
import { query } from "../config/db";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { emitToBoard, logActivity } from "../realtime";

export const createColumn = asyncHandler(async (req: Request, res: Response) => {
  const title = (req.body.title || "").trim();
  if (!title) throw ApiError.badRequest("Column title is required");

  const posRes = await query(
    "SELECT COALESCE(MAX(position), 0) + 1000 AS pos FROM columns WHERE board_id = $1",
    [req.board!.id],
  );

  const position = posRes.rows[0].pos;

  const { rows } = await query(
    `INSERT INTO columns (board_id, title, position) VALUES ($1, $2, $3) RETURNING *`,
    [req.board!.id, title, position],
  );

  const column = rows[0];

  emitToBoard(req.board!.id, "column:created", column);

  await logActivity({
    boardId: req.board!.id,
    userId: req.user.id,
    action: "column:created",
    details: { title },
  });

  res.status(201).json({ column });
});

export const updateColumn = asyncHandler(async (req: Request, res: Response) => {
  const { columnId } = req.params;
  const title = req.body.title ? String(req.body.title).trim() : null;
  const position = req.body.position !== undefined ? Number(req.body.position) : null;

  const { rows } = await query(
    `
     UPDATE columns
     SET title = COALESCE($3, title),
         position = COALESCE($4, position)
     WHERE id = $1 AND board_id = $2
     RETURNING *
    `,
    [columnId, req.board!.id, title, position],
  );

  if (!rows.length) throw ApiError.notFound("Column not found");

  const column = rows[0];
  emitToBoard(req.board!.id, "column:updated", column);

  res.json({ column });
});

export const deleteColumn = asyncHandler(async (req: Request, res: Response) => {
  const { columnId } = req.params;

  const countRes = await query("SELECT COUNT(*) FROM tasks WHERE column_id = $1", [columnId]);

  if (parseInt(countRes.rows[0].count, 10) > 0) {
    throw ApiError.badRequest("Move or delete all tasks in this column before deleting it");
  }

  const { rows } = await query(
    "DELETE FROM columns WHERE id = $1 AND board_id = $2 RETURNING title",
    [columnId, req.board!.id],
  );

  if (!rows.length) throw ApiError.notFound("Column not found");

  emitToBoard(req.board!.id, "column:deleted", { id: columnId });

  res.json({ success: true });
});
