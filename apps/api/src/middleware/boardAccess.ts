import { Request, Response, NextFunction } from "express";
import { query } from "../config/db";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { BoardRole } from "@taskflow/types";

export const requireBoardAccess = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const boardId = req.params.boardId;
    if (!boardId) throw ApiError.badRequest("boardId URL parameter required");

    const { rows } = await query(
      `
      SELECT b.id, b.owner_id,
             CASE
               WHEN b.owner_id = $2 THEN 'owner'::text
               ELSE bm.role
             END AS role
      FROM boards b
      LEFT JOIN board_members bm ON bm.board_id = b.id AND bm.user_id = $2
      WHERE b.id = $1 AND (b.owner_id = $2 OR bm.user_id = $2)
      `,
      [boardId, req.user.id],
    );

    if (!rows.length) throw ApiError.notFound("Board not found or access denied");

    req.board = {
      id: rows[0].id,
      role: rows[0].role as BoardRole,
      owner_id: rows[0].owner_id,
    };

    next();
  },
);
