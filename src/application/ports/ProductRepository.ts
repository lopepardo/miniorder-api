import type { Product } from "../../domain/product/Product.js";
import type { PaginatedItems, PaginationInput } from "../shared/Pagination.js";

export type ProductRepository = {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findPage(pagination: PaginationInput): Promise<PaginatedItems<Product>>;
};
