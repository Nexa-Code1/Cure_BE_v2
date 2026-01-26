import { Router } from "express";
import {
  addDoctor,
  getDoctors,
  getDoctorById,
  getTopRatedDoctors,
} from "./Services/doctor.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";
import { errorHandlerMiddleware } from "../../Middlewares/error-handler-middleware.js";
import { uploadDoctorImage } from "./../../config/multer.js";

const doctorRouter = Router();

doctorRouter.post("/add-doctor", uploadDoctorImage.single("image"), errorHandlerMiddleware(addDoctor));
doctorRouter.get("/get-doctors", authenticationMiddleware, errorHandlerMiddleware(getDoctors));
doctorRouter.get("/get-doctor/:id", authenticationMiddleware, errorHandlerMiddleware(getDoctorById));
doctorRouter.get(
  "/get-top-rated-doctors",
  authenticationMiddleware,
  errorHandlerMiddleware(getTopRatedDoctors)
);

export default doctorRouter;
