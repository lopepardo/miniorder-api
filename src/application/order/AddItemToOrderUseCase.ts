import { AppError } from "../../shared/AppError.js";
import type { OrderRepository } from "../ports/OrderRepository.js";
import type { ProductRepository } from "../ports/ProductRepository.js";
import type { OrderDiscountService } from "../../domain/discount/OrderDiscountService.js";
import { toOrderDTO, type OrderDTO } from "./OrderDTO.js";

type AddItemToOrderDeps = {
  readonly orderRepository: OrderRepository;
  readonly productRepository: ProductRepository;
  readonly orderDiscountService: OrderDiscountService;
};
export type AddItemToOrderInput = {
  orderId: string;
  productId: string;
  quantity: number;
};

export const makeAddItemToOrderUseCase = (deps: AddItemToOrderDeps) => {
  return async (input: AddItemToOrderInput): Promise<OrderDTO> => {
    const order = await deps.orderRepository.findById(input.orderId);

    if (!order) {
      throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
    }

    const product = await deps.productRepository.findById(input.productId);

    if (!product || !product.isActive) {
      throw new AppError("Product not found or inactive.", 404, "PRODUCT_NOT_FOUND");
    }

    order.addItem({
      productId: product.id,
      productName: product.name,
      unitPriceInCents: product.priceInCents,
      quantity: input.quantity,
    });

    const discounts = deps.orderDiscountService.calculate(order);
    order.addDiscounts(discounts);

    await deps.orderRepository.save(order);

    return toOrderDTO(order);
  };
};

export type AddItemToOrderUseCase = ReturnType<typeof makeAddItemToOrderUseCase>;
