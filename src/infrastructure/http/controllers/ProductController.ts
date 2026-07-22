import type { Request, Response } from "express";
import { z } from "zod";
import type { CreateProductUseCase } from "../../../application/product/CreateProductUseCase.js";
import type { ListProductsUseCase } from "../../../application/product/ListProductsUseCase.js";
import type { GetProductUseCase } from "../../../application/product/GetProductUseCase.js";

const createProductSchema = z.object({
  name: z.string().min(2),
  priceInCents: z.number().int().positive(),
});

const productIdParamsSchema = z.object({
  productId: z.string().min(1),
});

type ProductControllerDeps = {
  readonly createProductUseCase: CreateProductUseCase;
  readonly listProductsUseCase: ListProductsUseCase;
  readonly getProductUseCase: GetProductUseCase;
};

export const makeProductController = (deps: ProductControllerDeps) => {
  return {
    create: async (request: Request, response: Response): Promise<void> => {
      const input = createProductSchema.parse(request.body);
      const product = await deps.createProductUseCase(input);
      response.status(201).json({ data: product });
    },

    list: async (_request: Request, response: Response): Promise<void> => {
      const products = await deps.listProductsUseCase();
      response.json({ data: products });
    },

    getById: async (request: Request, response: Response): Promise<void> => {
      const { productId } = productIdParamsSchema.parse(request.params);
      const product = await deps.getProductUseCase(productId);
      response.json({ data: product });
    },
  };
};

export type ProductController = ReturnType<typeof makeProductController>;
