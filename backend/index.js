const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const config = require("./src/config/env");
const apiRoutes = require("./src/routes");
const { errorHandler, notFoundHandler } = require("./src/middleware/errorHandler");
const { setIo } = require("./src/realtime/index");
const { setupSocket } = require("./src/realtime/socketHandler");

const app = express();
const server = http.createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.FRONTEND_URL,
    credentials: true,
  },
});

// Provide io instance to realtime emitters
setIo(io);
// Setup socket event handlers and auth
setupSocket(io);

app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({ message: "Backend is running", status: "running" });
});

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Start the server
server.listen(config.PORT, () => {
  console.log(`Server is running on port http://localhost:${config.PORT}`);
});
