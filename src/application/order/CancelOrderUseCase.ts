import { AppError } from "../../shared/AppError.js";
import type { OrderRepository } from "../ports/OrderRepository.js";
import { toOrderDTO, type OrderDTO } from "./OrderDTO.js";

type CancelOrderDeps = {
  readonly orderRepository: OrderRepository;
};

export const makeCancelOrderUseCase = (deps: CancelOrderDeps) => {
  return async (orderId: string): Promise<OrderDTO> => {
    const order = await deps.orderRepository.findById(orderId);

    if (!order) {
      throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
    }

    order.cancel();
    await deps.orderRepository.save(order);

    return toOrderDTO(order);
  };
};

export type CancelOrderUseCase = ReturnType<typeof makeCancelOrderUseCase>;
