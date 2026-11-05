import type { Customer, CustomerQuery } from "../customer.js";
import type { CustomerRepository } from "../customer-repository.js";
import {
  validateCustomerInput,
  validateCustomerUpdate,
  ValidationError,
} from "../utils/validation.js";

export class CustomerService {
  constructor(private readonly repository: CustomerRepository) {}

  create(input: unknown): Customer {
    const payload = validateCustomerInput(input);

    if (this.repository.findByEmail(payload.email)) {
      throw new ValidationError("Email already registered.");
    }

    return this.repository.create(payload);
  }

  list(query: CustomerQuery = {}): Customer[] {
    return this.repository.list(query);
  }

  getById(id: string): Customer | undefined {
    return this.repository.findById(id);
  }

  getByEmail(email: string): Customer | undefined {
    return this.repository.findByEmail(email);
  }

  update(id: string, input: unknown): Customer | undefined {
    const existing = this.repository.findById(id);
    if (!existing) {
      return undefined;
    }

    const partial = validateCustomerUpdate(input);

    if (Object.prototype.hasOwnProperty.call(partial, "email")) {
      throw new ValidationError("Email cannot be modified.");
    }

    return this.repository.update(id, {
      ...partial,
      updatedAt: new Date(),
    });
  }

  delete(id: string): boolean {
    return this.repository.delete(id);
  }
}
