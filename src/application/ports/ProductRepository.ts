import type { Product } from "../../domain/product/Product.js";

export type ProductRepository = {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
};
