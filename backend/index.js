require("dotenv").config();

const express = require('express');
const cors = require("cors");
const http = require("http");

const apiRoutes = require("./src/routes");
const {
    errorHandler,
    notFoundHandler
} = require("./src/middleware/errorHandler");

const {initSocket} = require("../backend/src/socket/index")

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://task-flow.vercel.app",
    "https://task-flow-4uepquzz0-xcalibers-projects.vercel.app",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

app.use(express.json({ limit: '1mb' }));

app.get("/", (_req, res) => {
    res.json({ message: "Backend is running", status: "running" })
});

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const server = http.createServer(app);
initSocket(server);

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});