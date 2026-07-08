import { Order } from "../../../domain/order/Order.js";
import { OrderItem } from "../../../domain/order/OrderItem.js";
import type { OrderRepository } from "../../../application/ports/OrderRepository.js";

const clone = (order: Order): Order => {
  const props = order.toJSON();

  return Order.restore({
    id: props.id,
    status: props.status,
    items: props.items.map((item) =>
      OrderItem.create({
        productId: item.productId,
        productName: item.productName,
        unitPriceInCents: item.unitPriceInCents,
        quantity: item.quantity,
      }),
    ),
    discounts: props.discounts,
    createdAt: new Date(props.createdAt),
    ...(props.confirmedAt ? { confirmedAt: new Date(props.confirmedAt) } : {}),
    ...(props.cancelledAt ? { cancelledAt: new Date(props.cancelledAt) } : {}),
  });
};

export const makeInMemoryOrderRepository = (): OrderRepository => {
  const orders = new Map<string, Order>();

  return {
    save: async (order: Order): Promise<void> => {
      orders.set(order.id, clone(order));
    },

    findById: async (id: string): Promise<Order | null> => {
      const order = orders.get(id);
      return order ? clone(order) : null;
    },

    findAll: async (): Promise<Order[]> => {
      return Array.from(orders.values()).map((order) => clone(order));
    },
  };
};
