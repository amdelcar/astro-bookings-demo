import { randomUUID } from "node:crypto";
import type { Customer, CustomerFields, CustomerQuery } from "./customer.js";

export interface CustomerRepository {
  list(query?: CustomerQuery): Customer[];
  findById(id: string): Customer | undefined;
  findByEmail(email: string): Customer | undefined;
  create(fields: CustomerFields): Customer;
  update(
    id: string,
    fields: Partial<CustomerFields> & { updatedAt?: Date },
  ): Customer | undefined;
  delete(id: string): boolean;
}

export class InMemoryCustomerRepository implements CustomerRepository {
  private readonly customers = new Map<string, Customer>();

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  list(query: CustomerQuery = {}): Customer[] {
    const emailFilter = query.email ? this.normalizeEmail(query.email) : undefined;
    const nameFilter = query.name ? query.name.trim().toLowerCase() : undefined;
    const items = [...this.customers.values()]
      .map((customer) => ({ ...customer }))
      .filter((customer) => {
        if (emailFilter && customer.email.toLowerCase() !== emailFilter) {
          return false;
        }

        if (nameFilter && !customer.name.toLowerCase().includes(nameFilter)) {
          return false;
        }

        return true;
      });

    const hasPage =
      typeof query.page === "number" &&
      Number.isInteger(query.page) &&
      query.page > 0;
    const hasLimit =
      typeof query.limit === "number" &&
      Number.isInteger(query.limit) &&
      query.limit > 0;

    if (!hasPage && !hasLimit) {
      return items;
    }

    const page = hasPage ? query.page! : 1;
    const limit = hasLimit ? query.limit! : items.length || 1;
    const startIndex = (page - 1) * limit;

    return items.slice(startIndex, startIndex + limit);
  }

  findById(id: string): Customer | undefined {
    const customer = this.customers.get(id);
    return customer ? { ...customer } : undefined;
  }

  findByEmail(email: string): Customer | undefined {
    const normalizedEmail = this.normalizeEmail(email);
    for (const customer of this.customers.values()) {
      if (this.normalizeEmail(customer.email) === normalizedEmail) {
        return { ...customer };
      }
    }

    return undefined;
  }

  create(fields: CustomerFields): Customer {
    const now = new Date();
    const customer: Customer = {
      id: randomUUID(),
      ...fields,
      email: this.normalizeEmail(fields.email),
      createdAt: now,
      updatedAt: now,
    };

    this.customers.set(customer.id, customer);
    return { ...customer };
  }

  update(
    id: string,
    fields: Partial<CustomerFields> & { updatedAt?: Date },
  ): Customer | undefined {
    const current = this.customers.get(id);
    if (!current) {
      return undefined;
    }

    const updated: Customer = {
      ...current,
      ...fields,
      email: fields.email ? this.normalizeEmail(fields.email) : current.email,
      updatedAt: fields.updatedAt ?? new Date(),
    };

    this.customers.set(id, updated);
    return { ...updated };
  }

  delete(id: string): boolean {
    return this.customers.delete(id);
  }
}
