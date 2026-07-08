import cors from "cors";
import express from "express";

import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { httpLoggerMiddleware } from "./middlewares/httpLoggerMiddleware.js";

import type { OrderController } from "./controllers/OrderController.js";
import type { ProductController } from "./controllers/ProductController.js";
import { createOrderRoutes } from "./routes/orderRoutes.js";
import { createProductRoutes } from "./routes/productRoutes.js";

export type AppDependencies = {
  productController: ProductController;
  orderController: OrderController;
};

export const createApp = (dependencies: AppDependencies): express.Express => {
  const app = express();

  app.use(cors());
  app.use(httpLoggerMiddleware);
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/products", createProductRoutes(dependencies.productController));
  app.use("/orders", createOrderRoutes(dependencies.orderController));

  app.use(errorMiddleware);

  return app;
};
