import { config } from "dotenv";

// Conditionally load .env only in non-production environments
if (process.env.NODE_ENV !== "production") {
    config();
}

import app from '../src/main.js';

// This will be the handler for all incoming requests
export default async (req, res) => {
    if (req.url === "/debug-vercel-env") {
        return res.json({
            node_env: process.env.NODE_ENV,
            vercel: process.env.VERCEL,
            jwt_secret_login_status: process.env.JWT_SECRET_LOGIN ? "Loaded" : "Not Loaded",
            jwt_secret_login_value_length: process.env.JWT_SECRET_LOGIN ? process.env.JWT_SECRET_LOGIN.length : 0,
            jwt_secret_login_first_char: process.env.JWT_SECRET_LOGIN ? process.env.JWT_SECRET_LOGIN[0] : "",
            jwt_secret_login_last_char: process.env.JWT_SECRET_LOGIN ? process.env.JWT_SECRET_LOGIN[process.env.JWT_SECRET_LOGIN.length - 1] : "",
            timestamp: new Date().toISOString(),
        });
    } else {
        return app(req, res);
    }
};