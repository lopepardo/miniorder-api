import { AppError } from "../../shared/AppError.js";
import type { OrderRepository } from "../ports/OrderRepository.js";
import { toOrderDTO, type OrderDTO } from "./OrderDTO.js";

type GetOrderDeps = {
  readonly orderRepository: OrderRepository;
};

export const makeGetOrderUseCase = (deps: GetOrderDeps) => {
  return async (orderId: string): Promise<OrderDTO> => {
    const order = await deps.orderRepository.findById(orderId);

    if (!order) {
      throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
    }

    return toOrderDTO(order);
  };
};

export type GetOrderUseCase = ReturnType<typeof makeGetOrderUseCase>;
