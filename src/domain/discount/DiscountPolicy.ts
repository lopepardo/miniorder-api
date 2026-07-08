export type AppliedDiscount = {
  code: string;
  description: string;
  amountInCents: number;
};

export type DiscountContext = {
  subtotalInCents: number;
  totalItems: number;
};

export type DiscountPolicy = {
  code: string;
  description: string;
  calculate(context: DiscountContext): AppliedDiscount | null;
};
