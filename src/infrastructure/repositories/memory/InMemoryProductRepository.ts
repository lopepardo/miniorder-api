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

    findPage: async ({ page, pageSize }) => {
      const start = (page - 1) * pageSize;
      const sortedProducts = Array.from(products.values()).sort((first, second) => {
        const createdAtDifference =
          second.toJSON().createdAt.getTime() - first.toJSON().createdAt.getTime();

        return createdAtDifference || second.id.localeCompare(first.id);
      });

      return {
        items: sortedProducts
          .slice(start, start + pageSize)
          .map((product) => Product.restore(product.toJSON())),
        totalItems: sortedProducts.length,
      };
    },
  };
};
