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

if (process.env.NODE_ENV !== "production") {
    config();
}

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

app.get("/debug-env", (req, res) => {
    res.json({
        node_env: process.env.NODE_ENV,
        vercel: process.env.VERCEL,
        jwt_secret_login_status: process.env.JWT_SECRET_LOGIN ? "Loaded" : "Not Loaded",
        jwt_secret_login_value_length: process.env.JWT_SECRET_LOGIN ? process.env.JWT_SECRET_LOGIN.length : 0,
        jwt_secret_login_first_char: process.env.JWT_SECRET_LOGIN ? process.env.JWT_SECRET_LOGIN[0] : "",
        jwt_secret_login_last_char: process.env.JWT_SECRET_LOGIN ? process.env.JWT_SECRET_LOGIN[process.env.JWT_SECRET_LOGIN.length - 1] : "",
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
