import type { AppliedDiscount } from "../discount/DiscountPolicy.js";
import { AppError } from "../../shared/AppError.js";
import { OrderItem, type OrderItemProps } from "./OrderItem.js";
import type { OrderStatus } from "./OrderStatus.js";
import type { DomainEvent } from "../shared/DomainEvent.js";
import { createOrderConfirmedEvent } from "./events/OrderConfirmed.js";

export type OrderProps = {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
  discounts: AppliedDiscount[];
  createdAt: Date;

  confirmedAt?: Date;

  cancelledAt?: Date;
};

export class Order {
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(private readonly props: OrderProps) {}

  static create(input: { id: string }): Order {
    return new Order({
      id: input.id,
      status: "draft",
      items: [],
      discounts: [],
      createdAt: new Date(),
    });
  }

  static restore(props: OrderProps): Order {
    return new Order(props);
  }

  get id(): string {
    return this.props.id;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get items(): OrderItem[] {
    return [...this.props.items];
  }

  get discounts(): AppliedDiscount[] {
    return [...this.props.discounts];
  }

  get totalItems(): number {
    return this.props.items.reduce((total, item) => total + item.quantity, 0);
  }

  get subtotalInCents(): number {
    return this.props.items.reduce((total, item) => total + item.subtotalInCents, 0);
  }

  get discountTotalInCents(): number {
    return this.props.discounts.reduce((total, item) => total + item.amountInCents, 0);
  }

  get totalInCents(): number {
    return this.subtotalInCents - this.discountTotalInCents;
  }

  addItem(input: OrderItemProps): void {
    this.ensureDraft("Only draft orders can be modified.");

    const existingItem = this.props.items.find((item) => item.productId === input.productId);

    if (existingItem) {
      existingItem.increaseQuantity(input.quantity);
      return;
    }

    this.props.items.push(OrderItem.create(input));
  }

  addDiscounts(appliedDiscount: AppliedDiscount[]): void {
    this.ensureDraft("Only draft orders can be modified.");
    this.ensureValidPricing();

    this.props.discounts = appliedDiscount;
  }

  confirm(input: { eventId: string }): void {
    this.ensureDraft("Only draft orders can be confirmed.");

    if (this.props.items.length === 0) {
      throw new AppError(
        "Order must have at least one item before confirmation.",
        422,
        "EMPTY_ORDER",
      );
    }

    this.props.status = "confirmed";
    this.props.confirmedAt = new Date();

    this.recordDomainEvent(
      createOrderConfirmedEvent({
        id: input.eventId,
        orderId: this.id,
        total: this.totalInCents,
      }),
    );
  }

  cancel(): void {
    if (this.props.status === "cancelled") {
      throw new AppError("Order is already cancelled.", 409, "ORDER_ALREADY_CANCELLED");
    }

    if (this.props.status === "confirmed") {
      throw new AppError("Order is already confirmed.", 409, "ORDER_ALREADY_CONFIRMED");
    }

    this.props.status = "cancelled";
    this.props.cancelledAt = new Date();
  }

  toJSON(): Omit<OrderProps, "items" | "pricing"> & {
    items: ReturnType<OrderItem["toJSON"]>[];
    totalItems: number;
    subtotalInCents: number;
    discountTotalInCents: number;
    totalInCents: number;
  } {
    return {
      id: this.props.id,
      status: this.props.status,
      items: this.props.items.map((item) => item.toJSON()),
      discounts: this.props.discounts,

      totalItems: this.totalItems,
      subtotalInCents: this.subtotalInCents,
      discountTotalInCents: this.discountTotalInCents,
      totalInCents: this.totalInCents,

      createdAt: this.props.createdAt,
      ...(this.props.confirmedAt ? { confirmedAt: this.props.confirmedAt } : {}),
      ...(this.props.cancelledAt ? { cancelledAt: this.props.cancelledAt } : {}),
    };
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  private ensureDraft(message: string): void {
    if (this.props.status !== "draft") {
      throw new AppError(message, 409, "ORDER_NOT_DRAFT");
    }
  }

  private ensureValidPricing(): void {
    if (this.discountTotalInCents < 0) {
      throw new AppError("Discount total cannot be negative.", 422, "INVALID_ORDER_DISCOUNT");
    }

    if (this.discountTotalInCents > this.subtotalInCents) {
      throw new AppError(
        "Discount total cannot be greater than subtotal.",
        422,
        "INVALID_ORDER_DISCOUNT",
      );
    }

    if (this.totalInCents !== this.subtotalInCents - this.discountTotalInCents) {
      throw new AppError(
        "Order total does not match subtotal minus discounts.",
        422,
        "INVALID_ORDER_TOTAL",
      );
    }
  }

  private recordDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
