import type { DiscountPolicy, DiscountContext } from "../DiscountPolicy.js";

export function makeMinimumSubtotalDiscountPolicy(): DiscountPolicy {
  const code = "MINIMUM_SUBTOTAL_10_PERCENT";
  const description = "10% discount for orders with subtotal over 100.00";

  return {
    code,
    description,
    calculate(context: DiscountContext) {
      if (context.subtotalInCents < 10_000) {
        return null;
      }

      return {
        code,
        description,
        amountInCents: Math.round(context.subtotalInCents * 0.1),
      };
    },
  };
}
