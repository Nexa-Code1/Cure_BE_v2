import app from "./src/main.js";
import { bootstrap } from "./src/main.js";

if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
  bootstrap();
}

export default app;
