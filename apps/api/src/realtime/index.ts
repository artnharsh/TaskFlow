import { Server } from "socket.io";
import { query } from "../config/db";

let ioInstance: Server | null = null;

export const setIo = (io: Server) => {
  ioInstance = io;
};

export const boardRoom = (boardId: string) => `board:${boardId}`;

export const emitToBoard = (boardId: string, event: string, payload: any) => {
  if (ioInstance) {
    ioInstance.to(boardRoom(boardId)).emit(event, payload);
  }
};

interface ActivityOptions {
  boardId: string;
  userId: string;
  action: string;
  details?: Record<string, any>;
}

export const logActivity = async ({ boardId, userId, action, details }: ActivityOptions) => {
  try {
    const { rows } = await query(
      `
      INSERT INTO activity_logs (board_id, user_id, action, details)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [boardId, userId, action, details ? JSON.stringify(details) : null],
    );

    const fullRes = await query(
      `
      SELECT act.*, u.name AS user_name, u.email AS user_email, u.avatar_url AS user_avatar
      FROM activity_logs act
      JOIN users u ON u.id = act.user_id
      WHERE act.id = $1
      `,
      [rows[0].id],
    );

    if (fullRes.rows.length) {
      emitToBoard(boardId, "activity:logged", fullRes.rows[0]);
    }
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};
