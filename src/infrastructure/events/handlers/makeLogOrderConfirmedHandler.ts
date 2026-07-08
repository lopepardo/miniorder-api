import type { DomainEventHandler } from "../../../application/ports/DomainEventBus.js";
import type { OrderConfirmed } from "../../../domain/order/events/OrderConfirmed.js";
import type { Logger } from "../../../shared/Logger.js";

export function makeLogOrderConfirmedHandler(deps: {
  logger: Logger;
}): DomainEventHandler<OrderConfirmed> {
  return {
    async handle(event: OrderConfirmed): Promise<void> {
      deps.logger.info(
        {
          eventId: event.id,
          orderId: event.payload.orderId,
          total: event.payload.total,
          occurredAt: event.occurredAt.toISOString(),
        },
        "Order confirmed",
      );
    },
  };
}
