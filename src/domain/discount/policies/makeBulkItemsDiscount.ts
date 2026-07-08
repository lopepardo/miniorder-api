import type { DiscountPolicy, DiscountContext } from "../DiscountPolicy.js";

export function makeBulkItemsDiscountPolicy(): DiscountPolicy {
  const code = "BULK_ITEMS_15_PERCENT";
  const description = "15% discount for orders with at least 5 items";

  return {
    code,
    description,
    calculate(context: DiscountContext) {
      if (context.totalItems < 5) {
        return null;
      }

      return {
        code,
        description,
        amountInCents: Math.round(context.subtotalInCents * 0.15),
      };
    },
  };
}
