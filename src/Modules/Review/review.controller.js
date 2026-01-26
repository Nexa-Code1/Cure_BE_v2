import { Router } from "express";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";
import { errorHandlerMiddleware } from "../../Middlewares/error-handler-middleware.js";
import { addReview } from "./Services/review.service.js";
import { updateReview } from "./Services/review.service.js";

const reviewRouter = Router();

reviewRouter.post("/add-review/:id", authenticationMiddleware, errorHandlerMiddleware(addReview));
reviewRouter.put("/update-review/:id", authenticationMiddleware, errorHandlerMiddleware(updateReview));

export default reviewRouter;
