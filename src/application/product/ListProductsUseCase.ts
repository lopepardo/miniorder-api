import type { ProductRepository } from "../ports/ProductRepository.js";
import type { PaginatedResult, PaginationInput } from "../shared/Pagination.js";
import { toProductDTO, type ProductDTO } from "./ProductDTO.js";

type ListProductsUseCaseDeps = {
  readonly productRepository: ProductRepository;
};

export const makeListProductsUseCase = (deps: ListProductsUseCaseDeps) => {
  return async (pagination: PaginationInput): Promise<PaginatedResult<ProductDTO>> => {
    const { items, totalItems } = await deps.productRepository.findPage(pagination);

    return {
      items: items.map(toProductDTO),
      meta: {
        ...pagination,
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.pageSize),
      },
    };
  };
};

export type ListProductsUseCase = ReturnType<typeof makeListProductsUseCase>;
