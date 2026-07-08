import type { DomainEventBus, DomainEventHandler } from "../../application/ports/DomainEventBus.js";
import type { DomainEvent, DomainEventName } from "../../domain/shared/DomainEvent.js";

type HandlersByEventName = Partial<Record<DomainEventName, DomainEventHandler[]>>;

export const makeSyncDomainEventBus = (
  handlersByEventName: HandlersByEventName,
): DomainEventBus => {
  return {
    async publish(event: DomainEvent): Promise<void> {
      const handlers = handlersByEventName[event.name] ?? [];

      for (const handler of handlers) {
        await handler.handle(event);
      }
    },

    async publishAll(events: DomainEvent[]): Promise<void> {
      for (const event of events) {
        await this.publish(event);
      }
    },
  };
};
