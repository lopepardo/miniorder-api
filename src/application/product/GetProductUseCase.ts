import { AppError } from "../../shared/AppError.js";
import type { ProductRepository } from "../ports/ProductRepository.js";
import { toProductDTO, type ProductDTO } from "./ProductDTO.js";

type GetProductUseCaseDeps = {
  readonly productRepository: ProductRepository;
};

export const makeGetProductUseCase = (deps: GetProductUseCaseDeps) => {
  return async (productId: string): Promise<ProductDTO> => {
    const product = await deps.productRepository.findById(productId);

    if (!product) {
      throw new AppError("Prodcut not found", 404, "PRODUCT_NOT_FOUND");
    }

    return toProductDTO(product);
  };
};

export type GetProductUseCase = ReturnType<typeof makeGetProductUseCase>;
