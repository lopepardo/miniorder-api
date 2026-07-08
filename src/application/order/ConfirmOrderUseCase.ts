import { AppError } from "../../shared/AppError.js";
import type { OrderRepository } from "../ports/OrderRepository.js";
// import type { DomainEventBus } from "../ports/DomainEventBus.js";
import type { GenerateId } from "../../shared/IdGenerator.js";
import { toOrderDTO, type OrderDTO } from "./OrderDTO.js";

type ConfirmOrderDeps = {
  readonly orderRepository: OrderRepository;
  // readonly eventBus: DomainEventBus;
  readonly idGenerator: GenerateId;
};

export const makeConfirmOrderUseCase = (deps: ConfirmOrderDeps) => {
  return async (orderId: string): Promise<OrderDTO> => {
    const order = await deps.orderRepository.findById(orderId);

    if (!order) {
      throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
    }

    order.confirm({
      eventId: deps.idGenerator(),
    });

    await deps.orderRepository.save(order);

    // await deps.eventBus.publishAll(order.pullDomainEvents());

    return toOrderDTO(order);
  };
};

export type ConfirmOrderUseCase = ReturnType<typeof makeConfirmOrderUseCase>;
