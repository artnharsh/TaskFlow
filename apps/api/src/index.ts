import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { config } from "./config/env";
import apiRoutes from "./routes";
import { setupSocket } from "./realtime/socketHandler";
import { setIo } from "./realtime";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.FRONTEND_URL,
    credentials: true,
  },
});

setIo(io);
setupSocket(io);

app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({ message: "TaskFlow API Backend is running", status: "running" });
});

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

server.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});
