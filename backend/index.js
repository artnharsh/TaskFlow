require("dotenv").config();
console.log(process.env.JWT_SECRET);
const express = require('express');
const cors = require("cors");

const apiRoutes = require("./src/routes");
const {
    errorHandler,
    notFoundHandler
} = require("./src/middleware/errorHandler");

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    }),
);

app.use(express.json({ limit: '1mb' }));

app.get("/", (_req, res) => {
    res.json({ message: "Backend is running", status: "running" })
});

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});