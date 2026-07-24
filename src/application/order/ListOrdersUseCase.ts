import type { OrderRepository } from "../ports/OrderRepository.js";
import type { PaginatedResult, PaginationInput } from "../shared/Pagination.js";
import { toOrderDTO, type OrderDTO } from "./OrderDTO.js";

type ListOrdersUseCaseDeps = {
  readonly orderRepository: OrderRepository;
};

export const makeListOrdersUseCase = (deps: ListOrdersUseCaseDeps) => {
  return async (pagination: PaginationInput): Promise<PaginatedResult<OrderDTO>> => {
    const { items, totalItems } = await deps.orderRepository.findPage(pagination);

    return {
      items: items.map(toOrderDTO),
      meta: {
        ...pagination,
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.pageSize),
      },
    };
  };
};

export type ListOrdersUseCase = ReturnType<typeof makeListOrdersUseCase>;
