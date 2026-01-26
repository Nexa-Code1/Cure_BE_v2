import express from "express";
import { config } from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connection from "./DB/connection.js";
import routerHandler from "./Utils/router-handler.js";
import { globalErrorHandler } from "./Middlewares/error-handler-middleware.js";

config();

const app = express();
const isVercel = process.env.VERCEL === "1";

/* =======================
   DATABASE (SERVERLESS SAFE)
======================= */

let isDBConnected = false;

async function connectDBOnce() {
    if (isDBConnected) return;
    await connection();
    isDBConnected = true;
}

connectDBOnce();

/* =======================
   CORS (SAFE)
======================= */

const allowedOrigins =
    (isVercel ? process.env.FRONTEND_URL : process.env.FRONTEND_DEFAULT_URL) ||
    "";

const normalizedOrigins = allowedOrigins
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (normalizedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error(`CORS blocked origin: ${origin}`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

/* =======================
   MIDDLEWARES
======================= */

app.use(express.json());

if (!isVercel) {
    app.use("/uploads", express.static("uploads"));
}

/* =======================
   ROUTES
======================= */

routerHandler(app);

app.get("/", (req, res) => {
    res.json({
        message: "API is running",
        status: "OK",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
    });
});

/* =======================
   ERROR HANDLER
======================= */

app.use(globalErrorHandler);

/* =======================
   LOCAL STATIC CLIENT
======================= */

app.use(express.static(path.join(__dirname, "..", "client", "dist")));
    app.use((req, res) => {
        res.sendFile(
            path.join(__dirname, "..", "client", "dist", "index.html")
        );
    });

/* =======================
   BOOTSTRAP (LOCAL ONLY)
======================= */

export function bootstrap() {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(
            `🌍 Environment: ${process.env.NODE_ENV || "development"}`
        );
        console.log(`🔗 Local: http://localhost:${PORT}`);
    });
}

/* =======================
   VERCEL EXPORT
======================= */

export default app;
