import { type AppConfig } from "../infrastructure/config/env.js";
// import { logger } from "./../shared/Logger.js";

import { uuidGenerator } from "../shared/IdGenerator.js";
import { createPostgresPool } from "../infrastructure/database/postgres/createPostgresPool.js";

// import { makeInMemoryProductRepository } from "../infrastructure/repositories/memory/InMemoryProductRepository.js";
// import { makeInMemoryOrderRepository } from "../infrastructure/repositories/memory/InMemoryOrderRepository.js";
import { makePostgresProductRepository } from "../infrastructure/repositories/postgres/PostgresProductRepository.js";
import { makePostgresOrderRepository } from "../infrastructure/repositories/postgres/PostgresOrderRepository.js";

import { makeMinimumSubtotalDiscountPolicy } from "../domain/discount/policies/makeMinimumSubtotalDiscount.js";
import { makeBulkItemsDiscountPolicy } from "../domain/discount/policies/makeBulkItemsDiscount.js";
import { makeOrderDiscountService } from "../domain/discount/OrderDiscountService.js";

// import { createFakeEmailSender } from "../infrastructure/email/createFakeEmailSender.js";
// import { makeSendOrderConfirmationEmailHandler } from "../infrastructure/events/handlers/makeSendOrderConfirmationEmailHandler.js";
// import { makeLogOrderConfirmedHandler } from "../infrastructure/events/handlers/makeLogOrderConfirmedHandler.js";
// import { makeSyncDomainEventBus } from "../infrastructure/events/makeSyncDomainEventBus.js";

import { makeCreateProductUseCase } from "../application/product/CreateProductUseCase.js";
import { makeListProductsUseCase } from "../application/product/ListProductsUseCase.js";
import { makeGetProductUseCase } from "../application/product/GetProductUseCase.js";

import { makeAddItemToOrderUseCase } from "../application/order/AddItemToOrderUseCase.js";
import { makeConfirmOrderUseCase } from "../application/order/ConfirmOrderUseCase.js";
import { makeCreateOrderUseCase } from "../application/order/CreateOrderUseCase.js";
import { makeGetOrderUseCase } from "../application/order/GetOrderUseCase.js";
import { makeListOrdersUseCase } from "../application/order/ListOrdersUseCase.js";
import { makeCancelOrderUseCase } from "../application/order/CancelOrderUseCase.js";

import { makeOrderController } from "../infrastructure/http/controllers/OrderController.js";
import { makeProductController } from "../infrastructure/http/controllers/ProductController.js";

export const buildContainer = async (env: AppConfig) => {
  const db = createPostgresPool(env.database);

  const idGenerator = uuidGenerator;
  // const productRepository = makeInMemoryProductRepository();
  // const orderRepository = makeInMemoryOrderRepository();
  const productRepository = makePostgresProductRepository(db);
  const orderRepository = makePostgresOrderRepository(db);

  const minimumSubtotalDiscountPolicy = makeMinimumSubtotalDiscountPolicy();
  const bulkItemsDiscountPolicy = makeBulkItemsDiscountPolicy();
  const orderDiscountService = makeOrderDiscountService([
    minimumSubtotalDiscountPolicy,
    bulkItemsDiscountPolicy,
  ]);

  // const logOrderConfirmedHandler = makeLogOrderConfirmedHandler({
  //   logger,
  // });
  // const sendOrderConfirmationEmailHandler = makeSendOrderConfirmationEmailHandler({
  //   emailSender: createFakeEmailSender({ logger }),
  // });
  // const eventBus = makeSyncDomainEventBus({
  //   OrderConfirmed: [logOrderConfirmedHandler, sendOrderConfirmationEmailHandler],
  // });

  const createProductUseCase = makeCreateProductUseCase({ productRepository, idGenerator });
  const listProductsUseCase = makeListProductsUseCase({ productRepository });
  const getProductUseCase = makeGetProductUseCase({ productRepository });

  const createOrderUseCase = makeCreateOrderUseCase({ orderRepository, idGenerator });
  const listOrdersUseCase = makeListOrdersUseCase({ orderRepository });
  const getOrderUseCase = makeGetOrderUseCase({ orderRepository });
  const addItemToOrderUseCase = makeAddItemToOrderUseCase({
    orderRepository,
    productRepository,
    orderDiscountService,
  });
  const confirmOrderUseCase = makeConfirmOrderUseCase({
    orderRepository,
    // eventBus,
    idGenerator,
  });
  const cancelOrderUseCase = makeCancelOrderUseCase({ orderRepository });

  return {
    productController: makeProductController({
      createProductUseCase,
      listProductsUseCase,
      getProductUseCase,
    }),
    orderController: makeOrderController({
      createOrderUseCase,
      listOrdersUseCase,
      getOrderUseCase,
      addItemToOrderUseCase,
      confirmOrderUseCase,
      cancelOrderUseCase,
    }),
    close: async () => {
      await db.end();
    },
  };
};
