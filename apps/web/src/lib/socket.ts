import { io, Socket } from "socket.io-client";
import { getToken } from "./api/client";

const URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export const socket: Socket = io(URL, {
  autoConnect: false,
  auth: (cb) => {
    cb({ token: getToken() });
  },
});

export const getSocket = () => socket;

export const connectSocket = () => {
  if (!socket.connected && getToken()) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const joinBoardRoom = (boardId: string) => {
  if (!boardId) return;
  connectSocket();
  socket.emit("board:join", boardId);
};

export const leaveBoardRoom = (boardId: string) => {
  if (!boardId) return;
  socket.emit("board:leave", boardId);
};
