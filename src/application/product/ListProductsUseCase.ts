import type { ProductRepository } from "../ports/ProductRepository.js";
import { toProductDTO, type ProductDTO } from "./ProductDTO.js";

type ListProductsUseCaseDeps = {
  readonly productRepository: ProductRepository;
};

export const makeListProductsUseCase = (deps: ListProductsUseCaseDeps) => {
  return async (): Promise<ProductDTO[]> => {
    const products = await deps.productRepository.findAll();
    return products.map(toProductDTO);
  };
};

export type ListProductsUseCase = ReturnType<typeof makeListProductsUseCase>;
