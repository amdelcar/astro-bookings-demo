import { Router, type RequestHandler, type Response } from "express";
import { logEvent } from "./logger.js";
import {
  InMemoryCustomerRepository,
  type CustomerRepository,
} from "./customer-repository.js";
import type { Customer } from "./customer.js";
import type { Booking } from "./booking.js";
import { CustomerService } from "./services/customer.service.js";
import type { BookingService } from "./services/booking.service.js";
import { ValidationError } from "./utils/validation.js";

type ErrorResponse = { error: string };
type PaginatedResponse = {
  items: Customer[];
  page: number;
  limit: number;
  total: number;
};
type ApiResponse =
  | Customer
  | Customer[]
  | Booking[]
  | PaginatedResponse
  | ErrorResponse;
type RouteParams = Record<string, string>;

function sendError(
  response: Response<ApiResponse>,
  status: number,
  message: string,
): void {
  response.status(status).json({ error: message });
}

function parsePositiveInt(value: unknown): number | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const asNumber = Number(value);
  if (!Number.isInteger(asNumber) || asNumber <= 0) {
    return undefined;
  }

  return asNumber;
}

function readQueryString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return undefined;
}

export function createCustomersRouter(
  repository: CustomerRepository = new InMemoryCustomerRepository(),
  bookingService?: BookingService,
): ReturnType<typeof Router> {
  const router = Router();
  const service = new CustomerService(repository);

  const listCustomers: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    const page = parsePositiveInt(request.query.page);
    const limit = parsePositiveInt(request.query.limit);
    const email = readQueryString(request.query.email);
    const name = readQueryString(request.query.name);

    const matches = service.list({ email, name });
    if (page === undefined && limit === undefined) {
      response.json(matches);
      return;
    }

    const total = matches.length;
    const requestedPage = page ?? 1;
    const requestedLimit = limit ?? Math.max(total, 1);
    const items = service.list({
      email,
      name,
      page: requestedPage,
      limit: requestedLimit,
    });

    response.json({
      items,
      page: requestedPage,
      limit: requestedLimit,
      total,
    });
  };

  const createCustomer: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    try {
      const customer = service.create(request.body);
      logEvent("customer_created", { customerId: customer.id });
      response.status(201).json(customer);
    } catch (error) {
      if (error instanceof ValidationError) {
        sendError(response, 400, error.message);
        return;
      }

      throw error;
    }
  };

  const getCustomerById: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    const customer = service.getById(request.params.id);
    if (!customer) {
      sendError(response, 404, "Customer not found.");
      return;
    }

    response.json(customer);
  };

  const getCustomerByEmail: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    const email = readQueryString(request.params.email);
    if (!email) {
      sendError(response, 400, "Email is required.");
      return;
    }

    const customer = service.getByEmail(email);
    if (!customer) {
      sendError(response, 404, "Customer not found.");
      return;
    }

    response.json(customer);
  };

  const updateCustomer: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    try {
      const customer = service.update(request.params.id, request.body);
      if (!customer) {
        sendError(response, 404, "Customer not found.");
        return;
      }

      logEvent("customer_updated", { customerId: customer.id });
      response.json(customer);
    } catch (error) {
      if (error instanceof ValidationError) {
        sendError(response, 400, error.message);
        return;
      }

      throw error;
    }
  };

  const deleteCustomer: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    if (!service.delete(request.params.id)) {
      sendError(response, 404, "Customer not found.");
      return;
    }

    logEvent("customer_deleted", { customerId: request.params.id });
    response.status(204).send();
  };

  const listCustomerBookings: RequestHandler<
    RouteParams,
    ApiResponse,
    unknown
  > = (request, response) => {
    const bookings = bookingService?.listByCustomer(request.params.id);
    if (!bookings) {
      sendError(response, 404, "Customer not found.");
      return;
    }

    response.json(bookings);
  };

  router.get("/", listCustomers);
  router.post("/", createCustomer);
  router.get("/email/:email", getCustomerByEmail);
  if (bookingService) {
    router.get("/:id/bookings", listCustomerBookings);
  }
  router.get("/:id", getCustomerById);
  router.put("/:id", updateCustomer);
  router.delete("/:id", deleteCustomer);

  return router;
}
