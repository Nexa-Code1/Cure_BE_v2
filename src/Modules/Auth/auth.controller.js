import { Router } from "express";
import {
  register,
  login,
  resetPassword,
  sendOtp,
  verifyOtp,
  logout,
} from "./Services/auth.service.js";
import { errorHandlerMiddleware } from "../../Middlewares/error-handler-middleware.js";

const authRouter = Router();

// Auth routes
authRouter.post("/register", errorHandlerMiddleware(register));
authRouter.post("/login", errorHandlerMiddleware(login));
authRouter.post("/send-otp", errorHandlerMiddleware(sendOtp));
authRouter.post("/verify-otp", errorHandlerMiddleware(verifyOtp));
authRouter.post("/reset-password", errorHandlerMiddleware(resetPassword));
authRouter.post("/logout", errorHandlerMiddleware(logout));

export default authRouter;
