import { z } from "zod";

import { Product } from "../../../../domain/product/Product.js";

const ProductRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  price_cents: z.number().int().nonnegative(),
  is_active: z.boolean(),
  created_at: z.date(),
});
type ProductRow = z.infer<typeof ProductRowSchema>;

export const toProductPersistence = (product: Product): ProductRow => {
  const props = product.toJSON();

  return {
    id: props.id,
    name: props.name,
    price_cents: props.priceInCents,
    is_active: props.isActive,
    created_at: props.createdAt,
  };
};

export const toProductDomain = (row: unknown): Product => {
  const parsedRow: ProductRow = ProductRowSchema.parse(row);

  return Product.restore({
    id: parsedRow.id,
    name: parsedRow.name,
    priceInCents: parsedRow.price_cents,
    isActive: parsedRow.is_active,
    createdAt: parsedRow.created_at,
  });
};
