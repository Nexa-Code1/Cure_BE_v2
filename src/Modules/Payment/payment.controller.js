import { Router } from "express";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";
import {
  createSetupIntent,
  addPaymentMethod,
  removePaymentMethod,
  getPaymentMethods,
} from "./Services/payment.services.js";
import { errorHandlerMiddleware } from "../../Middlewares/error-handler-middleware.js";
const paymentRouter = Router();

paymentRouter.get(
  "/payment-methods",
  authenticationMiddleware,
  errorHandlerMiddleware(getPaymentMethods)
);
paymentRouter.post(
  "/create-setup-intent",
  authenticationMiddleware,
  errorHandlerMiddleware(createSetupIntent)
);
paymentRouter.post(
  "/add-payment-method",
  authenticationMiddleware,
  errorHandlerMiddleware(addPaymentMethod)
);
paymentRouter.post(
  "/remove-payment-method",
  authenticationMiddleware,
  errorHandlerMiddleware(removePaymentMethod)
);

export default paymentRouter;
