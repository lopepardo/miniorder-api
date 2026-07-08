import type { Order } from "../../domain/order/Order.js";

export type OrderRepository = {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
};
