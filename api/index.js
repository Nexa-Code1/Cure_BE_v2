import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import connection from "../src/DB/connection.js";
import routerHandler from "../src/Utils/router-handler.js";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection with connection caching for serverless
let cachedDb = null;

const connectToDatabase = async () => {
    if (cachedDb) {
        return cachedDb;
    }

    try {
        await connection();
        cachedDb = true;
        console.log("MongoDB connected successfully.");
        return cachedDb;
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
    }
};

// CORS configuration for production and development
const corsOptions = {
    origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        process.env.FRONTEND_URL || "https://onlinebookingdoctor.netlify.app",
        "https://cure-fe.vercel.app",
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Handle static files differently for serverless
app.use("/uploads", express.static(path.join(__dirname, "../src/uploads")));

// Middleware to ensure database connection
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({ error: "Database connection failed" });
    }
});

routerHandler(app);

// Export the Express app for Vercel
export default app;