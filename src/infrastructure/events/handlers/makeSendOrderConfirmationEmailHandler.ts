import type { DomainEventHandler } from "../../../application/ports/DomainEventBus.js";
import type { EmailSender } from "../../../application/ports/EmailSender.js";
import type { OrderConfirmed } from "../../../domain/order/events/OrderConfirmed.js";

export function makeSendOrderConfirmationEmailHandler(deps: {
  emailSender: EmailSender;
}): DomainEventHandler<OrderConfirmed> {
  return {
    async handle(event: OrderConfirmed): Promise<void> {
      await deps.emailSender.send({
        to: "demo.customer@miniorder.local",
        subject: "Your order was confirmed",
        body: `Order ${event.payload.orderId} was confirmed with total ${event.payload.total}.`,
      });
    },
  };
}
