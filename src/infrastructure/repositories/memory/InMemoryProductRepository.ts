import { Product } from "../../../domain/product/Product.js";
import type { ProductRepository } from "../../../application/ports/ProductRepository.js";

export const makeInMemoryProductRepository = (): ProductRepository => {
  const products = new Map<string, Product>();

  return {
    save: async (product: Product): Promise<void> => {
      products.set(product.id, Product.restore(product.toJSON()));
    },

    findById: async (id: string): Promise<Product | null> => {
      const product = products.get(id);
      return product ? Product.restore(product.toJSON()) : null;
    },

    findAll: async (): Promise<Product[]> => {
      return Array.from(products.values()).map((product) => Product.restore(product.toJSON()));
    },
  };
};
