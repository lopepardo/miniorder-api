import { makeAddItemToOrderUseCase } from "./../../../../src/application/order/AddItemToOrderUseCase";
import { makeOrderDiscountService } from "./../../../../src/domain/discount/OrderDiscountService";
import { makeInMemoryOrderRepository } from "./../../../../src/infrastructure/repositories/memory/InMemoryOrderRepository";
import { describe, expect, it } from "vitest";
import { makeInMemoryProductRepository } from "../../../../src/infrastructure/repositories/memory/InMemoryProductRepository.js";
import { Order } from "../../../../src/domain/order/Order.js";
import { Product } from "../../../../src/domain/product/Product.js";

describe("AddItemToOrderUseCase", () => {
  it("creates and persists a order", async () => {
    const productRepository = makeInMemoryProductRepository();
    const orderRepository = makeInMemoryOrderRepository();
    const orderDiscountService = makeOrderDiscountService([]);

    const product = Product.create({ id: "product-1", name: "product 1", priceInCents: 500 });
    const order = Order.create({ id: "order-1" });
    productRepository.save(product);
    orderRepository.save(order);

    const useCase = makeAddItemToOrderUseCase({
      productRepository,
      orderRepository,
      orderDiscountService,
    });
    const addItemToOrder = await useCase({
      orderId: "order-1",
      productId: "product-1",
      quantity: 3,
    });

    expect(addItemToOrder).toMatchObject({
      id: "order-1",
      status: "draft",
      items: [
        {
          productId: "product-1",
          productName: "product 1",
          unitPriceInCents: 500,
          quantity: 3,
          subtotalInCents: 1500,
        },
      ],
      discounts: [],
      totalItems: 3,
      subtotalInCents: 1500,
      discountTotalInCents: 0,
      totalInCents: 1500,
    });
  });
});
