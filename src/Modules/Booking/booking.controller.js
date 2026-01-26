import { Router } from "express";
import { authenticationMiddleware } from "./../../Middlewares/authentication-middleware.js";
import {
  getMyBookings,
  cancelReserve,
  reserveDoctor,
  completeBooking,
  bookingIntent,
  updateBooking,
} from "./Services/booking.service.js";
import { errorHandlerMiddleware } from "../../Middlewares/error-handler-middleware.js";

const bookingRouter = Router();

bookingRouter.get("/my-bookings", authenticationMiddleware, errorHandlerMiddleware(getMyBookings));
bookingRouter.post("/book-intent/:id", authenticationMiddleware, errorHandlerMiddleware(bookingIntent));
bookingRouter.post("/book-doctor/:id", authenticationMiddleware, errorHandlerMiddleware(reserveDoctor));
bookingRouter.put(
  "/update-booking/:id",
  authenticationMiddleware,
  errorHandlerMiddleware(updateBooking)
);
bookingRouter.put(
  "/complete-booking/:id",
  authenticationMiddleware,
  errorHandlerMiddleware(completeBooking)
);
bookingRouter.delete(
  "/cancel-doctor/:id",
  authenticationMiddleware,
  errorHandlerMiddleware(cancelReserve)
);

export default bookingRouter;
