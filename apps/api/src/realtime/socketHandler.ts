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
    console.error("Error checking board access for socket:", error);
    return false;
  }
};

export const setupSocket = (io: Server) => {
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication error: No token provided"));

      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    socket.on("board:join", async (boardId: string) => {
      if (!boardId || !socket.user) return;

      const hasAccess = await checkBoardAccess(boardId, socket.user.id);
      if (hasAccess) {
        socket.join(boardRoom(boardId));
      } else {
        socket.emit("error", { message: "Unauthorized to join board room" });
      }
    });

    socket.on("board:leave", (boardId: string) => {
      if (!boardId) return;
      socket.leave(boardRoom(boardId));
    });

    socket.on("disconnect", () => {
      // Clean up if needed
    });
  });
};
