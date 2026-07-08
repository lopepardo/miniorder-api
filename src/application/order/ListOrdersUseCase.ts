import type { OrderRepository } from "../ports/OrderRepository.js";
import { toOrderDTO, type OrderDTO } from "./OrderDTO.js";

type ListOrdersUseCaseDeps = {
  readonly orderRepository: OrderRepository;
};

export const makeListOrdersUseCase = (deps: ListOrdersUseCaseDeps) => {
  return async (): Promise<OrderDTO[]> => {
    const orders = await deps.orderRepository.findAll();
    return orders.map(toOrderDTO);
  };
};

export type ListOrdersUseCase = ReturnType<typeof makeListOrdersUseCase>;
