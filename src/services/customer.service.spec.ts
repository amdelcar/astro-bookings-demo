import { describe, expect, it } from "vitest";
import { InMemoryCustomerRepository } from "../customer-repository.js";
import { CustomerService } from "./customer.service.js";
import { ValidationError } from "../utils/validation.js";

describe("CustomerService", () => {
  it("creates a customer with a normalized email and timestamps", () => {
    const service = new CustomerService(new InMemoryCustomerRepository());

    const customer = service.create({
      email: "  TEST@Example.com ",
      name: "Ana Delgado",
      phone: "+34666777888",
    });

    expect(customer.email).toBe("test@example.com");
    expect(customer.name).toBe("Ana Delgado");
    expect(customer.phone).toBe("+34666777888");
    expect(customer.id).toBeTypeOf("string");
    expect(customer.createdAt).toBeInstanceOf(Date);
    expect(customer.updatedAt).toBeInstanceOf(Date);
  });

  it("rejects duplicate emails", () => {
    const service = new CustomerService(new InMemoryCustomerRepository());

    service.create({
      email: "ana@example.com",
      name: "Ana Delgado",
      phone: "+34666777888",
    });

    expect(() =>
      service.create({
        email: "ANA@example.com",
        name: "Another Ana",
        phone: "+34123456789",
      }),
    ).toThrowError(new ValidationError("Email already registered."));
  });

  it("updates mutable fields and blocks email modification", () => {
    const service = new CustomerService(new InMemoryCustomerRepository());
    const customer = service.create({
      email: "ana@example.com",
      name: "Ana Delgado",
      phone: "+34666777888",
    });

    const updated = service.update(customer.id, {
      name: "Ana R. Delgado",
      phone: "+34666111222",
    });

    expect(updated).toMatchObject({
      id: customer.id,
      name: "Ana R. Delgado",
      phone: "+34666111222",
    });
    expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
      customer.updatedAt.getTime(),
    );

    expect(() =>
      service.update(customer.id, {
        email: "new@example.com",
      }),
    ).toThrowError(new ValidationError("Email cannot be modified."));
  });

  it("finds and deletes customers by id and email", () => {
    const service = new CustomerService(new InMemoryCustomerRepository());
    const customer = service.create({
      email: "test@example.com",
      name: "Test User",
      phone: "+34123456789",
    });

    expect(service.getById(customer.id)).toMatchObject({ email: "test@example.com" });
    expect(service.getByEmail("TEST@EXAMPLE.com")).toMatchObject({ id: customer.id });
    expect(service.delete(customer.id)).toBe(true);
    expect(service.getById(customer.id)).toBeUndefined();
  });
});
