import type { DomainEvent } from "../../domain/shared/DomainEvent.js";

export type DomainEventHandler<TEvent extends DomainEvent = DomainEvent> = {
  handle(event: TEvent): Promise<void>;
};

export type DomainEventBus = {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
};
