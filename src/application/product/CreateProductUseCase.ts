import { Product } from "../../domain/product/Product.js";
import type { GenerateId } from "../../shared/IdGenerator.js";
import type { ProductRepository } from "../ports/ProductRepository.js";
import { toProductDTO, type ProductDTO } from "./ProductDTO.js";

type CreateProductDeps = {
  readonly productRepository: ProductRepository;
  readonly idGenerator: GenerateId;
};
type CreateProductInput = {
  name: string;
  priceInCents: number;
};

export const makeCreateProductUseCase = (deps: CreateProductDeps) => {
  return async (input: CreateProductInput): Promise<ProductDTO> => {
    const product = Product.create({
      id: deps.idGenerator(),
      name: input.name,
      priceInCents: input.priceInCents,
    });

    await deps.productRepository.save(product);

    return toProductDTO(product);
  };
};

export type CreateProductUseCase = ReturnType<typeof makeCreateProductUseCase>;
