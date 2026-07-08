import { z } from "zod";

import { Order } from "../../../../domain/order/Order.js";
import { OrderItem } from "./../../../../domain/order/OrderItem.js";

const OrderRowSchema = z.object({
  id: z.string(),
  status: z.enum(["draft", "confirmed", "cancelled"]),
  created_at: z.date(),
  confirmed_at: z.date().nullable(),
  cancelled_at: z.date().nullable(),
});

const OrderItemRowSchema = z.object({
  order_id: z.string(),
  product_id: z.string(),
  product_name: z.string(),
  unit_price_cents: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

const OrderItemDiscountSchema = z.object({
  order_id: z.string(),
  code: z.string(),
  description: z.string(),
  amount_in_cents: z.number().int().nonnegative(),
});

export type OrderRow = z.infer<typeof OrderRowSchema>;
export type OrderItemRow = z.infer<typeof OrderItemRowSchema>;
export type OrderItemDiscountRow = z.infer<typeof OrderItemDiscountSchema>;

export const toOrderPersistence = (
  order: Order,
): [OrderRow, OrderItemRow[], OrderItemDiscountRow[]] => {
  const props = order.toJSON();

  const orderRow = {
    id: props.id,
    status: props.status,
    created_at: props.createdAt,
    confirmed_at: props.confirmedAt ?? null,
    cancelled_at: props.cancelledAt ?? null,
  };

  const itemRows = props.items.map((item) => ({
    order_id: props.id,
    product_id: item.productId,
    product_name: item.productName,
    unit_price_cents: item.unitPriceInCents,
    quantity: item.quantity,
  }));

  const discountRows = props.discounts.map((discount) => ({
    order_id: props.id,
    code: discount.code,
    description: discount.description,
    amount_in_cents: discount.amountInCents,
  }));

  return [orderRow, itemRows, discountRows];
};

export const toOrderDomain = (input: {
  order: unknown;
  items: unknown[];
  discounts: unknown[];
}): Order => {
  const orderRow: OrderRow = OrderRowSchema.parse(input.order);
  const itemRows: OrderItemRow[] = input.items.map((item) => OrderItemRowSchema.parse(item));
  const discountRows: OrderItemDiscountRow[] = input.discounts.map((item) =>
    OrderItemDiscountSchema.parse(item),
  );

  return Order.restore({
    id: orderRow.id,
    status: orderRow.status,
    items: itemRows.map((item) =>
      OrderItem.create({
        productId: item.product_id,
        productName: item.product_name,
        unitPriceInCents: item.unit_price_cents,
        quantity: item.quantity,
      }),
    ),
    discounts: discountRows.map((discount) => ({
      code: discount.code,
      description: discount.description,
      amountInCents: discount.amount_in_cents,
    })),
    createdAt: new Date(orderRow.created_at),
    ...(orderRow.confirmed_at ? { confirmedAt: new Date(orderRow.confirmed_at) } : {}),
    ...(orderRow.cancelled_at ? { cancelledAt: new Date(orderRow.cancelled_at) } : {}),
  });
};
