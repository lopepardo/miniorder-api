import { Order } from "../../domain/order/Order.js";
import type { GenerateId } from "../../shared/IdGenerator.js";
import type { OrderRepository } from "../ports/OrderRepository.js";
import { toOrderDTO, type OrderDTO } from "./OrderDTO.js";

type CreateOrderDeps = {
  readonly orderRepository: OrderRepository;
  readonly idGenerator: GenerateId;
};

export const makeCreateOrderUseCase = (deps: CreateOrderDeps) => {
  return async (): Promise<OrderDTO> => {
    const order = Order.create({ id: deps.idGenerator() });
    await deps.orderRepository.save(order);
    return toOrderDTO(order);
  };
};

export type CreateOrderUseCase = ReturnType<typeof makeCreateOrderUseCase>;
