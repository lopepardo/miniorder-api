import { describe, expect, it, vi } from "vitest";
import { Order } from "../../../../src/domain/order/Order.js";
import { AppliedDiscount, DiscountPolicy } from "../../../../src/domain/discount/DiscountPolicy.js";
import { makeOrderDiscountService } from "./../../../../src/domain/discount/OrderDiscountService";

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

describe("makeOrderDiscountService", () => {
  const order = createOrderWithItem();

  it("calculates discounts using the policies received", () => {
    const code = "DISCOUNT_1";
    const description = "discount 1";

    const discount: AppliedDiscount = {
      code,
      description,
      amountInCents: 1_000,
    };

    const policy: DiscountPolicy = {
      code,
      description,
      calculate: vi.fn().mockReturnValue(discount),
    };

    const service = makeOrderDiscountService([policy]);

    expect(service.calculate(order)).toEqual([discount]);
  });

  it("pass subtotalInCents and totalItems to each policy", () => {
    const policy: DiscountPolicy = {
      code: "DISCOUNT_1",
      description: "discount 1",
      calculate: vi.fn().mockReturnValue(null),
    };

    const service = makeOrderDiscountService([policy]);

    service.calculate(order);

    expect(policy.calculate).toHaveBeenCalledWith({
      subtotalInCents: 3000,
      totalItems: 2,
    });
  });

  it("filter out policies that do not offer a discount", () => {
    const appliedDiscount: AppliedDiscount = {
      code: "BULK_DISCOUNT",
      description: "bulk discount",
      amountInCents: 500,
    };

    const policies: DiscountPolicy[] = [
      {
        code: "NOT_APPLY_DISCOUNT",
        description: "Do not apply a discount",
        calculate: vi.fn().mockReturnValue(null),
      },
      {
        code: "BULK_DISCOUNT",
        description: "bulk discount",
        calculate: vi.fn().mockReturnValue(appliedDiscount),
      },
    ];

    const service = makeOrderDiscountService(policies);

    expect(service.calculate(order)).toEqual([appliedDiscount]);
  });
});
