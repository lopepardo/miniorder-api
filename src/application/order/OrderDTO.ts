import type { Order } from "../../domain/order/Order.js";

export type OrderDTO = {
  id: string;
  status: string;
  items: Array<{
    productId: string;
    productName: string;
    unitPriceInCents: number;
    quantity: number;
    subtotalInCents: number;
  }>;
  discounts: Array<{
    code: string;
    description: string;
    amountInCents: number;
  }>;

  totalItems: number;
  subtotalInCents: number;
  discountTotalInCents: number;
  totalInCents: number;

  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
};

export const toOrderDTO = (order: Order): OrderDTO => {
  const props = order.toJSON();

  return {
    id: props.id,
    status: props.status,
    items: props.items,
    discounts: props.discounts,
    totalItems: props.totalItems,
    subtotalInCents: props.subtotalInCents,
    discountTotalInCents: props.discountTotalInCents,
    totalInCents: props.totalInCents,
    createdAt: props.createdAt.toISOString(),
    ...(props.confirmedAt ? { confirmedAt: props.confirmedAt.toISOString() } : {}),
    ...(props.cancelledAt ? { cancelledAt: props.cancelledAt.toISOString() } : {}),
  };
};
