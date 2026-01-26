import { Router } from "express";
import {
  deleteMyProfile,
  getMyProfile,
  updateMyProfile,
  updatePassword,
} from "./Services/user.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";
import { uploadUserImage } from "./../../config/multer.js";
import { errorHandlerMiddleware } from "../../Middlewares/error-handler-middleware.js";

const userRouter = Router();

userRouter.get("/profile", authenticationMiddleware, getMyProfile);
userRouter.put(
  "/update-profile",
  authenticationMiddleware,
  uploadUserImage.single("image"),
  errorHandlerMiddleware(updateMyProfile)
);
userRouter.patch("/update-password", authenticationMiddleware, errorHandlerMiddleware(updatePassword));
userRouter.delete("/delete-profile", authenticationMiddleware, errorHandlerMiddleware(deleteMyProfile));

export default userRouter;
