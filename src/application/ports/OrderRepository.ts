import type { Order } from "../../domain/order/Order.js";
import type { PaginatedItems, PaginationInput } from "../shared/Pagination.js";

export type OrderRepository = {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findPage(pagination: PaginationInput): Promise<PaginatedItems<Order>>;
};
