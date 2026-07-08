import { describe, expect, it } from "vitest";
import { Order } from "../../../../src/domain/order/Order.js";

const createOrderWithItem = () => {
  const order = Order.create({ id: "order-1" });

  order.addItem({
    productId: "product-1",
    productName: "Coffee",
    unitPriceInCents: 1500,
    quantity: 2,
  });

  return order;
};

describe("Order", () => {
  it("creates a valid order", () => {
    const order = Order.create({ id: "order-1" });

    expect(order.id).toBe("order-1");
    expect(order.status).toBe("draft");
    expect(order.items).toHaveLength(0);
    expect(order.discounts).toHaveLength(0);
  });

  it("calculates total from its items", () => {
    const order = createOrderWithItem();

    expect(order.totalInCents).toBe(3000);
  });

  it("merges quantities when the same product is added twice", () => {
    const order = createOrderWithItem();

    order.addItem({
      productId: "product-1",
      productName: "Coffee",
      unitPriceInCents: 1500,
      quantity: 1,
    });

    expect(order.items).toHaveLength(1);
    expect(order.totalInCents).toBe(4500);
  });

  it("correctly confirms an order", () => {
    const order = createOrderWithItem();
    order.confirm({ eventId: "event-id" });

    expect(order.status).toBe("confirmed");
  });

  it("calculates totals", () => {
    const order = createOrderWithItem();
    order.addItem({
      productId: "product-2",
      productName: "Tea",
      unitPriceInCents: 1200,
      quantity: 1,
    });

    expect(order.totalItems).toBe(3);
    expect(order.subtotalInCents).toBe(4200);
    expect(order.discounts).toHaveLength(0);
    expect(order.discountTotalInCents).toBe(0);
    expect(order.totalInCents).toBe(4200);
  });

  it("calculate totals with discounts", () => {
    const order = createOrderWithItem();

    order.addDiscounts([
      {
        code: "DISCOUNT_1",
        description: "discount 1",
        amountInCents: 500,
      },
      {
        code: "DISCOUNT_2",
        description: "discount 2",
        amountInCents: 500,
      },
    ]);

    expect(order.totalItems).toBe(2);
    expect(order.subtotalInCents).toBe(3000);
    expect(order.discounts).toHaveLength(2);
    expect(order.discountTotalInCents).toBe(1000);
    expect(order.totalInCents).toBe(2000);
  });

  it("does not allow confirming an empty order", () => {
    const order = Order.create({ id: "order-1" });

    expect(() => order.confirm({ eventId: "event-id" })).toThrow(
      "Order must have at least one item before confirmation.",
    );
  });

  it("does not allow modifying a confirmed order", () => {
    const order = createOrderWithItem();
    order.confirm({ eventId: "event-id" });

    expect(() =>
      order.addItem({
        productId: "product-2",
        productName: "Tea",
        unitPriceInCents: 1200,
        quantity: 1,
      }),
    ).toThrow("Only draft orders can be modified.");
  });

  it("does not allow canceling a confirmed order", () => {
    const order = createOrderWithItem();
    order.confirm({ eventId: "event-id" });

    expect(() => order.cancel()).toThrow("Order is already confirmed");
  });

  it("does not allow confirming an already canceled order", () => {
    const order = createOrderWithItem();
    order.cancel();

    expect(() => order.confirm({ eventId: "event-id" })).toThrow(
      "Only draft orders can be confirmed.",
    );
  });
});
