import { Router, type RequestHandler, type Response } from "express";
import type { Booking } from "./booking.js";
import type { BookingService } from "./services/booking.service.js";

type ErrorResponse = { error: string };
type ApiResponse = Booking | ErrorResponse;
type RouteParams = Record<string, string>;

function sendError(
  response: Response<ApiResponse>,
  status: number,
  message: string,
): void {
  response.status(status).json({ error: message });
}

export function createBookingsRouter(
  service: BookingService,
): ReturnType<typeof Router> {
  const router = Router();

  const createBooking: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    const result = service.create(request.body);

    switch (result.kind) {
      case "created":
        response.status(201).json(result.booking);
        return;
      case "invalid":
        sendError(response, 400, result.message);
        return;
      case "not_found":
        sendError(response, 404, `${result.resource} not found.`);
        return;
      case "unavailable":
        sendError(
          response,
          409,
          `Launch is not open for booking (status: ${result.status}).`,
        );
        return;
      case "capacity_conflict":
        sendError(
          response,
          409,
          `Only ${result.availableSeats} seat(s) are available.`,
        );
    }
  };

  const getBooking: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    const booking = service.getById(request.params.id);
    if (!booking) {
      sendError(response, 404, "Booking not found.");
      return;
    }

    response.json(booking);
  };

  router.post("/", createBooking);
  router.get("/:id", getBooking);

  return router;
}
