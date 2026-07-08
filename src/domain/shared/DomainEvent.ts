export type DomainEventName = "OrderConfirmed";

export type DomainEvent<TPayload = unknown> = {
  readonly id: string;
  readonly name: DomainEventName;
  readonly occurredAt: Date;
  readonly payload: TPayload;
};
