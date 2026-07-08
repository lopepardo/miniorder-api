import type { DomainEvent } from "../../shared/DomainEvent.js";

export type OrderConfirmedPayload = {
  readonly orderId: string;
  readonly total: number;
};

export type OrderConfirmed = DomainEvent<OrderConfirmedPayload> & {
  readonly name: "OrderConfirmed";
};

export function createOrderConfirmedEvent(input: {
  id: string;
  orderId: string;
  total: number;
  occurredAt?: Date;
}): OrderConfirmed {
  return {
    id: input.id,
    name: "OrderConfirmed",
    occurredAt: input.occurredAt ?? new Date(),
    payload: {
      orderId: input.orderId,
      total: input.total,
    },
  };
}
