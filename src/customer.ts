export type Customer = {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerFields = Omit<Customer, "id" | "createdAt" | "updatedAt">;

export type CustomerUpdate = Partial<CustomerFields>;

export type CustomerQuery = {
  email?: string;
  name?: string;
  page?: number;
  limit?: number;
};
