import type { Order } from "../order/Order.js";
import type { AppliedDiscount, DiscountPolicy } from "./DiscountPolicy.js";

export const makeOrderDiscountService = (policies: DiscountPolicy[]) => {
  return {
    calculate: (order: Order): AppliedDiscount[] => {
      const subtotalInCents = order.subtotalInCents;
      const totalItems = order.totalItems;

      const discounts = policies
        .map((policy) =>
          policy.calculate({
            subtotalInCents,
            totalItems,
          }),
        )
        .filter((discount) => discount !== null);

      return discounts;
    },
  };
};

export type OrderDiscountService = ReturnType<typeof makeOrderDiscountService>;
