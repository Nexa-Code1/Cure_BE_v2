import { Router } from "express";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";
import { getSpecialists } from "./Services/specialists.service.js";
import { errorHandlerMiddleware } from "../../Middlewares/error-handler-middleware.js";

const specialistsRouter = Router();

specialistsRouter.get("/", authenticationMiddleware, errorHandlerMiddleware(getSpecialists));

export default specialistsRouter;
