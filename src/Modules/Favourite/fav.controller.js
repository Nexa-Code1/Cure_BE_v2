import { Router } from "express";
import {
  addFavourite,
  deleteFavourite,
  getFavourite,
} from "./Services/fav.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";
import { errorHandlerMiddleware } from "../../Middlewares/error-handler-middleware.js";
const favRouter = Router();

favRouter.get("/get-favourites", authenticationMiddleware, errorHandlerMiddleware(getFavourite));
favRouter.post(
  "/add-favourite/:doctor_id",
  authenticationMiddleware,
  errorHandlerMiddleware(addFavourite)
);
favRouter.delete(
  "/delete-favourite/:doctor_id",
  authenticationMiddleware,
  errorHandlerMiddleware(deleteFavourite)
);

export default favRouter;
