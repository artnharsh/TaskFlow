const { verifyToken } = require("../utils/jwt");
const { boardRoom } = require("./index");
const { query } = require("../config/db");

const checkBoardAccess = async (boardId, userId) => {
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

const setupSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
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

  io.on("connection", (socket) => {
    // Join a specific board's real-time sync room
    socket.on("board:join", async (boardId) => {
      if (!boardId) return;

      // Ensure the user actually has permission to view this board's events
      const hasAccess = await checkBoardAccess(boardId, socket.user.id);
      if (hasAccess) {
        socket.join(boardRoom(boardId));
      } else {
        socket.emit("error", { message: "Unauthorized to join board room" });
      }
    });

    // Leave a board's real-time sync room
    socket.on("board:leave", (boardId) => {
      if (!boardId) return;
      socket.leave(boardRoom(boardId));
    });

    socket.on("disconnect", () => {
      // Clean up if needed
    });
  });
};

module.exports = { setupSocket };
