import { Server, Socket } from "socket.io";
import { verifyToken, TokenPayload } from "../utils/jwt";
import { boardRoom } from "./index";
import { query } from "../config/db";

interface AuthenticatedSocket extends Socket {
  user?: TokenPayload;
}

const checkBoardAccess = async (boardId: string, userId: string): Promise<boolean> => {
  try {
    const { rows } = await query(
      `SELECT 1 FROM boards b 
       LEFT JOIN board_members bm ON bm.board_id = b.id 
       WHERE b.id = $1 AND (b.owner_id = $2 OR bm.user_id = $2)`,
      [boardId, userId],
    );
    return rows.length > 0;
  } catch (error) {
    console.error("❌ [Socket Access Check Error]:", error);
    return false;
  }
};

export const setupSocket = (io: Server) => {
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication error: No authentication token provided"));

      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch (err: any) {
      console.warn("⚠️ [Socket Auth Warning]: Connection refused - invalid JWT token.");
      next(new Error("Authentication error: Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    socket.on("board:join", async (boardId: string) => {
      try {
        if (!boardId || typeof boardId !== "string" || !socket.user) {
          socket.emit("error", { message: "Invalid payload for board:join" });
          return;
        }

        const hasAccess = await checkBoardAccess(boardId, socket.user.id);
        if (hasAccess) {
          socket.join(boardRoom(boardId));
        } else {
          socket.emit("error", { message: "Unauthorized: You are not a member of this board" });
        }
      } catch (err: any) {
        console.error("❌ [Socket Join Error]:", err);
        socket.emit("error", { message: "Internal server error joining board stream" });
      }
    });

    socket.on("board:leave", (boardId: string) => {
      try {
        if (!boardId || typeof boardId !== "string") return;
        socket.leave(boardRoom(boardId));
      } catch (err: any) {
        console.error("❌ [Socket Leave Error]:", err);
      }
    });

    socket.on("error", (err: any) => {
      console.error("❌ [Socket Protocol Error]:", err);
    });

    socket.on("disconnect", (reason) => {
      // Disconnected socket cleanly
    });
  });
};
