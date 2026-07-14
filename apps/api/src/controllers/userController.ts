import { Request, Response } from "express";
import { query } from "../config/db";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const { rows } = await query(
    "SELECT id, email, name, avatar_url, created_at FROM users WHERE id = $1",
    [req.user.id],
  );
  if (!rows.length) throw ApiError.notFound("User not found");
  res.json({ user: rows[0] });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const name = req.body.name ? String(req.body.name).trim() : null;

  const { rows } = await query(
    `UPDATE users
        SET name = COALESCE($2, name)
      WHERE id = $1
      RETURNING id, email, name, avatar_url, created_at`,
    [req.user.id, name],
  );

  res.json({ user: rows[0] });
});

export const myTasks = asyncHandler(async (req: Request, res: Response) => {
  const { rows } = await query(
    `
    SELECT t.*, b.title AS board_title, c.title AS column_title
    FROM tasks t
    JOIN boards b ON b.id = t.board_id
    JOIN columns c ON c.id = t.column_id
    WHERE t.assignee_id = $1
    ORDER BY t.updated_at DESC
    LIMIT 100
    `,
    [req.user.id],
  );

  res.json({ tasks: rows });
});
