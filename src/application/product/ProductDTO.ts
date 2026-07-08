import type { Product } from "../../domain/product/Product.js";

export type ProductDTO = {
  id: string;
  name: string;
  priceInCents: number;
  isActive: boolean;
  createdAt: string;
};

export const toProductDTO = (product: Product): ProductDTO => {
  const props = product.toJSON();

  return {
    id: props.id,
    name: props.name,
    priceInCents: props.priceInCents,
    isActive: props.isActive,
    createdAt: props.createdAt.toISOString(),
  };
};
